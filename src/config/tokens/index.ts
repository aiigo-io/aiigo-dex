import { TokenInfo } from '@/types';
import { AIIGO_TOKENS } from './aiigo';
import { CHAIN_IDS } from '@/config/chains';


export const TOKENS = {
  [CHAIN_IDS.AIIGO]: AIIGO_TOKENS,
};

export const getTokens = (chainId: number): TokenInfo[] => {
  return TOKENS[chainId as keyof typeof TOKENS];
};
