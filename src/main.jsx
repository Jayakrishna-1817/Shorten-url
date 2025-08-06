import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import NoAnimationBulkApp from './NoAnimationBulkApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NoAnimationBulkApp />
  </StrictMode>,
)
