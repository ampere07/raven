import { useEffect, useState } from 'react'

export type Route = 'chapters' | 'little-things' | 'common-room'

const PATHS: Record<Route, string> = {
  chapters: '#/chapters',
  'little-things': '#/little-things',
  'common-room': '#/common-room',
}

const DEFAULT_ROUTE: Route = 'chapters'

// The site opens on the chapter selection. A bare address, or one that matches nothing, is sent there so that
// the address bar says where she actually is.
function currentRoute(): Route {
  const hash = window.location.hash.replace(/\/$/, '')
  const match = (Object.keys(PATHS) as Route[]).find((route) => PATHS[route] === hash)
  if (match) return match
  window.history.replaceState(null, '', PATHS[DEFAULT_ROUTE])
  return DEFAULT_ROUTE
}

export const hrefFor = (route: Route) => PATHS[route]

export function useRoute(): Route {
  const [route, setRoute] = useState(currentRoute)

  useEffect(() => {
    const update = () => {
      setRoute(currentRoute())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])

  return route
}
