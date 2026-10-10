import type { Project, ProjectLink } from "@/types/portfolio"

export function caseStudyHref(project: Project) {
  return `#/work/${project.slug}`
}

// GitHub first, then the store/package links listed in the data.
export function projectLinks(project: Project): ProjectLink[] {
  const links = project.links ?? []
  return project.githubUrl
    ? [{ label: "GitHub", url: project.githubUrl }, ...links]
    : links
}
