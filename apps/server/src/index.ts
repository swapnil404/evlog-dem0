import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@dumper/api/context";
import { appRouter } from "@dumper/api/routers/index";
import { auth } from "@dumper/auth";
import { env } from "@dumper/env/server";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@dumper/db/schema";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { DrainContext } from "evlog";
import type { D1Database } from "@cloudflare/workers-types";

type CloudflareEnv = {
  DB: D1Database;
  CORS_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  POLAR_ACCESS_TOKEN: string;
  POLAR_SUCCESS_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
};

const app = new Hono<{ Bindings: CloudflareEnv }>();

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

  try {
    const d1 = c.env.DB
    console.log('D1 binding:', d1)
    console.log('Inserting log:', { id, level: event.level, service: event.service })

    const localDb = drizzle(d1, { schema })

    await localDb.insert(schema.logs).values({
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

    console.log('Insert successful:', id)
  } catch (err) {
    console.error('Insert failed:', err)
    return c.json({ ok: false, error: String(err) }, 500)
  }

  return c.json({ ok: true, id })
})

export default app;
