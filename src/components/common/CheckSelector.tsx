
import React from "react";
import { Card, Badge } from "@/components";

type CheckSelectorOption = {
  label: string;
  value: any;
  tag?: string;
};

type CheckSelectorProps = {
  options: CheckSelectorOption[];
  className?: string;
  value: any;
  onChange: (value: any) => void;
};

export const CheckSelector: React.FC<CheckSelectorProps> = ({ className, options, value, onChange}) => {
  return (
    <div className={`flex gap-4 ${className}`}>
      {
        options.map((option) => (
          <Card
            key={option.value}
            className={`w-full cursor-pointer hover:bg-white/10 flex-1 ${value === option.value ? 'bg-gradient-to-r from-sky-500/10 via-blue-600/10 to-cyan-500/10 border-white/80 text-white' : 'text-white/80'}`}
            onClick={() => onChange(option.value)}
          >
            <div className='flex flex-col items-center gap-2'>
              <p className='text-white/80'>{option.label}</p>
              {option.tag && <Badge>{option.tag}</Badge>}
            </div>
          </Card>
        ))
      }
    </div>
  );
};