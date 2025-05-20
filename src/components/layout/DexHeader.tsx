"use client";

import Image from "next/image";
// import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ConnectWallet } from '@/components/common/ConnectWallet';
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function AppHeader() {
  const pathname = usePathname();
  console.log(pathname);
  const menus = [
    {
      label: 'Swap',
      href: '/swap',
    },
    {
      label: 'Pool',
      href: '/pool',
    },
    {
      label: 'Docs',
      href: 'https://aiigo.org',
      target: '_blank',
    },
  ]
  return (
    <div className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 h-[86px] bg-black/50 backdrop-blur-lg flex items-center justify-between px-5">
      <div className="flex items-center gap-2 font-bold text-[24px]">
        <Image src="/favicon.png" alt="Aiigo DEX" width={32} height={32} />
        <p className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500">AIIGo</p>
        <div className="ml-[100px] hidden lg:flex items-center space-x-1 bg-white/[0.03] backdrop-blur-sm rounded-full border border-white/10 p-1">
          {
            menus.map((menu) => (
              <Link
                key={menu.label}
                href={menu.href}
                target={menu.target}
                  className={`relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:text-white ${pathname === menu.href ? 'text-white bg-gradient-to-r from-sky-500/10 via-blue-600/10 to-cyan-500/10' : 'text-white/60'}`}
              >
                {menu.label}
              </Link>
            ))
          }
        </div>
      </div>
      
      <ConnectWallet />
    </div>
  );
}