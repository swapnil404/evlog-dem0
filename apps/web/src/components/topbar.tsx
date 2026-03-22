import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Database } from "lucide-react";
import UserMenu from "./user-menu";

const tabs: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/project", label: "Project", icon: LayoutDashboard },
  { to: "/storage", label: "Storage", icon: Database },
];

export function Topbar() {
  const location = useLocation();

  return (
    <header className="h-11 flex items-center justify-between px-4 border-b border-border bg-background">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-[10px] font-bold">D</span>
          </div>
          <span className="text-sm font-semibold text-foreground">dumper</span>
        </Link>

        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <UserMenu />
    </header>
  );
}