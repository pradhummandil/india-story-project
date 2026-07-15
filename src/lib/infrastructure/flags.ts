// Feature Flags & Config Controller
// Provides configuration toggles for maintenance mode, audio streaming, custom maps, and premium restricts.

import { prisma } from "@/lib/repositories/prisma.server";

// Default local configuration overrides
const DEFAULT_FLAGS = {
  maintenanceMode: false,
  betaAudioEnabled: true,
  interactiveMapSatellite: true,
  premiumStoryRestriction: true,
  communityLeaderboardActive: true,
};

export const flagService = {
  isEnabled: async (flagName: keyof typeof DEFAULT_FLAGS): Promise<boolean> => {
    try {
      // Load configuration from SiteSetting database if populated
      const setting = await prisma.siteSetting.findUnique({
        where: { key: `flag_${flagName}` },
      });
      if (setting) {
        return setting.value === "true";
      }
    } catch {
      // Fail-silent database check fallback
    }
    return DEFAULT_FLAGS[flagName];
  },

  setFlag: async (flagName: string, value: boolean): Promise<void> => {
    try {
      await prisma.siteSetting.upsert({
        where: { key: `flag_${flagName}` },
        update: { value: value ? "true" : "false" },
        create: { key: `flag_${flagName}`, value: value ? "true" : "false" },
      });
    } catch (err) {
      console.error("Failed to update feature flag in database:", err);
    }
  },
};
