import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Clock, Share2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Story } from "@/components/site/StoryCard";

export function StoryDetail({ story }: { story: Story }) {
  const shareStory = (platform: string) => {
    const url = `${window.location.origin}/stories/${story.slug}`;
    const title = story.title;
    const text = `Check out this inspiring story: ${title}`;

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        {story.image && (
          <>
            <img
              src={story.image}
              alt={story.imageAlt ?? story.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
          </>
        )}

        {/* Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-6 px-6">
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 text-white hover:text-gold transition-colors glass px-4 py-2 rounded-full"
          >
            <ArrowLeft className="size-4" />
            Back to Stories
          </Link>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end z-10 p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="inline-block mb-4 text-sm uppercase tracking-widest px-3 py-1 rounded-full glass text-white">
              {story.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              {story.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                {story.region}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                {story.readTime}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Story Excerpt */}
          <div className="mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed italic">
              {story.excerpt}
            </p>
          </div>

          {/* Story Content */}
          <div className="prose prose-invert max-w-none mb-12">
            <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
              {story.content}
            </p>
          </div>

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 pt-8 border-t border-foreground/10"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-lg mb-2">Share This Story</h3>
                <p className="text-sm text-muted-foreground">Inspire others with this amazing story</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => shareStory("twitter")}
                  className="p-3 rounded-full glass hover:bg-gold/10 transition-colors"
                  title="Share on Twitter"
                >
                  <svg
                    className="size-5 text-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 002.856-3.215 10.009 10.009 0 01-2.8.856 4.992 4.992 0 002.165-2.724c-.951.564-2.005.974-3.127 1.195a4.993 4.993 0 00-8.506 4.55A14.148 14.148 0 011.641 3.161a4.993 4.993 0 001.546 6.659 4.987 4.987 0 01-2.261-.556v.06a4.993 4.993 0 003.997 4.888 4.993 4.993 0 01-2.254.085 4.994 4.994 0 004.659 3.468A10.009 10.009 0 010 19.54a14.142 14.142 0 007.678 2.246c9.214 0 14.239-7.639 14.239-14.238 0-.217-.005-.434-.015-.651A10.12 10.12 0 0024 4.59z" />
                  </svg>
                </button>
                <button
                  onClick={() => shareStory("facebook")}
                  className="p-3 rounded-full glass hover:bg-gold/10 transition-colors"
                  title="Share on Facebook"
                >
                  <svg
                    className="size-5 text-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  onClick={() => shareStory("linkedin")}
                  className="p-3 rounded-full glass hover:bg-gold/10 transition-colors"
                  title="Share on LinkedIn"
                >
                  <svg
                    className="size-5 text-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => shareStory("whatsapp")}
                  className="p-3 rounded-full glass hover:bg-gold/10 transition-colors"
                  title="Share on WhatsApp"
                >
                  <svg
                    className="size-5 text-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.869 1.231c-1.477.891-2.666 2.214-3.282 3.72 1.088-1.086 2.309-2.009 3.74-2.952.8-.597 1.645-.1.27 2.214-.031 1.565.027 3.131.345 4.494.160-.309.321-.178.481 0 .799-1.079 1.432-2.151 1.97-3.309 1.336-2.769 1.579-5.064 1.579-7.698 0-1.02-.119-1.879-.36-2.600z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Related Stories Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 pt-8 border-t border-foreground/10"
          >
            <Link
              to="/stories"
              className="inline-flex items-center gap-2 text-gold hover:text-saffron transition-colors text-lg font-semibold"
            >
              <ArrowLeft className="size-4" />
              Explore More Stories
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
