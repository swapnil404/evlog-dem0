import { createFileRoute, redirect } from "@tanstack/react-router";
import { LogViewer } from "@/components/log-viewer";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/logs")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
  },
  component: ProjectLogs,
});

function ProjectLogs() {
  return <LogViewer projectName="my-project" projectSlug="proj_abc123" />;
}
