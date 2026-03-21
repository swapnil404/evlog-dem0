import { eq, like, and, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, router } from "../index";
import { logs } from "@my-better-t-app/db/schema/logs";

const logSelect = {
  id: logs.id,
  timestamp: logs.timestamp,
  level: logs.level,
  service: logs.service,
  environment: logs.environment,
  method: logs.method,
  path: logs.path,
  status: logs.status,
  duration_ms: logs.duration_ms,
  request_id: logs.request_id,
  error: logs.error,
  data: logs.data,
  created_at: logs.created_at,
};

export const logsRouter = router({
  getLogs: publicProcedure
    .input(
      z.object({
        level: z.enum(["info", "warn", "error", "debug"]).optional(),
        status: z.number().optional(),
        path: z.string().optional(),
        service: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { level, status, path, service, limit, offset } = input;

      const conditions = [];

      if (level) {
        conditions.push(eq(logs.level, level));
      }
      if (status) {
        conditions.push(sql`${logs.status} >= ${status}`);
      }
      if (path) {
        conditions.push(like(logs.path, `%${path}%`));
      }
      if (service) {
        conditions.push(eq(logs.service, service));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, countResult] = await Promise.all([
        ctx.db
          .select(logSelect)
          .from(logs)
          .where(whereClause)
          .orderBy(desc(logs.timestamp))
          .limit(limit)
          .offset(offset),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(logs)
          .where(whereClause),
      ]);

      return {
        logs: rows,
        total: countResult[0]?.count ?? 0,
        limit,
        offset,
      };
    }),

  getLog: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select(logSelect)
        .from(logs)
        .where(eq(logs.id, input.id))
        .limit(1);
      return row ?? null;
    }),
});
