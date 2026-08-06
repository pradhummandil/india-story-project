import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Milestone } from "lucide-react";

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

interface StoryTimelineProps {
  events: TimelineEvent[];
}

export function StoryTimeline({ events }: StoryTimelineProps) {
  if (!events || events.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
      className="my-14 p-6 md:p-10 rounded-3xl bg-[#1A1816]/90 border border-[#FAF7F2]/15 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#FAF7F2]/10">
        <div className="w-10 h-10 rounded-xl bg-[#D32F2F]/20 border border-[#D32F2F]/40 flex items-center justify-center text-[#D32F2F]">
          <Milestone className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-white">Historical Journey & Milestones</h3>
          <p className="text-xs text-[#FAF7F2]/60">Chronological timeline of pivotal events in this story</p>
        </div>
      </div>

      <div className="relative pl-6 md:pl-8 space-y-8">
        {/* Continuous vertical timeline line */}
        <div className="absolute left-[11px] md:left-[15px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#D32F2F] via-[#D4AF37] to-[#D32F2F]" />

        {events.map((evt, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="relative flex flex-col md:flex-row md:items-start gap-4 group"
          >
            {/* Glowing Milestone Bullet */}
            <div className="absolute -left-[23px] md:-left-[27px] top-1.5 w-6 h-6 rounded-full bg-[#1A1816] border-2 border-[#D4AF37] flex items-center justify-center group-hover:scale-125 group-hover:bg-[#D32F2F] transition-all duration-300 shadow-lg shadow-[#D4AF37]/30">
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] group-hover:bg-white" />
            </div>

            <div className="md:w-32 flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FDE68A]">
                <Calendar className="w-3 h-3 text-[#D4AF37]" />
                {evt.year}
              </span>
            </div>

            <div className="flex-1 bg-[#24201D]/80 border border-[#FAF7F2]/10 rounded-2xl p-4 md:p-5 group-hover:border-[#D4AF37]/30 transition-all duration-300">
              <h4 className="text-base font-serif font-bold text-white mb-1">{evt.title}</h4>
              <p className="text-xs md:text-sm text-[#FAF7F2]/80 leading-relaxed">{evt.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
