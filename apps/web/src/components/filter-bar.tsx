import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@dumper/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dumper/ui/components/dropdown-menu";

interface FilterBarProps {
  onSearch?: (query: string) => void;
  onLevelChange?: (level: string | null) => void;
  onTimeRangeChange?: (range: string) => void;
  activeLevel?: string | null;
  activeTimeRange?: string;
}

const levels = ["error", "warn", "info", "debug"] as const;
const timeRanges = ["30m", "1h", "24h", "7d"] as const;

export function FilterBar({
  onSearch,
  onLevelChange,
  onTimeRangeChange,
  activeLevel,
  activeTimeRange = "24h",
}: FilterBarProps) {
  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full h-8 pl-8 pr-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
            Level: {activeLevel || "all"}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[80px]">
<DropdownMenuItem onClick={() => onLevelChange?.(null)}>
            All levels
          </DropdownMenuItem>
          {levels.map((level) => (
            <DropdownMenuItem
              key={level}
              onClick={() => onLevelChange?.(level)}
              className="capitalize"
            >
              {level}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
            {activeTimeRange}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[80px]">
          {timeRanges.map((range) => (
            <DropdownMenuItem
              key={range}
              onClick={() => onTimeRangeChange?.(range)}
            >
              Last {range}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}