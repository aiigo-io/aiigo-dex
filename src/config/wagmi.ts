import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { AIIGO } from '@/config/chains';
import { defineChain } from 'viem';

import { REOWN_PROJECT_ID } from '@/config/constants';


export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  projectId: REOWN_PROJECT_ID,
  networks: [defineChain(AIIGO)],
  ssr: true,
});

export const config = wagmiAdapter.wagmiConfig