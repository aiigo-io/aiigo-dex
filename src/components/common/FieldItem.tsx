import React from 'react';
import { Button } from '@radix-ui/themes';
import { useAccount } from 'wagmi';

type FieldItemProps = {
  label: string;
  className?: string;
  children: React.ReactNode;
};

export const FieldItem: React.FC<FieldItemProps> = ({ label, className, children }) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <p className='text-[14px] text-white/80 font-medium'>{label}</p>
      {children}
    </div>
  );
};
