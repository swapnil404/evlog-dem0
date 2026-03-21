import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@my-better-t-app/api/context";
import { appRouter } from "@my-better-t-app/api/routers/index";
import { auth } from "@my-better-t-app/auth";
import { db } from "@my-better-t-app/db";
import { env } from "@my-better-t-app/env/server";
import { logs } from "@my-better-t-app/db/schema/logs";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { DrainContext } from "evlog";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

app.post('/ingest', async (c) => {
  const ctx = await c.req.json<DrainContext>()
  const id = crypto.randomUUID()
  const event = ctx.event
  const request = ctx.request

  const errorField = event.error ? JSON.stringify(event.error) : null
  const method: string | null = request?.method ?? null
  const path: string | null = request?.path ?? null
  const status: number | null = typeof event.status === 'number' ? event.status : null

  await db.insert(logs).values({
    id,
    timestamp: event.timestamp,
    level: event.level,
    service: event.service,
    environment: event.environment,
    method,
    path,
    status,
    duration_ms: null,
    request_id: request?.requestId ?? null,
    error: errorField,
    data: JSON.stringify(event),
    created_at: new Date().toISOString(),
  })

  return c.json({ ok: true, id })
})

export default app;
