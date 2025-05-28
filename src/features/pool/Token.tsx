import Image from 'next/image';
import { TokenInfo } from '@/types';
import { shortenAddress } from '@/lib/utils';
import { toast } from 'sonner';

export const Token: React.FC<{
  token: TokenInfo;
  size?: number;
  showAddress?: boolean;
  showSymbol?: boolean;
}> = ({ token, size = 16, showAddress = false, showSymbol = false }) => {
  return (<div className='flex items-center gap-1'>
    <Image className='rounded-full bg-white border border-gray-200' src={token.logo} alt={token.name} width={size} height={size} />
    {
      showAddress && (
        <span
          className='text-[12px] font-bold text-white/50 hover:text-white transition-all duration-300 cursor-pointer'
          onClick={() => {
            navigator.clipboard.writeText(token.address);
            toast.success('Copied to clipboard', {
              duration: 1000,
              position: 'top-center',
              style: {
                background: '#2DCE89',
                color: '#fff',
              }
            });
          }}
        >{shortenAddress(token.address, 4, 6)}</span>
      )
    }
    {
      showSymbol && (
        <span className='text-[13px] font-bold'>{token.symbol}</span>
      )
    }
  </div>)
}