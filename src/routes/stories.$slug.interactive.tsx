import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/stories/$slug/interactive")({
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Interactive Profile Not Found</h1>
        <p className="text-muted-foreground mb-8">The story you're looking for doesn't exist.</p>
        <Link to="/explore" className="text-[#C8A96A] hover:text-white transition-colors">
          Back to Explore
        </Link>
      </div>
    </div>
  ),
});
