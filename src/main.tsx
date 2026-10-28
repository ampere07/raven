import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ExitGuard } from './components/ExitGuard'
import { MusicPlayer } from './components/MusicPlayer'
import { PetalRain } from './components/PetalRain'
import { ChapterListPage } from './pages/ChapterListPage'
import { CommonRoomPage } from './pages/CommonRoomPage'
import './styles/index.css'
import { useRoute } from './utils/route'

// The first chapter keeps its own look and its falling petals; the Common Room has its own room.
function Root() {
  const route = useRoute()

  return (
    <>
      {route === 'little-things' && (
        <>
          <PetalRain />
          <App />
        </>
      )}
      {route === 'chapters' && <ChapterListPage />}
      {route === 'common-room' && <CommonRoomPage />}
      <MusicPlayer route={route} />
      <ExitGuard />
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
