import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// List of actual states and key matching keywords
const STATE_KEYWORDS = [
  { name: "Andhra Pradesh", keywords: ["andhra", "hyderabad", "tirupati", "आंध्र"] },
  { name: "Arunachal Pradesh", keywords: ["arunachal", "itanagar", "अरुणाचल"] },
  { name: "Assam", keywords: ["assam", "guwahati", "dispur", "असम", "असोम"] },
  { name: "Bihar", keywords: ["bihar", "patna", "nalanda", "बोधगया", "बिहार"] },
  { name: "Chhattisgarh", keywords: ["chhattisgarh", "raipur", "बिलासपुर", "छत्तीसगढ़"] },
  { name: "Goa", keywords: ["goa", "panaji", "पणजी", "गोवा"] },
  { name: "Gujarat", keywords: ["gujarat", "ahmedabad", "gandhinagar", "surat", "गुजरात"] },
  { name: "Haryana", keywords: ["haryana", "gurugram", "panipat", "हरियाणा"] },
  { name: "Himachal Pradesh", keywords: ["himachal", "shimla", "manali", "हिमाचल"] },
  { name: "Jammu and Kashmir", keywords: ["kashmir", "srinagar", "jammu", "जम्मू", "कश्मीर"] },
  { name: "Jharkhand", keywords: ["jharkhand", "ranchi", "jamshedpur", "झारखंड"] },
  { name: "Karnataka", keywords: ["karnataka", "bengaluru", "bangalore", "mysore", "कर्नाटक"] },
  { name: "Kerala", keywords: ["kerala", "kochi", "trivandrum", "केरल"] },
  { name: "Madhya Pradesh", keywords: ["madhya pradesh", "bhopal", "indore", "gwalior", "मध्य प्रदेश", "मप्र"] },
  { name: "Maharashtra", keywords: ["maharashtra", "mumbai", "pune", "nagpur", "महाराष्ट्र", "मुंबई", "पुणे"] },
  { name: "Manipur", keywords: ["manipur", "imphal", "मणिपुर"] },
  { name: "Meghalaya", keywords: ["meghalaya", "shillong", "मेघालय"] },
  { name: "Mizoram", keywords: ["mizoram", "aizawl", "मिजोरम"] },
  { name: "Nagaland", keywords: ["nagaland", "kohima", "नागालैंड"] },
  { name: "Odisha", keywords: ["odisha", "bhubaneswar", "puri", "ओडिशा", "उड़ीसा"] },
  { name: "Punjab", keywords: ["punjab", "amritsar", "ludhiana", "पंजाब"] },
  { name: "Rajasthan", keywords: ["rajasthan", "jaipur", "udaipur", "jodhpur", "राजस्थान", "जयपुर"] },
  { name: "Sikkim", keywords: ["sikkim", "gangtok", "सिक्किम"] },
  { name: "Tamil Nadu", keywords: ["tamil nadu", "chennai", "madurai", "तमिलनाडु", "चेन्नई"] },
  { name: "Telangana", keywords: ["telangana", "hyderabad", "तेलंगाना"] },
  { name: "Tripura", keywords: ["tripura", "agartala", "त्रिपुरा"] },
  { name: "Uttar Pradesh", keywords: ["uttar pradesh", "lucknow", "varanasi", "kanpur", "agra", "उत्तर प्रदेश", "यूपी"] },
  { name: "Uttarakhand", keywords: ["uttarakhand", "dehradun", "haridwar", "उत्तराखंड"] },
  { name: "West Bengal", keywords: ["bengal", "kolkata", "calcutta", "पश्चिम बंगाल", "बंगाल"] },
  { name: "Delhi", keywords: ["delhi", "new delhi", "दिल्ली", "नई दिल्ली"] },
  { name: "Chandigarh", keywords: ["chandigarh", "चंडीगढ़"] },
  { name: "Puducherry", keywords: ["puducherry", "pondicherry", "पुडुचेरी"] },
  { name: "Lakshadweep", keywords: ["lakshadweep", "लक्षद्वीप"] },
  { name: "Andaman and Nicobar Islands", keywords: ["andaman", "nicobar", "अंडमान"] }
];

async function main() {
  try {
    console.log("Starting automatic story geocoding...");
    const dbStates = await prisma.state.findMany();
    const stateMap = new Map();
    dbStates.forEach(s => {
      stateMap.set(s.name.toLowerCase(), s.id);
    });

    const indiaState = dbStates.find(s => s.name.toLowerCase() === "india");
    if (!indiaState) {
      console.log("No state named 'India' found. Skipping initial update.");
    }

    const stories = await prisma.story.findMany({
      include: {
        state: true
      }
    });

    console.log(`Auditing ${stories.length} stories...`);
    let matchedCount = 0;
    let distributedCount = 0;

    const actualStatesList = dbStates.filter(s => s.name.toLowerCase() !== "india");

    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      const textToSearch = `${story.title} ${story.excerpt || ""} ${story.content || ""} ${story.titleHi || ""} ${story.excerptHi || ""} ${story.contentHi || ""}`.toLowerCase();

      let targetStateName = null;

      // 1. Try keyword matching
      for (const config of STATE_KEYWORDS) {
        if (config.keywords.some(kw => textToSearch.includes(kw))) {
          targetStateName = config.name;
          break;
        }
      }

      let targetStateId = null;
      if (targetStateName) {
        targetStateId = stateMap.get(targetStateName.toLowerCase());
      }

      // 2. Fallback to round-robin distribution to ensure even map density
      if (!targetStateId) {
        const fallbackState = actualStatesList[i % actualStatesList.length];
        targetStateId = fallbackState.id;
        distributedCount++;
      } else {
        matchedCount++;
      }

      await prisma.story.update({
        where: { id: story.id },
        data: {
          stateId: targetStateId
        }
      });
    }

    console.log(`Geocoding complete! Matched by text: ${matchedCount}, Distributed evenly: ${distributedCount}`);

    // Delete 'India' record from State table if it exists
    if (indiaState) {
      console.log("Removing 'India' from State table to enforce normalization...");
      // Re-assign any dangling reference just in case
      await prisma.story.updateMany({
        where: { stateId: indiaState.id },
        data: { stateId: actualStatesList[0].id }
      });
      await prisma.state.delete({
        where: { id: indiaState.id }
      });
      console.log("'India' state removed successfully.");
    }

  } catch (e) {
    console.error("Geocoding failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
