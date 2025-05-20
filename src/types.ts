export type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  address: `0x${string}`;
  chainId: number;
  isNative?: boolean;
  isWrapped?: boolean;
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