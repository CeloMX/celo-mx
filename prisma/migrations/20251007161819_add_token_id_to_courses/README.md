# 20251007161819_add_token_id_to_courses

This migration is recreated locally to align Prisma migration history with the production database.

- Adds `tokenId TEXT` to `Course` (no-op if already present).
- Prevents Prisma from requesting a destructive reset due to drift.
