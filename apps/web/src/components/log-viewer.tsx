import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { FilterBar } from "./filter-bar";
import { LogLine } from "./log-line";

interface Log {
  id: string;
  timestamp: string;
  level: string;
  service: string;
  method: string | null;
  path: string | null;
  status: number | null;
  duration_ms: number | null;
  data: string;
}

interface LogViewerProps {
  projectName?: string;
  projectSlug?: string;
}

export function LogViewer({
  projectName = "my-project",
  projectSlug = "proj_abc123",
}: LogViewerProps) {
  const [liveMode, setLiveMode] = useState(false);
  const [timeRange, setTimeRange] = useState("24h");
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [displayedLogs, setDisplayedLogs] = useState<Log[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch } = useQuery(
    trpc.logs.getLogsWithCounts.queryOptions({
      timeRange: timeRange as "30m" | "1h" | "24h" | "7d",
      level: levelFilter
        ? [levelFilter as "error" | "warn" | "info" | "debug"]
        : undefined,
      search: searchQuery || undefined,
      limit: 100,
      offset: 0,
    })
  );

  const logs = (data?.logs ?? []) as Log[];

  const toggleExpanded = useCallback((id: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleLiveMode = useCallback(() => {
    setLiveMode((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [liveMode, refetch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedLogs.length < logs.length) {
          setDisplayedLogs((prev) => [
            ...prev,
            ...logs.slice(prev.length, prev.length + 50),
          ]);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [logs, displayedLogs.length]);

  useEffect(() => {
    setDisplayedLogs(logs.slice(0, 50));
  }, [logs]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">{projectName}</span>
          <span className="text-muted-foreground">{">"}</span>
          <span className="text-muted-foreground font-mono text-xs">
            {projectSlug}
          </span>
        </div>

        <button
          onClick={toggleLiveMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            liveMode
              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              liveMode ? "bg-destructive animate-pulse" : "bg-muted-foreground"
            }`}
          />
          {liveMode ? "LIVE" : "PAUSED"}
        </button>
      </div>

      <FilterBar
        onSearch={setSearchQuery}
        onLevelChange={setLevelFilter}
        onTimeRangeChange={setTimeRange}
        activeLevel={levelFilter}
        activeTimeRange={timeRange}
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : displayedLogs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No logs found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayedLogs.map((log) => (
              <LogLine
                key={log.id}
                log={log}
                isExpanded={expandedLogs.has(log.id)}
                onToggle={() => toggleExpanded(log.id)}
              />
            ))}
            <div ref={loadMoreRef} className="h-8" />
          </div>
        )}
      </div>
    </div>
  );
}