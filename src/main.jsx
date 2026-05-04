import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const shouldUseMockApi =
  import.meta.env.VITE_API_MODE === 'mock' ||
  (import.meta.env.DEV && !import.meta.env.VITE_API_MODE);

const bootstrap = async () => {
  if (shouldUseMockApi) {
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
