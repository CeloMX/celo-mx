"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  user?: { id: string; displayName?: string };
}

interface ReviewsState {
  loading: boolean;
  error?: string;
  average: number | null;
  count: number;
  myReview?: ReviewItem;
  canReview: boolean;
  load: (slug: string) => Promise<void>;
  createOrUpdate: (slug: string, input: { rating: number; comment?: string }) => Promise<void>;
  remove: (slug: string) => Promise<void>;
}

const ReviewsContext = createContext<ReviewsState | null>(null);

export function ReviewsProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [average, setAverage] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);
  const [myReview, setMyReview] = useState<ReviewItem | undefined>(undefined);
  const [canReview, setCanReview] = useState<boolean>(false);

  const load = async (slugArg: string) => {
    setLoading(true); setError(undefined);
    try {
      const [aggRes, meRes, eligRes] = await Promise.all([
        fetch(`/api/courses/${slugArg}/reviews`, { cache: 'no-store' }),
        fetch(`/api/courses/${slugArg}/reviews/me`, { cache: 'no-store' }),
        fetch(`/api/courses/${slugArg}/reviews/eligibility`, { cache: 'no-store' }),
      ]);
      if (aggRes.ok) {
        const agg = await aggRes.json();
        setAverage(agg.average ?? null);
        setCount(agg.count ?? 0);
      }
      if (meRes.ok) {
        const me = await meRes.json();
        setMyReview(me.review);
      } else {
        setMyReview(undefined);
      }
      if (eligRes.ok) {
        const el = await eligRes.json();
        setCanReview(!!el.canReview);
      } else {
        setCanReview(false);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdate = async (slugArg: string, input: { rating: number; comment?: string }) => {
    setError(undefined);
    // optimistic
    setMyReview((r) => ({ id: r?.id || 'temp', rating: input.rating, comment: input.comment }));
    try {
      const res = await fetch(`/api/courses/${slugArg}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw new Error('Failed to submit review');
      }
      await load(slugArg);
    } catch (e: any) {
      setError(e?.message || 'Failed to submit review');
    }
  };

  const remove = async (slugArg: string) => {
    setError(undefined);
    try {
      const res = await fetch(`/api/courses/${slugArg}/reviews/me`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete review');
      await load(slugArg);
    } catch (e: any) {
      setError(e?.message || 'Failed to delete review');
    }
  };

  useEffect(() => { if (slug) void load(slug); }, [slug]);

  const value = useMemo<ReviewsState>(() => ({
    loading, error, average, count, myReview, canReview, load, createOrUpdate, remove,
  }), [loading, error, average, count, myReview, canReview]);

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}
