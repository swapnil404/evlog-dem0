import { createFileRoute } from "@tanstack/react-router";
import { ProjectLayout } from "@/components/project-layout";

export const Route = createFileRoute("/project/settings")({
  component: ProjectSettings,
});

function ProjectSettings() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Project Settings</h2>
      </div>
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Settings coming soon...
      </div>
    </div>
  );
}