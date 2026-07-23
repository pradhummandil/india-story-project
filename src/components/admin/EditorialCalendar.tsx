import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertCircle,
  UserCheck,
  Clock,
  Sparkles,
  Layers,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoryCalendarItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  scheduledAt?: string;
  publishedAt?: string;
  assignedEditor?: { name: string; email: string };
  state?: { name: string; slug: string };
}

interface EditorialCalendarProps {
  stories: StoryCalendarItem[];
  missingStates?: string[];
  stateCoverageHeatmap?: Record<string, number>;
  onRescheduleStory?: (storyId: string, newDateIso: string) => void;
}

export function EditorialCalendar({
  stories,
  missingStates = [],
  stateCoverageHeatmap = {},
  onRescheduleStory,
}: EditorialCalendarProps) {
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 23)); // July 2026

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Group stories by day of month
  const storiesByDay: Record<number, StoryCalendarItem[]> = {};
  stories.forEach((s) => {
    const d = s.scheduledAt ? new Date(s.scheduledAt) : s.publishedAt ? new Date(s.publishedAt) : null;
    if (d && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
      const dayNum = d.getDate();
      if (!storiesByDay[dayNum]) storiesByDay[dayNum] = [];
      storiesByDay[dayNum].push(s);
    }
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg">Editorial Calendar & Publishing Schedule</h2>
            <p className="text-xs text-muted-foreground">
              {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()} — Regional Coverage & Deadlines
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center border border-border rounded-lg bg-muted/30 p-1 text-xs">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded font-medium ${
                viewMode === "month" ? "bg-amber-500 text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded font-medium ${
                viewMode === "week" ? "bg-amber-500 text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded font-medium ${
                viewMode === "day" ? "bg-amber-500 text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Day
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center py-2.5 text-xs font-mono font-semibold text-muted-foreground uppercase">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border bg-background">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-28 bg-muted/10 p-2 opacity-30" />
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayStories = storiesByDay[dayNum] || [];
            const isToday = dayNum === 23 && currentDate.getMonth() === 6;

            return (
              <div
                key={dayNum}
                className={`min-h-28 p-2 flex flex-col justify-start transition-colors ${
                  isToday ? "bg-amber-500/5 ring-1 ring-amber-500/30" : "hover:bg-muted/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                      isToday ? "bg-amber-500 text-black font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayStories.length > 0 && (
                    <span className="text-[10px] font-mono text-amber-500 font-bold">
                      {dayStories.length} {dayStories.length === 1 ? "story" : "stories"}
                    </span>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-20 pr-0.5">
                  {dayStories.map((s) => (
                    <div
                      key={s.id}
                      className="p-1.5 rounded bg-card border border-border text-[11px] hover:border-amber-500/50 shadow-xs group cursor-pointer"
                    >
                      <p className="font-medium text-foreground truncate group-hover:text-amber-500">{s.title}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                        <span className="truncate max-w-[80px]">{s.state?.name || "General"}</span>
                        <span className="font-mono uppercase text-[9px] px-1 bg-muted rounded">{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coverage Heatmap & Missing States Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <MapPin className="w-4 h-4 text-amber-500" />
            <h3 className="font-serif font-bold text-sm">State Coverage Heatmap</h3>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto">
            {Object.entries(stateCoverageHeatmap).map(([stateName, count]) => (
              <div
                key={stateName}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs text-amber-600 dark:text-amber-400 font-medium"
              >
                <span>{stateName}</span>
                <span className="font-mono text-[10px] bg-amber-500 text-black px-1.5 rounded-full font-bold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <h3 className="font-serif font-bold text-sm">Missing State Coverage Checklist ({missingStates.length})</h3>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1 max-h-48 overflow-y-auto">
            {missingStates.length === 0 ? (
              <p className="text-xs text-emerald-500 font-medium">✅ All 28 States & UTs covered in newsroom pipeline!</p>
            ) : (
              missingStates.map((st) => (
                <span
                  key={st}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500"
                >
                  {st}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
