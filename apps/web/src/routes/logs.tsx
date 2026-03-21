import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { trpc } from "@/utils/trpc";
import { Sidebar } from "@/components/logs/sidebar";
import { SearchBar } from "@/components/logs/search-bar";
import { LogTable } from "@/components/logs/log-table";

const searchSchema = z.object({
  timeRange: z.enum(["30m", "1h", "24h", "7d"]).default("24h"),
  level: z.array(z.enum(["error", "warn", "info", "debug"])).optional(),
  statusMin: z.number().optional(),
  path: z.string().optional(),
  search: z.string().optional(),
  offset: z.number().optional(),
});

export type LogSearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/logs")({
  component: LogExplorer,
  validateSearch: searchSchema.parse,
});

function LogExplorer() {
  const searchParams = useSearch({ from: "/logs" }) as LogSearchParams;
  const navigate = useNavigate({ from: "/logs" });

  const { data, isLoading } = useQuery(
    trpc.logs.getLogsWithCounts.queryOptions({
      timeRange: searchParams.timeRange ?? "24h",
      level: searchParams.level,
      statusMin: searchParams.statusMin,
      path: searchParams.path,
      search: searchParams.search,
      limit: 100,
      offset: searchParams.offset ?? 0,
    })
  );

  const logs = data?.logs ?? [];
  const levelCounts = data?.levelCounts;
  const total = data?.total ?? 0;
  const hasMore = logs.length >= 100;

  const handleLoadMore = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        offset: (searchParams.offset ?? 0) + logs.length,
      }),
    });
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-zinc-950">
      <Sidebar levelCounts={levelCounts} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
          <h1 className="text-sm font-semibold text-zinc-100">Logs</h1>
          <span className="text-xs text-zinc-500">
            {total.toLocaleString()} logs
          </span>
        </div>

        <SearchBar />

        <LogTable
          logs={logs as Array<{
            id: string;
            timestamp: string;
            level: string;
            service: string;
            method: string | null;
            path: string | null;
            status: number | null;
            duration_ms: number | null;
            data: string;
            created_at: string;
          }>}
          isLoading={isLoading}
          onLoadMore={hasMore ? handleLoadMore : undefined}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
}
