export interface SocialLinks {
  github: string
  linkedin: string
  twitter?: string
}

export interface PersonalData {
  name: string
  tagline: string
  headline: string
  aboutLead: string
  about: string
  location: string
  city: string
  timezone: string
  email: string
  cvUrl: string
  availabilityStatus: string
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
  clients?: string[]
}

export interface Experience {
  role: string
  company: string
  period: string
  type: "Full-time" | "Part-time" | "Contract" | "Freelance"
  summary: string
  description: string[]
}

export interface ExperienceData {
  experiences: Experience[]
}

export interface ProjectLink {
  label: string
  url: string
}

export type ProjectCategory = "banking" | "mobile" | "ai" | "oss"

export type ProjectVisualId = "wondr-merchant" | "devkit-agent" | "omaga"

export interface ProjectFact {
  label: string
  value: string
}

export interface CaseStudyFeature {
  title: string
  description: string
  screen?: string
}

export interface CaseStudy {
  label: string
  context: string[]
  role: string[]
  features: CaseStudyFeature[]
  flow?: string[]
  outcomes?: Stat[]
}

export interface Project {
  slug: string
  title: string
  summary?: string
  description: string
  tags: string[]
  categories: ProjectCategory[]
  stack: string
  featured?: boolean
  meta?: string
  facts?: ProjectFact[]
  visual?: ProjectVisualId
  image?: string
  githubUrl?: string
  links?: ProjectLink[]
  caseStudy?: CaseStudy
}

export interface ProjectsData {
  projects: Project[]
}

export interface SkillCategory {
  name: string
  skills: string[]
}

export interface SkillsData {
  categories: SkillCategory[]
}

export interface PortfolioData {
  personal: PersonalData
  stats: StatsData
  experience: ExperienceData
  projects: ProjectsData
  skills: SkillsData
}
