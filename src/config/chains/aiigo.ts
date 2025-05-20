import { Chain } from '@rainbow-me/rainbowkit'
export const AIIGO_CHAIN : Chain = {
  id: 38_888,
  name: 'AIIGO',
  iconUrl: '/favicon.png',
  iconBackground: '#000000',
  nativeCurrency: { name: 'AIGO', symbol: 'AIGO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.aiigo.org'] },
  },
  blockExplorers: {
    default: { name: 'AIIGO Explorer', url: 'http://explorer.aiigo.org/' },
  },
}