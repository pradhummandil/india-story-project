import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting themes cleanup...");

    // Find the theme named 'कहानी'
    const kahaniTheme = await prisma.theme.findFirst({
      where: { name: { equals: "कहानी", mode: "insensitive" } }
    });

    if (kahaniTheme) {
      console.log(`Found 'कहानी' theme with ID: ${kahaniTheme.id}. Cleaning up references...`);

      // Find all stories that have the 'कहानी' theme mapping
      const storyThemes = await prisma.storyTheme.findMany({
        where: { themeId: kahaniTheme.id },
        include: {
          story: {
            include: {
              themes: {
                include: {
                  theme: true
                }
              }
            }
          }
        }
      });

      console.log(`Found ${storyThemes.length} stories mapped to 'कहानी' theme.`);

      // For each story, if 'कहानी' is its only theme, assign it a meaningful theme like 'Innovation' or 'Culture'
      // Otherwise, just remove the 'कहानी' theme mapping.
      const defaultTheme = await prisma.theme.findFirst({
        where: { name: { in: ["Culture", "Innovation", "Heritage"] } }
      }) || await prisma.theme.findFirst();

      if (!defaultTheme) {
        throw new Error("No fallback theme found in database.");
      }

      for (const st of storyThemes) {
        const otherThemes = st.story.themes.filter(t => t.themeId !== kahaniTheme.id);
        if (otherThemes.length === 0) {
          // Assign fallback theme
          console.log(`Story '${st.story.title}' has only 'कहानी' theme. Reassigning to '${defaultTheme.name}'...`);
          await prisma.storyTheme.create({
            data: {
              storyId: st.storyId,
              themeId: defaultTheme.id
            }
          }).catch(() => {}); // Fail silent if already exists
        }

        // Delete the relation to 'कहानी'
        await prisma.storyTheme.delete({
          where: {
            storyId_themeId: {
              storyId: st.storyId,
              themeId: kahaniTheme.id
            }
          }
        });
      }

      // Finally, delete the 'कहानी' theme record
      await prisma.theme.delete({
        where: { id: kahaniTheme.id }
      });
      console.log("'कहानी' theme successfully deleted from database.");
    } else {
      console.log("'कहानी' theme not found in database.");
    }

    // Merge any duplicate themes (case-insensitive name or slug duplicates)
    const allThemes = await prisma.theme.findMany();
    const seenNames = new Map();

    for (const theme of allThemes) {
      const normalized = theme.name.trim().toLowerCase();
      if (seenNames.has(normalized)) {
        const targetThemeId = seenNames.get(normalized);
        console.log(`Merging duplicate theme '${theme.name}' (ID: ${theme.id}) into target ID: ${targetThemeId}`);

        // Update all stories mapping to this duplicate theme
        const storyThemesToMigrate = await prisma.storyTheme.findMany({
          where: { themeId: theme.id }
        });

        for (const st of storyThemesToMigrate) {
          // Reassign to target theme
          await prisma.storyTheme.create({
            data: {
              storyId: st.storyId,
              themeId: targetThemeId
            }
          }).catch(() => {}); // Ignore duplicate key errors if story already has it

          // Delete old mapping
          await prisma.storyTheme.delete({
            where: {
              storyId_themeId: {
                storyId: st.storyId,
                themeId: theme.id
              }
            }
          });
        }

        // Delete duplicate theme
        await prisma.theme.delete({
          where: { id: theme.id }
        });
      } else {
        seenNames.set(normalized, theme.id);
      }
    }

    console.log("Theme system cleanup finished successfully!");

  } catch (e) {
    console.error("Theme system cleanup failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
