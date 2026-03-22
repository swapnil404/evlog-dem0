import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ProjectLayout } from "@/components/project-layout";

export const Route = createFileRoute("/project")({
  component: ProjectLayoutWrapper,
});

function ProjectLayoutWrapper() {
  return (
    <ProjectLayout>
      <Outlet />
    </ProjectLayout>
  );
}