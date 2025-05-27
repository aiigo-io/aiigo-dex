import React, { ReactNode } from 'react';
import { Card } from '@radix-ui/themes';
import { Skeleton } from '@/components';

type TradeInputProps = {
  className?: string;
  label?: string;
  children?: React.ReactNode;
  value?: string;
  readonly?: boolean;
  type?: 'number' | 'text';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  bottomLabel?: ReactNode | string;
  isLoading?: boolean;
};

export const TradeInput: React.FC<TradeInputProps> = ({
  className,
  label,
  children,
  value,
  onChange,
  readonly,
  type,
  placeholder = '0.0',
  bottomLabel = '',
  isLoading = false
}) => {

  return <Card className={className}>
    <p className='mb-2 text-[14px] text-[#888888] font-medium'>{label}</p>
    <div className='flex items-center justify-between gap-2'>
      {
        isLoading ? <Skeleton className='w-full h-[30px]' /> : <input
          placeholder={placeholder}
          className="flex-1 leading-[30px] focus:outline-none text-[22px] font-medium text-[#d1d1d1] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={value}
          onChange={onChange}
          readOnly={readonly}
          type={type || 'text'}
        />
      }
      
      {children}
    </div>
    {
      bottomLabel && (
        <div className='text-[#888888] font-medium text-[14px] mt-2'>{bottomLabel}</div>
      )
    }
  </Card>;
};