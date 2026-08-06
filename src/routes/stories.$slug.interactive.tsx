import { createFileRoute } from "@tanstack/react-router";
import { ErrorExperience } from "@/components/common/error/ErrorExperience";

export const Route = createFileRoute("/stories/$slug/interactive")({
  notFoundComponent: () => <ErrorExperience type="404" />,
});
