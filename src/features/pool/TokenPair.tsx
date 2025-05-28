import Image from 'next/image';
import { TokenInfo } from '@/types';
import { shortenAddress } from '@/lib/utils';

export const TokenPair: React.FC<{
  token0: TokenInfo;
  token1: TokenInfo;
  size?: number;
  address?: string;
}> = ({ token0, token1, size = 24, address }) => {
  return (<div className='flex items-center'>
    <Image className='rounded-full bg-white border border-gray-200' src={token0.logo} alt={token0.name} width={size} height={size} />
    <Image className='rounded-full bg-white border border-gray-200 relative left-[-6px]' src={token1.logo} alt={token1.name} width={size} height={size} />
    {
      address && (
        <span className='text-[12px] font-bold text-white/50 hover:text-white transition-all duration-300 cursor-pointer'
        >{shortenAddress(address, 4, 6)}</span>
      )
    }
  </div>)
}