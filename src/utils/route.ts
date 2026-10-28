import { useEffect, useState } from 'react'

export type Route = 'home' | 'chapters' | 'common-room'

const PATHS: Record<Route, string> = {
  home: '#/',
  chapters: '#/chapters',
  'common-room': '#/common-room',
}

function currentRoute(): Route {
  const hash = window.location.hash.replace(/\/$/, '')
  return (Object.keys(PATHS) as Route[]).find((route) => PATHS[route].replace(/\/$/, '') === hash) ?? 'home'
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
