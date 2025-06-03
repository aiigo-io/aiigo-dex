'use client'

import { createAppKit } from '@reown/appkit/react'
import { type ReactNode } from 'react'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { REOWN_PROJECT_ID } from '@/config/constants';
import { AIIGO } from '@/config/chains';

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = REOWN_PROJECT_ID

// 2. Create a metadata object - optional
const metadata = {
  name: 'AIIGO',
  description: 'AIIGO DEX',
  url: 'https://dex.aiigo.org', // origin must match your domain & subdomain
  icons: ['https://dex.aiigo.org/images/tokens/AIGO.png']
}

// 3. Set the networks
const networks = [AIIGO]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  // @ts-ignore
  networks: networks,
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    swaps: false,
    onramp: false,
    history: false,
    send: false,
  }
})

export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}