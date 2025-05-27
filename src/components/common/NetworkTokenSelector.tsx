import React, { useState } from 'react';
import { TokenInfo } from '@/types';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type NetworkTokenSelectorProps = {
  tokens: TokenInfo[];
  selectedToken: TokenInfo;
  onSelect: (token: TokenInfo) => void;
  className?: string;
};

export const NetworkTokenSelector = ({ tokens, selectedToken, onSelect, className }: NetworkTokenSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className={`flex items-center justify-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-[#1a1a1a] ${className} shrink-0`}>
          <img src={selectedToken.logo} alt={selectedToken.name} className='w-6 h-6' />
          <span>{selectedToken.name}</span>
        </div>
      </DialogTrigger>
      <DialogContent className='w-[500px]'>
        <DialogTitle>Select Token</DialogTitle>
        <div className='flex flex-col gap-2'>
          {
            tokens.map((token) => (
              <div
                key={token.address}
                className={`flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg ${selectedToken.address === token.address ? 'bg-gray-100 border border-gray-200' : ''}`}
                onClick={() => {
                  onSelect(token);
                  setOpen(false);
                }}
              >
                <div className='flex items-center gap-3'>
                  <img src={token.logo} alt={token.name} className='w-[32px] h-[32px]' />
                  <div className='flex flex-col'>
                    <span className='text-[16px] font-medium text-black'>{token.name}</span>
                    <span className='text-[14px] text-gray-400'>{token.symbol}</span>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-[14px] text-gray-400'>{token.balanceFormatted}</span>
                </div>
              </div>
            ))
          }
        </div>
      </DialogContent>
    </Dialog>
  );
};
