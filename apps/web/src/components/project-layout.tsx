import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, FileText, Settings, Terminal } from "lucide-react";

const navItems: { to: string; label: string; icon: typeof BarChart3 }[] = [
  { to: "/project", label: "Overview", icon: BarChart3 },
  { to: "/project/logs", label: "Logs", icon: Terminal },
  { to: "/project/settings", label: "Settings", icon: Settings },
];

interface ProjectLayoutProps {
  children: ReactNode;
}

export function ProjectLayout({ children }: ProjectLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      <aside className="w-44 border-r border-border flex flex-col py-2">
        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/project" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}

export function ProjectHeader({
  projectName,
  projectSlug,
  liveMode = false,
  onToggleLive,
}: {
  projectName: string;
  projectSlug: string;
  liveMode?: boolean;
  onToggleLive?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
      <div className="flex items-center gap-2text-sm">
        <span className="font-medium text-foreground">{projectName}</span>
        <span className="text-muted-foreground">›</span>
        <span className="text-muted-foreground font-mono text-xs">
          {projectSlug}
        </span>
      </div>

      <button
        onClick={onToggleLive}
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
  );
}