/**
 * India Story Project - Official Website Knowledge Layer
 * Indexed knowledge base covering platform info, guidelines, policies, FAQs, and routing map.
 */

export interface FAQItem {
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
  keywords: string[];
}

export const PLATFORM_INFO = {
  name: "India Story Project",
  mission: "Documenting, preserving, and celebrating India's rich cultural heritage, unsung heroes, local traditions, oral histories, art, and community innovations from every state and district.",
  routes: {
    home: "/",
    explore: "/explore",
    shareStory: "/share-story",
    joinAuthor: "/join",
    dashboard: "/dashboard",
    profile: "/profile",
    about: "/about",
    contact: "/contact",
    privacy: "/privacy",
    terms: "/terms",
    chatbot: "/chatbot",
  },
};

export const PLATFORM_FAQS: FAQItem[] = [
  {
    questionEn: "What is India Story Project?",
    questionHi: "भारत स्टोरी प्रोजेक्ट क्या है?",
    answerEn: "India Story Project is a community-driven digital repository dedicated to archiving real, human stories from every corner of India—focusing on local heritage, folklore, unsung change-makers, traditional crafts, and regional history.",
    answerHi: "भारत स्टोरी प्रोजेक्ट एक डिजिटल संग्रह है जो भारत के हर कोने से स्थानीय सांस्कृतिक विरासत, लोक कला, अज्ञात नायकों और परंपराओं की सच्ची कहानियों को सहेजने के लिए समर्पित है।",
    keywords: ["what is", "about", "project", "mission", "purpose", "परिचय", "क्या है"],
  },
  {
    questionEn: "How do I submit a story?",
    questionHi: "मैं कहानी कैसे सबमिट करूँ?",
    answerEn: "You can submit your story by navigating to the Share Story page (/share-story). Fill out the title, state/district, theme, narrative text, upload relevant high-resolution photos, and submit. You can also get step-by-step help directly from this AI Assistant!",
    answerHi: "आप कहानी सबमिट करने वाले पेज (/share-story) पर जाकर अपनी कहानी का शीर्षक, राज्य/जिला, विषय और कहानी का विवरण दर्ज करके सबमिट कर सकते हैं। आप इस AI सहायक से भी चरण-दर-चरण सहायता ले सकते हैं!",
    keywords: ["submit", "publish", "share story", "write story", "upload", "सबमिट", "प्रकाशित", "कहानी लिखें"],
  },
  {
    questionEn: "What stories are accepted?",
    questionHi: "किस प्रकार की कहानियाँ स्वीकार की जाती हैं?",
    answerEn: "We accept authentic stories about local heritage, unsung heroes, living traditions, indigenous art forms, environmental conservation, community initiatives, historical monuments, and folk legends. Stories must be original and respectful.",
    answerHi: "हम स्थानीय विरासत, गुमनाम नायकों, जीवंत परंपराओं, लोक कला, पर्यावरण संरक्षण और ऐतिहासिक स्थलों से जुड़ी प्रामाणिक और मौलिक कहानियों को स्वीकार करते हैं।",
    keywords: ["accepted", "type of stories", "eligibility", "criteria", "स्वीकार्य", "नियम"],
  },
  {
    questionEn: "What is editorial review and how long does it take?",
    questionHi: "संपादकीय समीक्षा (Editorial Review) क्या है और इसमें कितना समय लगता है?",
    answerEn: "Every submission undergoes editorial review by our team to verify authenticity, language clarity, and media rights. Review typically takes 24 to 48 hours before publication on the platform.",
    answerHi: "प्रत्येक सबमिशन की हमारी संपादकीय टीम द्वारा समीक्षा की जाती है ताकि प्रामाणिकता और भाषा की जांच की जा सके। समीक्षा प्रक्रिया में आमतौर पर 24 से 48 घंटे लगते हैं।",
    keywords: ["review", "editorial", "how long", "time", "approval", "समीक्षा", "समय", "अनुमोदन"],
  },
  {
    questionEn: "Who owns my story and what is the copyright policy?",
    questionHi: "मेरी कहानी का स्वामित्व किसके पास रहता है?",
    answerEn: "You retain full copyright ownership of your story. By publishing on India Story Project, you grant us a non-exclusive license to feature and share your story to promote Indian heritage.",
    answerHi: "आपकी कहानी का सर्वाधिकार (Copyright) पूरी तरह आपके पास रहता है। भारत स्टोरी प्रोजेक्ट पर प्रकाशित करके आप केवल हमें इसे प्रदर्शित करने का गैर-अनन्य अधिकार देते हैं।",
    keywords: ["copyright", "rights", "ownership", "who owns", "कॉपीराइट", "स्वामित्व", "अधिकार"],
  },
  {
    questionEn: "What languages are accepted?",
    questionHi: "कौन सी भाषाओं में कहानियाँ लिखी जा सकती हैं?",
    answerEn: "We welcome stories in English and Hindi (हिन्दी), as well as regional Indian languages. Dual-language submissions with translations are highly encouraged!",
    answerHi: "हम अंग्रेजी, हिंदी और अन्य भारतीय क्षेत्रीय भाषाओं में कहानियों का स्वागत करते हैं।",
    keywords: ["language", "hindi", "english", "regional", "भाषा", "हिंदी"],
  },
  {
    questionEn: "Can I upload images with my story?",
    questionHi: "क्या मैं अपनी कहानी के साथ चित्र अपलोड कर सकता हूँ?",
    answerEn: "Yes! High-quality photos enhance storytelling significantly. You can upload multiple photos along with captions and image credits during submission.",
    answerHi: "हाँ! आप अपनी कहानी के साथ उच्च गुणवत्ता वाले फोटो और उनके विवरण अपलोड कर सकते हैं।",
    keywords: ["image", "photo", "upload image", "pictures", "फोटो", "चित्र"],
  },
  {
    questionEn: "Can I become a registered author?",
    questionHi: "क्या मैं एक पंजीकृत लेखक बन सकता हूँ?",
    answerEn: "Absolutely! You can sign up as a Contributor at /join to build your verified author profile, track your published stories, and connect with readers.",
    answerHi: "बिल्कुल! आप /join पर लेखक के रूप में साइन अप करके अपना प्रोफ़ाइल बना सकते हैं।",
    keywords: ["author", "join", "contributor", "register", "लेखक", "साइन अप"],
  },
];

export function findMatchingFAQ(query: string, isHindi: boolean): string | null {
  const clean = query.toLowerCase();
  for (const faq of PLATFORM_FAQS) {
    const match = faq.keywords.some((k) => clean.includes(k.toLowerCase()));
    if (match) {
      return isHindi ? faq.answerHi : faq.answerEn;
    }
  }
  return null;
}
