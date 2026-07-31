# Nxbazaar.in AI Setup Guide

## Environment

Add these keys to local and production environments:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=
AI_ENABLED=true
```

Do not expose these keys with `NEXT_PUBLIC_`.

## Required Services

- PostgreSQL for application data and full-text search.
- Redis for production AI rate limiting and async jobs.
- AI provider account for the configured provider.

## Rollout Plan

1. Deploy AI foundation with `AI_ENABLED=false`.
2. Apply additive Prisma migration.
3. Run `prisma validate`, `tsc --noEmit`, `eslint .`, `node --import tsx --test tests/*.test.ts`, and `next build`.
4. Enable internal/admin-only AI endpoints.
5. Enable seller generation and seller assistant.
6. Enable customer-facing shopping assistant and semantic search after monitoring is ready.

## Available Routes

- `POST /api/ai/product-search`
- `POST /api/ai/shopping-assistant`
- `POST /api/ai/product-generate`
- `GET /api/ai/admin-insights`
- `GET /api/ai/seller-assistant`
- `POST /api/ai/feedback`

The provider key is used only in server route handlers. Do not add `OPENAI_API_KEY` to client code or `NEXT_PUBLIC_*` variables.

## Operational Checks

- Confirm AI logs do not contain secrets or raw PII.
- Confirm provider failures do not break normal search or checkout.
- Confirm seller and customer data isolation with cross-account tests.
- Confirm product recommendations link only to active available products.
