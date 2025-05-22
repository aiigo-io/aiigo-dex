import React from 'react';
import { Button } from '@radix-ui/themes';
import { useAccount } from 'wagmi';

type TokenSelectorProps = {
  className?: string;
  onSelect?: () => void;
};

export const TokenSelector: React.FC<TokenSelectorProps> = ({ className, onSelect }) => {
  const { isConnected } = useAccount();

  return (
    <Button 
      className={className}
      onClick={onSelect}
      disabled={!isConnected}
    >
      <div className="flex items-center gap-2">
        <img 
          src="/images/eth.png" 
          alt="ETH" 
          className="w-6 h-6 rounded-full"
        />
        <span>ETH</span>
      </div>
    </Button>
  );
};
