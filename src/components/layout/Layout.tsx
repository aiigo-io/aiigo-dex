'use client'
import React, { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { DexHeader, DexFooter } from '@/components';
import { useProtocol } from '@/hooks';
import { DEFAULT_CHAIN_ID, AIIGO } from '@/config';
import { WrongChain } from '../common/WrongChain';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isConnected, chains,chainId, switchChain, unSupportedChain } = useProtocol();

  console.log('unSupportedChain', unSupportedChain)

  console.log(chains, chainId)

  useEffect(() => {
    const switchToAIIGO = async () => {
      try {
        await switchChain({ chainId: AIIGO.id });
      } catch (error) {
        console.error('Failed to switch chain:', error);
      }
    };
    switchToAIIGO();
  }, [switchChain]);

  return (
    <div className="flex flex-col min-h-screen bg-[#030303] text-white">
      <DexHeader />
      <main className="flex-grow pt-[86px] px-5 relative">
        {children}
        {
          (unSupportedChain || !isConnected) && <WrongChain />
        }
      </main>
      <DexFooter />
    </div>
  );
}; 