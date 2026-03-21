import { eq, like, and, sql, desc, or } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, router } from "../index";
import { logs } from "@my-better-t-app/db/schema";

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

const timeRangeMinutes = {
  "30m": 30,
  "1h": 60,
  "24h": 1440,
  "7d": 10080,
} as const;

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

  getLogsWithCounts: publicProcedure
    .input(
      z.object({
        timeRange: z.enum(["30m", "1h", "24h", "7d"]).default("24h"),
        level: z.array(z.enum(["info", "warn", "error", "debug"])).optional(),
        statusMin: z.number().optional(),
        path: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(100),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { timeRange, level, statusMin, path, search, limit, offset } = input;

      const sinceMinutes = timeRangeMinutes[timeRange];
      const sinceTime = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString();

      const baseConditions = [sql`${logs.created_at} >= ${sinceTime}`];

      if (level && level.length > 0) {
        baseConditions.push(sql`${logs.level} IN (${sql.join(level.map(l => sql`${l}`), sql`, `)})`);
      }
      if (statusMin) {
        baseConditions.push(sql`${logs.status} >= ${statusMin}`);
      }
      if (path) {
        baseConditions.push(like(logs.path, `%${path}%`));
      }
      if (search) {
        baseConditions.push(
          or(
            like(logs.path, `%${search}%`),
            like(logs.data, `%${search}%`)
          )!
        );
      }

      const whereClause = and(...baseConditions);

      const [rows, countResult, levelCountsResult] = await Promise.all([
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
        ctx.db
          .select({
            level: logs.level,
            count: sql<number>`count(*)`,
          })
          .from(logs)
          .where(sql`${logs.created_at} >= ${sinceTime}`)
          .groupBy(logs.level),
      ]);

      const levelCounts = {
        error: 0,
        warn: 0,
        info: 0,
        debug: 0,
      };

      for (const row of levelCountsResult) {
        if (row.level in levelCounts) {
          levelCounts[row.level as keyof typeof levelCounts] = row.count;
        }
      }

      return {
        logs: rows,
        total: countResult[0]?.count ?? 0,
        levelCounts,
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
