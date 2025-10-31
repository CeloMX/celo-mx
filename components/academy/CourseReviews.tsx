"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userId: string;
}

interface CourseReviewsProps {
  courseSlug: string;
  isEnrolled: boolean;
  hasCompleted: boolean;
}

export function CourseReviews({
  courseSlug,
  isEnrolled,
  hasCompleted,
}: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [courseSlug]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseSlug}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.items || []);
        setAverageRating(data.average);
        setTotalCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !rating) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });

      if (res.ok) {
        setRating(0);
        setComment("");
        fetchReviews();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  const canReview = user && isEnrolled && hasCompleted;
  
  console.log('[COURSE REVIEWS] Review eligibility:', {
    user: user ? 'authenticated' : 'not authenticated',
    isEnrolled,
    hasCompleted,
    canReview,
    courseSlug,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Reseñas</h2>
        {averageRating !== null && totalCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-semibold">{averageRating.toFixed(1)}</span>
            </div>
            <span>({totalCount} {totalCount === 1 ? "reseña" : "reseñas"})</span>
          </div>
        )}
      </div>

      {canReview && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Calificación
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Comentario (opcional)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comparte tu experiencia con este curso..."
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={!rating || submitting}>
                {submitting ? "Enviando..." : "Enviar Reseña"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!canReview && user && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              {!isEnrolled
                ? "Debes estar inscrito para dejar una reseña."
                : "Completa el curso para dejar una reseña."}
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }) : 'Fecha no disponible'}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-foreground">{review.comment}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Aún no hay reseñas para este curso.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
