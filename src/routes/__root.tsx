import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { stories, categories, useStoriesData } from "../lib/stories-data";
import { getInitialStoriesAndCategories } from "../lib/api/stories.functions";
import { CinematicLoader } from "../components/site/CinematicLoader";
import { initAuthListener, useAuthStore } from "../lib/auth-store";
import PodcastPlayer from "../components/audio/PodcastPlayer";
import { GlobalSearch } from "../components/common/GlobalSearch";

if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    let url = "";
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else if (input && typeof input === "object" && "url" in input) {
      url = (input as any).url;
    }

    if (url.startsWith("/api/admin") || url.includes("/api/admin")) {
      const session = useAuthStore.getState().session;
      if (session?.access_token) {
        init = init || {};
        const headers = new Headers(init.headers || {});
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${session.access_token}`);
        }
        init.headers = headers;
      }
    }
    return originalFetch(input, init);
  };
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-gradient-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Story not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-gold to-saffron px-5 py-2.5 text-sm font-medium text-gold-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-gold to-saffron px-4 py-2 text-sm font-medium text-gold-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/10"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "India Story Project — Premium Stories from Modern India" },
      {
        name: "description",
        content:
          "Experience India's stories of changemakers, innovators, and heroes — told with cinematic depth.",
      },
      { name: "author", content: "India Story Project" },
      { property: "og:title", content: "India Story Project" },
      { property: "og:description", content: "Premium storytelling from across India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", type: "image/jpeg", href: "/Logo-ISP.jpg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  loader: async () => {
    return getInitialStoriesAndCategories();
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const loaderData = Route.useLoaderData() as any;
  const initialData = {
    stories: loaderData?.stories || [],
    themes: loaderData?.themes || categories,
    categories: loaderData?.categories || categories,
    heroSlides: loaderData?.heroSlides || [],
    featuredStory: loaderData?.featuredStory || null,
    trendingStories: loaderData?.trendingStories || [],
    stateCounts: loaderData?.stateCounts || {},
  };
  const serialized = JSON.stringify(initialData).replace(/</g, "\\u003c");

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="icon" type="image/jpeg" href="/Logo-ISP.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b0000" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "India Story Project",
              "url": "https://indiastoryproject.com",
              "logo": "https://indiastoryproject.com/Logo-ISP.jpg",
              "sameAs": [
                "https://www.instagram.com/indiastoryproject/",
                "https://www.youtube.com/@indiastoryproject7282",
                "https://www.linkedin.com/company/india-story-project/"
              ]
            })
          }}
        />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__STORIES_DATA__ = ${serialized};`,
          }}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Subscribe to stories-data updates
  useStoriesData();

  // Initialize auth listener and Service Worker
  useEffect(() => {
    const unsubscribe = initAuthListener();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(console.error);
      });
    }

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CinematicLoader />

      <Outlet />

      <PodcastPlayer />

      <GlobalSearch />

      <Analytics />
      <SpeedInsights />
    </QueryClientProvider>
  );
}
