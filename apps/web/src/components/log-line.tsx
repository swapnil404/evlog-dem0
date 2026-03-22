import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface LogLineProps {
  log: {
    id: string;
    timestamp: string;
    level: string;
    service: string;
    method?: string | null;
    path?: string | null;
    status?: number | null;
    duration_ms?: number | null;
    data: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

const levelColors: Record<string, string> = {
  error: "text-destructive",
  warn: "text-yellow-500",
  info: "text-blue-500",
  debug: "text-muted-foreground",
};

const statusColors: Record<string, string> = {
  "2": "text-green-500",
  "3": "text-yellow-500",
  "4": "text-orange-500",
  "5": "text-destructive",
};

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getStatusColor(status: number | null | undefined): string {
  if (!status) return "text-muted-foreground";
  const prefix = String(status)[0] as keyof typeof statusColors;
  return statusColors[prefix] || "text-muted-foreground";
}

export function LogLine({ log, isExpanded, onToggle }: LogLineProps) {
  const levelClass = levelColors[log.level] || "text-muted-foreground";
  const statusClass = getStatusColor(log.status);

  return (
    <div className="group">
      <div
        className="flex items-center gap-2 px-2 py-1 hover:bg-muted/50 cursor-pointer font-mono text-xs"
        onClick={onToggle}
      >
        <button className="p-0 hover:bg-transparent">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          )}
        </button>

        <span className="text-muted-foreground w-16 shrink-0">
          {formatTimestamp(log.timestamp)}
        </span>

        <span className={`${levelClass} w-12 shrink-0 uppercase text-[10px] font-semibold`}>
          {log.level}
        </span>

        {log.method && (
          <span className="text-cyan-500 w-10 shrink-0">{log.method}</span>
        )}

        {log.path && (
          <span className="text-foreground truncate max-w-[200px]">
            {log.path}
          </span>
        )}

        {log.status && (
          <span className={`${statusClass} ml-auto shrink-0`}>
            {log.status}
          </span>
        )}

        {log.duration_ms && (
          <span className="text-muted-foreground w-16 text-right shrink-0">
            {log.duration_ms}ms
          </span>
        )}
      </div>

      {isExpanded && (
        <div className="ml-6 mr-2 mb-2 p-2 bg-muted/30 rounded border border-border overflow-x-auto">
          <pre className="text-xs text-foreground font-mono whitespace-pre-wrap">
            {JSON.stringify(JSON.parse(log.data), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}