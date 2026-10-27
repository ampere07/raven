import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ExitGuard } from './components/ExitGuard'
import { MusicPlayer } from './components/MusicPlayer'
import { PetalRain } from './components/PetalRain'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PetalRain />
    <App />
    <MusicPlayer />
    <ExitGuard />
  </StrictMode>,
)
