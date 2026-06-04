export interface SocialLinks {
  github: string
  linkedin: string
  twitter?: string
}

export interface PersonalData {
  name: string
  tagline: string
  headline: string
  about: string
  location: string
  email: string
  cvUrl: string
  availabilityStatus: "Available for hire" | "Open for collaboration" | "Not available"
  profileImage: string
  experience: string
  social: SocialLinks
}

export interface Stat {
  value: string
  suffix?: string
  label: string
}

export interface StatsData {
  stats: Stat[]
}

export interface Experience {
  role: string
  company: string
  period: string
  type: "Full-time" | "Part-time" | "Contract" | "Freelance"
  description: string[]
}

export interface ExperienceData {
  experiences: Experience[]
}

export interface Project {
  title: string
  description: string
  image: string
  tags: string[]
  githubUrl?: string
  liveUrl?: string
}

export interface ProjectsData {
  projects: Project[]
}

export interface Skill {
  name: string
  category: string
}

export interface SkillsData {
  skills: Skill[]
}

export interface PortfolioData {
  personal: PersonalData
  stats: StatsData
  experience: ExperienceData
  projects: ProjectsData
  skills: SkillsData
}
