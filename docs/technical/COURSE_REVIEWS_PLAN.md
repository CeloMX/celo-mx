# Course Reviews Feature - Design & Implementation Plan

## Goals
- Allow enrolled students who completed a course to submit a star rating (1–5) and a comment.
- Display aggregate rating (average) and count on course detail and course cards.
- Prevent duplicate reviews per user/course; allow user to update/delete their own review.
- Revalidate server-rendered pages and update client UI without reload.

## Scope
- Server: API routes under `app/api/courses/[slug]/reviews/*`
- Client: New `ReviewsContext` to manage review state/actions; integrate in `app/academy/[slug]` UI
- Data: New Prisma `CourseReview` model (plan), aggregation in `Course.rating` and `Course.ratingCount` (optional denormalization)

## Data Model (Prisma) [Plan]
Add model (migration in a separate PR):
```
model CourseReview {
  id         String   @id @default(cuid())
  userId     String
  courseId   String
  rating     Int      // 1..5
  comment    String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id])
  course     Course   @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId]) // one review per user/course
}
```
Completion check (server): consider a course completed when all published lessons for the course have a `UserLessonProgress` row with `status=COMPLETED` for the user.

## Access Control
- Auth required: extract user via `getAuthenticatedUser` and `getUserWalletAddress`.
- Enrollment required: verify `CourseEnrollment` exists for (userId, courseId) OR on-chain enrolled (fallback via `isUserEnrolledInCourse`).
- Completion required: all published lessons completed (see above) OR on-chain proof if contract supports it (future).

## API Design
Base: `/api/courses/[slug]/reviews`
- `GET /api/courses/[slug]/reviews` → list reviews (paginated), aggregate: `{ average, count, items: [...] }`
  - Query: `?page=1&limit=20`
- `GET /api/courses/[slug]/reviews/me` → current user review or 404
- `POST /api/courses/[slug]/reviews` → create or upsert current user review `{ rating: number, comment?: string }`
  - Validations: rating 1..5; enrolled+completed
  - On success: return updated aggregate `{ average, count, review }`
  - Revalidate: `revalidatePath('/academy')`, `revalidatePath('/academy/[slug]')`
- `PATCH /api/courses/[slug]/reviews/me` → update current user review `{ rating?, comment? }`
  - Same validations; revalidate
- `DELETE /api/courses/[slug]/reviews/me` → delete current user review
  - Revalidate

Notes:
- Secure rate-limiting can leverage existing middleware.
- Use `prisma.course.findUnique({ where: { slug } })` to resolve `courseId`.
- Aggregates: `prisma.courseReview.aggregate({ _avg: { rating: true }, _count: true })` and/or maintain denormalized `Course.rating`/`ratingCount` in a transaction for fast list queries.

## ReviewsContext (Client)
File: `lib/contexts/ReviewsContext.tsx`
- State
  - `average: number | null`
  - `count: number`
  - `myReview?: { rating: number; comment?: string; id: string }`
  - `loading: boolean`
  - `error?: string`
- Actions
  - `load(courseSlug: string)`: fetch aggregates + my review
  - `createOrUpdate({ rating, comment })`: POST to create/update, optimistic update
  - `remove()`: DELETE my review, optimistic update
  - `canReview: boolean` (derived from server response flag or separate endpoint)
- Effects
  - Load on mount or slug change
  - On success, emit events or callbacks to update CourseHeader numbers locally

## UI Integration (app/academy/[slug])
- Components to add:
  - `ReviewsPanel`: shows average stars, count, list of recent reviews (lazy/paginated)
  - `ReviewForm`: star selector + textarea; disabled unless `canReview`
- Where to render:
  - In `CourseDetailClient` sidebar below enrollment / progress, or under curriculum section
  - Replace static rating placeholder in `CourseHeader` with live `average` and `count` when available (fallback to course defaults)
- Flow
  1) On course page load: ReviewsContext loads aggregate + my review
  2) If user is eligible (enrolled+completed): form enabled; on submit -> `createOrUpdate`
  3) After submit/update/delete: context updates and header reflects new average/count; revalidate server paths in background

## Server Eligibility Check Endpoint (optional)
- `GET /api/courses/[slug]/reviews/eligibility` → `{ canReview: boolean, reason?: 'NOT_ENROLLED'|'NOT_COMPLETED' }`
  - Uses same logic as POST but read-only, for UI gating

## Caching & Revalidation
- Client fetches with `cache: 'no-store'`
- On write operations (POST/PATCH/DELETE), call `revalidatePath('/academy')` and `revalidatePath('/academy/[slug]')` so server lists reflect new aggregates without manual reload

## Testing Strategy
- Unit: API validation (rating bounds, auth, eligibility), aggregate correctness
- Integration: context actions optimistic updates, revalidation triggers
- E2E: enroll → complete lessons → submit review → see header and list counts update

## Rollout Plan
1) Add Prisma model + migration (separate commit) and run `prisma migrate dev`
2) Implement API routes
3) Implement ReviewsContext
4) Integrate UI (panel + header)
5) Revalidation hooks
6) Tests
7) Deploy behind feature flag if desired

## Tasks (checklist)
- [ ] Prisma: add `CourseReview` model + migration
- [ ] API: list, me, create/update/delete, eligibility
- [ ] Context: `lib/contexts/ReviewsContext.tsx`
- [ ] UI: `ReviewsPanel`, `ReviewForm`, header aggregation
- [ ] Revalidation on writes
- [ ] Tests (unit/integration/e2e)
