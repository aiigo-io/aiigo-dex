import { defineChain } from 'viem';

export const AIIGO_CHAIN = defineChain({
  id: 38_888,
  name: 'AIIGO',
  nativeCurrency: { name: 'AIGO', symbol: 'AIGO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.aiigo.org'] },
  },
  blockExplorers: {
    default: { name: 'AIIGO Explorer', url: 'http://explorer.aiigo.org/' },
  },
  iconUrl: '/favicon.png',
  iconBackground: '#000000',
})