# Nxbazaar.in AI Security Plan

## Task 1 Security Update - 2026-07-25

- AI product generation is draft-only. The route writes `AiGeneration` audit/draft data but does not create, update, or publish `Product` records.
- Product generation responses are validated with Zod before returning to the client; malformed provider JSON falls back to a safe draft.
- AI-generated HSN/GST is not authoritative. Product form applies existing category/subcategory mapping only and shows: `HSN/GST mapping needs manual review before publishing or invoicing.`
- Feedback now requires authenticated ownership when `conversationId` or `messageId` is supplied.
- Seller assistant data is scoped to `session.user.id` and does not accept client-provided seller identity.
- Admin insights are restricted to `ADMIN` and `MODERATOR`.
- AI audit logging stores prompt hashes/safe metadata and redacts sensitive error strings.

## Authentication And Authorization

- Shopping assistant can support anonymous product discovery, but order/account actions require authenticated users.
- Product generator requires `ADMIN`, `MODERATOR`, `SELLER`, or `FARMER`.
- Admin insights require `ADMIN` or `MODERATOR`.
- Seller assistant requires `SELLER` or `FARMER`.
- Customer support order queries require authenticated `USER` and must use `session.user.id`.
- Seller data queries must use `session.user.id` as seller ID.

## Prompt Injection Controls

- System prompts must state that only provided database facts can be used.
- User prompts must never be concatenated into system instructions.
- Reject or neutralize requests such as "ignore previous instructions", "show secrets", "run SQL", "list all users", or "switch role".
- Do not expose internal prompts in responses.

## Database Controls

- LLM must never receive Prisma client or raw SQL access.
- All database reads go through allowlisted functions.
- Product recommendations must include product IDs returned by Prisma.
- Support answers must fetch orders by `userId` from session.
- Seller insights must filter by `sellerId` from session.

## Logging

- Store request hash, feature, role, status, token usage, latency, and safe metadata.
- Do not store API keys, passwords, tokens, full addresses, raw payment payloads, or unredacted provider errors.
- Mask email, phone, address, and payment identifiers in AI logs and responses where not necessary.

## Rate Limiting

- Apply per-feature and per-user/IP limits.
- Use Redis for production.
- Keep in-memory fallback only for local development and tests.

## Safe Failure

- If provider is disabled or unavailable, return deterministic fallback responses.
- Existing keyword search, checkout, products, and dashboard pages must continue working.
- Do not auto-save generated product content.
