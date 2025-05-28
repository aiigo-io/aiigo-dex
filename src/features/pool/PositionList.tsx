import React, { useEffect } from 'react';
import { Card } from '@radix-ui/themes';
import { useUserPositions } from '@/hooks';
import { Loader2 } from 'lucide-react';
import { PositionItem } from './positionItem';

const PositionList: React.FC = () => {
  const { data: positions, isLoading, refetch } = useUserPositions();
  return (
    <Card className='flex-1'>
      <h2 className='text-[32px] font-bold text-[#d1d1d1] mb-4'>Your Positions</h2>
      {isLoading ? (
        <div className='flex justify-center items-center h-full' key="loading">
          <Loader2 className='w-4 h-4 animate-spin' />
        </div>
      ) : (
        <div className='flex flex-col gap-2' key="positions">
          {positions && positions.map((position: any) => (
            <PositionItem key={position.nftId.toString()} position={position} refetch={refetch} />
          ))}
        </div>
      )}
    </Card>
  );
};

export default PositionList;