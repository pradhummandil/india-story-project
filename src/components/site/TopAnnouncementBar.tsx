import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X, Radio } from "lucide-react";

type AnnouncementItem = {
  id: string;
  text: string;
  region?: string;
  slug?: string;
};

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "1",
    text: "Rajasthan: Desert rainwater harvesting techniques revive 40 ancient stepwells",
    region: "Rajasthan",
    slug: "rajasthan-stepwells-revival",
  },
  {
    id: "2",
    text: "West Bengal: Patachitra scroll painters digitize 400-year-old folklore archives",
    region: "West Bengal",
    slug: "patachitra-digital-archives",
  },
  {
    id: "3",
    text: "Kerala: Solar community grid powers remote Wayanad tribal settlements",
    region: "Kerala",
    slug: "wayanad-solar-grid",
  },
  {
    id: "4",
    text: "Ladakh: Zero-energy ice stupas secure spring irrigation for Himalayan farmers",
    region: "Ladakh",
    slug: "ladakh-ice-stupas-irrigation",
  },
];

export function TopAnnouncementBar() {
  return null;
}
