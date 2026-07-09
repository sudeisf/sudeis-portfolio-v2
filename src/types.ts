export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  fullDescription: string;
  technologies: string[];
  link?: string;
  gallery?: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  arrow: string;
  dark?: boolean;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  bullets: string[];
  technologies: string[];
  certificateImage?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  date: string;
  status: 'unread' | 'replied' | 'archived';
}

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string; // Newline-separated bullets
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  location: string;
  period: string;
  details?: string;
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
  };
  experience: WorkExperience[];
  education: EducationItem[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
  }[];
}

