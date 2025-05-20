import React from 'react';
import { Card, Heading } from '@radix-ui/themes';
import { Input } from '@/components/ui/input';

type TradeInputProps = {
  className?: string;
  label?: string;
  children?: React.ReactNode;
  value?: string;
  readonly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const TradeInput: React.FC<TradeInputProps> = ({ className, label, children, value, onChange, readonly }) => {

  return <Card className={className}>
    <p className='mb-2 text-[14px] text-[#888888] font-medium'>{label}</p>
    <div className='flex items-center justify-between'>
      <input
        placeholder='0.0'
        className="flex-1 leading-[30px] focus:outline-none text-[22px] font-medium text-[#d1d1d1]"
        value={value}
        onChange={onChange}
        readOnly={readonly}
      />
      {children}
    </div>
  </Card>;
};

export default TradeInput;