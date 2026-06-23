import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SvgStudioPage from './SvgStudioPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SvgStudioPage />
  </StrictMode>,
)
