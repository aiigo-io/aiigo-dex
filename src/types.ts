import { Abi } from 'viem';

export type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  address: `0x${string}`;
  chainId: number;
  isNative?: boolean;
  isWrapped?: boolean;
  balance?: bigint;
  balanceFormatted?: string | number;
};

export type ChainInfo = {
  id: number;
  name: string;
  iconUrl: string;
  iconBackground: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: {
    default: { http: [string] };
  };
  blockExplorers: {
    default: { name: string; url: string };
  };
};

export interface ContractInfo {
  address: string;
  abi: Abi | unknown[];
  functionName: string;
  args?: any[];
  contractName?: string;
  value?: bigint;
}

export interface SendTxData {
  account: string;
  to: string;
  data?: string;
  value?: string;
}
