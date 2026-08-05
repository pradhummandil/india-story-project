import aakashPhoto from "@/assets/stories/Aakash Arun.jpg";
import ankitaPhoto from "@/assets/stories/Ankita Maheshwari.jpg";
import mayankPhoto from "@/assets/stories/Mayank Sahu.png";
import pradhumPhoto from "@/assets/stories/Pradhum Mandil.jpg";
import sushantPhoto from "@/assets/stories/Sushant Singh.jpg";
import vedikaPhoto from "@/assets/stories/Vedika.jpg";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleHi?: string;
  photo: string | null;
  bio: string;
  bioHi?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
  email?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "aakash-arun",
    name: "Aakash Arun",
    role: "Founder & CEO",
    roleHi: "संस्थापक और मुख्य कार्यकारी अधिकारी (CEO)",
    photo: aakashPhoto,
    bio: "Visionary storyteller and award-winning documentary filmmaker dedicated to showcasing community-led social change across India.",
    bioHi: "दूरदर्शी कहानीकार और पुरस्कार विजेता वृत्तचित्र निर्माता, जो पूरे भारत में समुदाय आधारित सामाजिक परिवर्तन को प्रदर्शित करने के लिए समर्पित हैं।",
    location: "New Delhi, India",
    linkedin: "https://www.linkedin.com/in/aakash-arun-6623ba30",
  },
  {
    id: "sourab-biswas",
    name: "Sourab Biswas",
    role: "Co-Founder & Senior Brand Designer",
    roleHi: "सह-संस्थापक और वरिष्ठ ब्रांड डिजाइनर",
    photo: null,
    bio: "Self-taught visual artist crafting meaningful brand identities and visual stories for modern digital platforms.",
    bioHi: "स्व-प्रशिक्षित दृश्य कलाकार, जो आधुनिक डिजिटल प्लेटफॉर्म के लिए सार्थक ब्रांड पहचान और दृश्य कहानियां तैयार करते हैं।",
    location: "Kolkata, India",
    linkedin: "https://www.linkedin.com/mwlite/in/sourab-biswas-14664232",
  },
  {
    id: "sushant-singh",
    name: "Sushant Singh",
    role: "Web Developer",
    roleHi: "वेब डेवलपर",
    photo: sushantPhoto,
    bio: "Passionate engineer and web architect building high-performance, responsive platforms for local communities.",
    bioHi: "स्थानीय समुदायों के लिए उच्च-प्रदर्शन, प्रतिक्रियाशील मंच तैयार करने वाले उत्साही इंजीनियर और वेब आर्किटेक्ट।",
    location: "Noida, India",
    linkedin: "https://www.linkedin.com/in/sushant-kumar-singh-b5b59631/",
  },
  {
    id: "pradhum-mandil",
    name: "Pradhum Mandil",
    role: "Full Stack Developer, DevOps Engineer, AI/ML Engineer",
    roleHi: "फुल स्टैक डेवलपर, डेवऑप्स इंजीनियर, एआई/एमएल इंजीनियर",
    photo: pradhumPhoto,
    bio: "Passionate engineer and App architect building high-performance, responsive platforms for local communities.",
    bioHi: "स्थानीय समुदायों के लिए उच्च-प्रदर्शन ऐप और डिजिटल प्लेटफॉर्म बनाने वाले उत्साही फुल स्टैक इंजीनियर।",
    location: "Gwalior, India",
    linkedin: "https://www.linkedin.com/in/pradhum-m-b69b66318",
  },
  {
    id: "mayank-sahu",
    name: "Mayank Sahu",
    role: "Full Stack Developer",
    roleHi: "फुल स्टैक डेवलपर",
    photo: mayankPhoto,
    bio: "Passionate software engineer specializing in scalable web applications, backend systems, cloud deployment and modern full-stack development.",
    bioHi: "स्केलेबल वेब एप्लिकेशन, बैकएंड सिस्टम और क्लाउड डिप्लॉयमेंट में विशेषज्ञता रखने वाले सॉफ्टवेयर इंजीनियर।",
    location: "India",
    linkedin: "https://www.linkedin.com/in/mayank-sahu",
  },
  {
    id: "ankita-maheshwari",
    name: "Ankita Maheshwari",
    role: "UI/UX Designer",
    roleHi: "यूआई/यूएक्स डिजाइनर",
    photo: ankitaPhoto,
    bio: "Creative designer focused on user experience, interface design, visual storytelling and building intuitive digital experiences.",
    bioHi: "उपयोगकर्ता अनुभव, इंटरफ़ेस डिज़ाइन और दृश्य कहानी कहने पर केंद्रित रचनात्मक डिज़ाइनर।",
    location: "India",
    linkedin: "https://www.linkedin.com/in/ankita-maheshwari",
  },
  {
    id: "vedika",
    name: "Vedika",
    role: "Content & Research",
    roleHi: "सामग्री और अनुसंधान",
    photo: vedikaPhoto,
    bio: "Research enthusiast dedicated to documenting grassroots stories, editorial research and preserving India's cultural narratives.",
    bioHi: "जमीनी स्तर की कहानियों का दस्तावेजीकरण और भारत की सांस्कृतिक आख्यानों को सहेजने के लिए समर्पित शोधकर्ता।",
    location: "India",
    linkedin: "https://www.linkedin.com/in/vedika",
  },
];
