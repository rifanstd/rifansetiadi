import { caseStudyPath } from "@/lib/router"
import type { Experience, PortfolioData } from "@/types/portfolio"
import type { PlaceId } from "./layout"

// Conversations built from the same portfolio data as the 2D site. Every
// node is a few lines from the townsperson and the replies you can choose.

export interface DialogueChoice {
  label: string
  next?: string
  href?: string
  download?: boolean
  // leaving the conversation pointing the guide arrow somewhere
  guide?: PlaceId
}

export interface DialogueNode {
  lines: string[]
  choices: DialogueChoice[]
}

export type Script = Record<string, DialogueNode>

interface DialogueText {
  experienceIntro: string
  whatDoes: string
  before: string
  beforeLine: string
  earlier: string
  firstJob: string
  projectsAsk: string
  projectsPointer: string
  thanks: string
  goSee: string
  shopIntro: string
  shopMore: string
  caseStudy: string
  openLink: string
  warungIntro: string
  email: string
  github: string
  linkedin: string
  cv: string
  emailLine: string
}

export function fill(text: string, values: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  )
}

const bye = (d: DialogueText): DialogueChoice => ({ label: d.thanks })

const jobFields = (job: Experience) => ({
  role: job.role,
  company: job.company,
  period: job.period,
})

export function buildScript(
  place: PlaceId,
  data: PortfolioData,
  d: DialogueText
): Script {
  if (place === "experience") return experienceScript(data, d)
  if (place === "projects") return projectsScript(data, d)
  return contactScript(data, d)
}

function experienceScript(data: PortfolioData, d: DialogueText): Script {
  const jobs = data.experience.experiences
  const [first, ...rest] = jobs
  const script: Script = {
    start: {
      lines: [fill(d.experienceIntro, jobFields(first))],
      choices: [
        { label: d.whatDoes, next: "what" },
        ...(rest.length ? [{ label: d.before, next: "history-1" }] : []),
        { label: d.projectsAsk, next: "projects" },
        bye(d),
      ],
    },
    what: {
      lines: [first.summary, ...first.description.slice(0, 2)],
      choices: [
        ...(rest.length ? [{ label: d.before, next: "history-1" }] : []),
        { label: d.projectsAsk, next: "projects" },
        bye(d),
      ],
    },
    projects: {
      lines: [d.projectsPointer],
      choices: [{ label: d.goSee, guide: "projects" }, bye(d)],
    },
  }
  jobs.forEach((job, i) => {
    if (i === 0) return
    const last = i === jobs.length - 1
    script[`history-${i}`] = {
      lines: [
        fill(d.beforeLine, jobFields(job)),
        job.summary,
        ...(last ? [d.firstJob] : []),
      ],
      choices: [
        ...(last ? [] : [{ label: d.earlier, next: `history-${i + 1}` }]),
        { label: d.projectsAsk, next: "projects" },
        bye(d),
      ],
    }
  })
  return script
}

function projectsScript(data: PortfolioData, d: DialogueText): Script {
  const projects = data.projects.projects
  const shown = [
    ...projects.filter((p) => p.featured),
    ...projects.filter((p) => !p.featured),
  ].slice(0, 5)
  const script: Script = {
    start: {
      lines: [fill(d.shopIntro, { count: projects.length })],
      choices: [
        ...shown.map((p, i) => ({ label: p.title, next: `p-${i}` })),
        bye(d),
      ],
    },
  }
  shown.forEach((p, i) => {
    const link = p.caseStudy
      ? { label: d.caseStudy, href: caseStudyPath(p.slug) }
      : p.links?.[0]
        ? {
            label: fill(d.openLink, { label: p.links[0].label }),
            href: p.links[0].url,
          }
        : p.githubUrl
          ? { label: fill(d.openLink, { label: "GitHub" }), href: p.githubUrl }
          : null
    script[`p-${i}`] = {
      lines: [p.summary ?? p.title, p.description],
      choices: [
        ...(link ? [link] : []),
        { label: d.shopMore, next: "start" },
        bye(d),
      ],
    }
  })
  return script
}

function contactScript(data: PortfolioData, d: DialogueText): Script {
  const me = data.personal
  return {
    start: {
      lines: [d.warungIntro],
      choices: [
        { label: d.email, next: "email" },
        { label: d.github, href: me.social.github },
        { label: d.linkedin, href: me.social.linkedin },
        { label: d.cv, href: me.cvUrl, download: true },
        bye(d),
      ],
    },
    email: {
      lines: [fill(d.emailLine, { email: me.email })],
      choices: [
        { label: me.email, href: `mailto:${me.email}` },
        { label: d.github, href: me.social.github },
        bye(d),
      ],
    },
  }
}
