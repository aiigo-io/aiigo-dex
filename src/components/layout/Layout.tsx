import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import DexHeader from '@/components/layout/DexHeader';
import DexFooter from '@/components/layout/DexFooter';
interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#030303] text-white">
      <DexHeader />
      <main className="flex-grow pt-[86px] px-5">
        {children}
      </main>
      <DexFooter />
    </div>
  );
}; 