import { useSyncExternalStore } from "react"

// A small path router: "/" is the portfolio, "/work/<slug>" a case study and
// "/3d" the kampung. Links stay plain <a href="/..."> elements; one document
// listener turns same-site clicks into history entries, and in-page anchors
// (#work, #contact) keep the browser's own behaviour.

export type Route =
  | { kind: "home" }
  | { kind: "work"; slug: string }
  | { kind: "kampung" }

export const KAMPUNG_PATH = "/3d"

const WORK_PATH = /^\/work\/([\w-]+)\/?$/
const KAMPUNG = /^\/3d\/?$/

export function caseStudyPath(slug: string) {
  return `/work/${slug}`
}

export function parseRoute(pathname: string): Route {
  const work = pathname.match(WORK_PATH)
  if (work) return { kind: "work", slug: work[1] }
  if (KAMPUNG.test(pathname)) return { kind: "kampung" }
  return { kind: "home" }
}

// files such as the CV live on the same site but are not pages
function isRoute(pathname: string) {
  return pathname === "/" || WORK_PATH.test(pathname) || KAMPUNG.test(pathname)
}

const CHANGE = "locationchange"

export function navigate(href: string, replace = false) {
  if (replace) window.history.replaceState(null, "", href)
  else window.history.pushState(null, "", href)
  window.dispatchEvent(new Event(CHANGE))
}

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback)
  window.addEventListener(CHANGE, callback)
  return () => {
    window.removeEventListener("popstate", callback)
    window.removeEventListener(CHANGE, callback)
  }
}

export function usePathname() {
  return useSyncExternalStore(subscribe, () => window.location.pathname)
}

// Links shared before the switch used hash routes (#/work/x, #/kampung,
// #/3d, #/meja); send them to their new paths.
export function redirectLegacyHash() {
  const hash = window.location.hash
  if (!hash.startsWith("#/")) return
  const work = hash.match(/^#\/work\/([\w-]+)\/?$/)
  const target = work
    ? caseStudyPath(work[1])
    : /^#\/(3d|kampung|meja)\/?$/.test(hash)
      ? KAMPUNG_PATH
      : "/"
  window.history.replaceState(null, "", target)
}

// Same-site links navigate without reloading the page.
export function interceptLinks(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return
  const anchor = (event.target as Element | null)?.closest?.("a")
  if (!anchor || anchor.target || anchor.hasAttribute("download")) return
  const url = new URL(anchor.href, window.location.href)
  if (url.origin !== window.location.origin || !isRoute(url.pathname)) return
  // a jump within the page is left to the browser
  if (url.pathname === window.location.pathname && url.hash) return
  event.preventDefault()
  navigate(url.pathname + url.search + url.hash)
}
