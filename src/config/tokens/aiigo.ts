import { zeroAddress } from 'viem';
import { CHAIN_IDS } from '@/config/chains';
import { TokenInfo } from '@/types';
export const AIIGO_TOKENS: TokenInfo[] = [
  {
    name: 'AIGO',
    symbol: 'AIGO',
    decimals: 18,
    logo: '/images/tokens/AIGO.png',
    address: zeroAddress,
    chainId: CHAIN_IDS.AIIGO,
    isNative: true,
  },
  {
    name: 'Wrapped AIGO',
    symbol: 'WAIGO',
    decimals: 18,
    logo: '/images/tokens/WAIGO.png',
    address: '0xF389DC22e620f87DeB0e7e5335aD65F8695FfDC4',
    chainId: CHAIN_IDS.AIIGO,
    isWrapped: true,
  },
  {
    name: 'Yacht Coin',
    symbol: 'YTC',
    decimals: 18,
    logo: '/images/tokens/YTC.png',
    address: '0x3327AFF9F4AC18E618D1eD1F2007BdBD8246Bf11',
    chainId: CHAIN_IDS.AIIGO,
  },
]