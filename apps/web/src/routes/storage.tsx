import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/storage")({
  component: StoragePage,
});

function StoragePage() {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      Storage settings coming soon...
    </div>
  );
}