import { createFileRoute } from "@tanstack/react-router";
import { ProjectLayout } from "@/components/project-layout";
import { LogViewer } from "@/components/log-viewer";

export const Route = createFileRoute("/project/logs")({
  component: ProjectLogs,
});

function ProjectLogs() {
  return <LogViewer projectName="my-project" projectSlug="proj_abc123" />;
}