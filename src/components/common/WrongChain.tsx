import { Button, ConnectWallet } from '@/components'
import { useProtocol } from '@/hooks';
import { DEFAULT_CHAIN_ID } from '@/config';

export const WrongChain = () => {
  const { isConnected, switchChain } = useProtocol();
  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      {
        !isConnected ? <ConnectWallet /> : (<Button
          className='hover:opacity-90 cursor-pointer bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white font-bold text-[16px] rounded-lg'
          size='lg'
          onClick={() => {
            switchChain({ chainId: DEFAULT_CHAIN_ID })
          }}
        >Switch to AIIGO</Button>)
      }
    </div>
  )
}