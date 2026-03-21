import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const logs = sqliteTable("logs", {
  id: text("id").primaryKey(),
  timestamp: text("timestamp").notNull(),
  level: text("level").notNull(),
  service: text("service").notNull(),
  environment: text("environment"),
  method: text("method"),
  path: text("path"),
  status: integer("status"),
  duration_ms: integer("duration_ms"),
  request_id: text("request_id"),
  error: text("error"),
  data: text("data").notNull(),
  created_at: text("created_at").notNull(),
});
