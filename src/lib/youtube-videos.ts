export interface YouTubeStoryVideo {
  id: string;
  youtubeId: string;
  title: string;
  titleHi: string;
  excerpt: string;
  excerptHi: string;
  duration: string;
  viewCount: number;
  thumbnail: string;
  authorName: string;
  region: string;
  isShort: boolean;
  category: "short" | "documentary" | "story";
  slugs: string[]; // Matching database story slugs
}

export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return "";
  const shortsMatch = urlOrId.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];
  const watchMatch = urlOrId.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];
  const beMatch = urlOrId.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (beMatch && beMatch[1]) return beMatch[1];
  const embedMatch = urlOrId.match(/\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];
  return urlOrId.trim();
}

export const YOUTUBE_STORY_VIDEOS: YouTubeStoryVideo[] = [
  {
    id: "yt-1",
    youtubeId: "bIRXuTA4n_E",
    title: "Rangamma Was One — A Story of Extraordinary Courage",
    titleHi: "रंगम्मा की कहानी — अदम्य साहस और संघर्ष की गाथा",
    excerpt: "The inspiring journey of Rangamma, an unsung warrior who stood tall against all odds.",
    excerptHi: "रंगम्मा की प्रेरणादायक कहानी, जिन्होंने हर कठिनाई के खिलाफ निडर होकर लड़ाई लड़ी।",
    duration: "4:45",
    viewCount: 124000,
    thumbnail: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
    authorName: "India Story Project",
    region: "Andhra Pradesh",
    isShort: false,
    category: "story",
    slugs: ["rangamma-was-one"],
  },
  {
    id: "yt-2",
    youtubeId: "fTGbhMtgxqo",
    title: "Voices of Grassroots Resilience Across Rural India",
    titleHi: "ग्रामीण भारत के संघर्ष और उम्मीद की आवाजें",
    excerpt: "Ground coverage capturing the quiet revolutions transforming village economies.",
    excerptHi: "ग्रामीण अर्थव्यवस्था को बदलने वाली मौन क्रांतियों का जमीनी संकलन।",
    duration: "0:59",
    viewCount: 88500,
    thumbnail: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80",
    authorName: "India Story Dispatches",
    region: "Madhya Pradesh",
    isShort: false,
    category: "story",
    slugs: ["voices-of-rural-resilience"],
  },
  {
    id: "yt-3",
    youtubeId: "0GtlvecVfiM",
    title: "Story of a Doctor Who Became the Messiah",
    titleHi: "एक डॉक्टर की कहानी जो गरीबों के लिए बने मसीहा",
    excerpt: "How a selfless physician dedicated his life to treating rural communities for free.",
    excerptHi: "कैसे एक निस्वार्थ डॉक्टर ने ग्रामीण समुदायों का मुफ्त इलाज करने में अपना जीवन समर्पित कर दिया।",
    duration: "6:15",
    viewCount: 189000,
    thumbnail: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
    authorName: "ISP Health Dispatches",
    region: "Bihar",
    isShort: false,
    category: "documentary",
    slugs: ["story-of-a-doctor-who-became-the-messiah"],
  },
  {
    id: "yt-4",
    youtubeId: "y7ZCCknHv9Y",
    title: "Heritage & Culture Chroniclers of Modern India",
    titleHi: "आधुनिक भारत के विरासत और संस्कृति रक्षक",
    excerpt: "Documenting timeless Indian art forms and the masters preserving them.",
    excerptHi: "कालातीत भारतीय कला रूपों और उन्हें सहेजने वाले उस्तादों का दस्तावेजीकरण।",
    duration: "6:40",
    viewCount: 135000,
    thumbnail: "https://images.unsplash.com/photo-1606744888344-493238951221?w=800&auto=format&fit=crop&q=80",
    authorName: "India Story Project",
    region: "Odisha",
    isShort: false,
    category: "documentary",
    slugs: ["heritage-and-culture-chroniclers"],
  },
  {
    id: "yt-5",
    youtubeId: "QlcSWwfHOhg",
    title: "Lily — The Cylinder Girl's Lifesaving Mission",
    titleHi: "लिली — द सिलेंडर गर्ल का जीवनरक्षक अभियान",
    excerpt: "The heroic story of Lily, delivering essential oxygen cylinders to families in crisis.",
    excerptHi: "संकट के समय परिवारों तक जीवनरक्षक ऑक्सीजन सिलेंडर पहुंचाने वाली लिली की बीर गाथा।",
    duration: "5:20",
    viewCount: 210000,
    thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80",
    authorName: "India Story Project",
    region: "Delhi",
    isShort: false,
    category: "story",
    slugs: ["lily-the-cylinder-girl", "lily-the-cylinder-girl-2"],
  },
  {
    id: "yt-6",
    youtubeId: "4cPzIrrGrwI",
    title: "Shivdasia and the Fight for Girl Education",
    titleHi: "शिवदासिया और बालिका शिक्षा के लिए ऐतिहासिक संघर्ष",
    excerpt: "A fearless woman breaking societal barriers to bring education to underprivileged girls.",
    excerptHi: "वंचित लड़कियों तक शिक्षा पहुंचाने के लिए सामाजिक रूढ़ियों को तोड़ती एक निडर महिला।",
    duration: "7:10",
    viewCount: 156000,
    thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
    authorName: "ISP Education Bureau",
    region: "Uttar Pradesh",
    isShort: false,
    category: "documentary",
    slugs: ["shivdasia-and-the-fight-for-education"],
  },
  {
    id: "yt-7",
    youtubeId: "7CDQ8nnJIV4",
    title: "Innovators of Grassroots India: Eco-Friendly Solutions",
    titleHi: "जमीनी भारत के इनोवेटर्स: पर्यावरण-अनुकूल समाधान",
    excerpt: "Frugal innovations solving environmental challenges in remote regions.",
    excerptHi: "दूरदराज के इलाकों में पर्यावरण चुनौतियों का समाधान करने वाले जुगाड़ नवाचार।",
    duration: "0:58",
    viewCount: 94200,
    thumbnail: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
    authorName: "India Story Shorts",
    region: "Gujarat",
    isShort: true,
    category: "short",
    slugs: ["eco-friendly-grassroots-innovators"],
  },
  {
    id: "yt-8",
    youtubeId: "4A3MZr9-oQM",
    title: "Unsung Heroes: Preserving Indigenous Art Traditions",
    titleHi: "अनसुने नायक: स्वदेशी कला परंपराओं के संरक्षक",
    excerpt: "Tribe elders passing down ancient storytelling through mural paintings.",
    excerptHi: "भित्तिचित्रों के माध्यम से प्राचीन कथावाचन को आने वाली पीढ़ियों तक पहुंचाते बुजुर्ग।",
    duration: "5:50",
    viewCount: 112000,
    thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
    authorName: "ISP Cultural Dispatches",
    region: "Jharkhand",
    isShort: false,
    category: "story",
    slugs: ["preserving-indigenous-art"],
  },
  {
    id: "yt-9",
    youtubeId: "RZRqZS0nNNM",
    title: "Changing Lives at Grassroots: India Story Cinema Dispatch",
    titleHi: "जमीन पर बदलते जीवन: इंडिया स्टोरी स्पेशल वीडियो",
    excerpt: "Celebrating everyday champions driving social progress across small towns.",
    excerptHi: "छोटे शहरों में सामाजिक प्रगति की राह दिखाने वाले रोजमर्रा के नायकों का उत्सव।",
    duration: "4:30",
    viewCount: 178000,
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    authorName: "India Story Project",
    region: "Rajasthan",
    isShort: false,
    category: "story",
    slugs: ["changing-lives-at-grassroots"],
  },
];

export function getVideoForStorySlug(slug: string): YouTubeStoryVideo | null {
  if (!slug) return null;
  const normalized = slug.toLowerCase().trim().replace(/%20/g, "").replace(/\s+/g, "");
  return (
    YOUTUBE_STORY_VIDEOS.find((v) =>
      v.slugs.some((s) => {
        const normS = s.toLowerCase().trim().replace(/\s+/g, "");
        return normalized.includes(normS) || normS.includes(normalized);
      })
    ) || null
  );
}
