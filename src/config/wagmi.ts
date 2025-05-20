import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  flare,
} from 'wagmi/chains';

import { SupportedChains } from '@/config/chains';

import { REOWN_PROJECT_ID } from '@/config/constants';

export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: REOWN_PROJECT_ID,
  chains: [mainnet, base, arbitrum, optimism, polygon, flare, sepolia, ...SupportedChains],
  ssr: true,
});
