import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const bootstrap = async () => {
  if (import.meta.env.VITE_API_MODE === 'mock') {
    const { setupMockApi } = await import('./api/mock/setupMockApi.js');
    setupMockApi();
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
