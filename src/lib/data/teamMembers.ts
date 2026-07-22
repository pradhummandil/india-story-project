export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string | null;
  bio: string;
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
    photo: null,
    bio: "Visionary storyteller and award-winning documentary filmmaker dedicated to showcasing community-led social change across India.",
    location: "New Delhi, India",
    linkedin: "https://www.linkedin.com/in/aakash-arun-6623ba30",
  },
  {
    id: "sourab-biswas",
    name: "Sourab Biswas",
    role: "Co-Founder & Senior Brand Designer",
    photo: null,
    bio: "Self-taught visual artist crafting meaningful brand identities and visual stories for modern digital platforms.",
    location: "Kolkata, India",
    linkedin: "https://www.linkedin.com/mwlite/in/sourab-biswas-14664232",
  },
  {
    id: "sushant-singh",
    name: "Sushant Singh",
    role: "Web Developer",
    photo: null,
    bio: "Passionate engineer and web architect building high-performance, responsive platforms for local communities.",
    location: "Noida, India",
    linkedin: "https://www.linkedin.com/in/sushant-kumar-singh-b5b59631/",
  },
  {
    id: "pradhum-mandil",
    name: "Pradhum Mandil",
    role: "Full Stack Developer,DevOps Engineer,AI/ML Engineer ",
    photo: null,
    bio: "Passionate engineer and App architect building high-performance, responsive platforms for local communities.",
    location: "Gwalior, India",
    linkedin: "www.linkedin.com/in/pradhum-m-b69b66318",
  },
];
