import { getDefaultConfig } from '@rainbow-me/rainbowkit';

import { AIIGO } from '@/config/chains';
import { defineChain } from 'viem';

import { REOWN_PROJECT_ID } from '@/config/constants';


export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: REOWN_PROJECT_ID,
  chains: [defineChain(AIIGO)],
  ssr: true,
});
