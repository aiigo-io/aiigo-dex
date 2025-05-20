"use client";

import Image from "next/image";
// import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ConnectWallet } from '@/components/common/ConnectWallet';

export default function AppHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 h-[86px] bg-black/50 backdrop-blur-lg flex items-center justify-between px-5">
      <div className="flex items-center gap-2 font-bold text-[24px]">
        <Image src="/favicon.png" alt="Aiigo DEX" width={32} height={32} />
        <p className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500">AIIGo</p>
      </div>
      <ConnectWallet />
    </div>
  );
}