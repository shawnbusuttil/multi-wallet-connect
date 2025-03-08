import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import './index.css';
import { EthereumProvider } from './providers/EthereumProvider.tsx';
import { SolanaProvider } from './providers/SolanaProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EthereumProvider>
      <SolanaProvider>
      <App />
      </SolanaProvider>
    </EthereumProvider>
  </StrictMode>,
)
