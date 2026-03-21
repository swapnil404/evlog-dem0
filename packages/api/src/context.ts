import { auth } from "@my-better-t-app/auth";
import { drizzle } from "drizzle-orm/d1";
import type { Context as HonoContext } from "hono";
import * as schema from "@my-better-t-app/db/schema";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  const d1 = context.env.DB;
  const db = drizzle(d1, { schema });

  return {
    auth: null,
    session,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
