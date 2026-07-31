https://byby.dev/react-carousel-components
https://formidable.com/open-source/nuka-carousel/

## Translation Queue

Phase 2 translations run outside the Next.js request lifecycle. The web app saves the entity and English translation in PostgreSQL first, then enqueues Hindi and Marathi jobs in Redis through BullMQ. A separate worker process consumes those jobs and upserts translated records.

Development:

```bash
pnpm redis:up
pnpm dev
pnpm worker:translations:watch
```

Redis check:

```bash
pnpm redis:check
```

Production must run the worker as a separate process or service:

```bash
pnpm worker:translations
```

Do not start the permanent BullMQ worker from a serverless request function.
