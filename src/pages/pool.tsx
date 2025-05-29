import type { NextPage } from 'next';
import AddLiquidity from '@/features/pool/AddLiquidity';
import PositionList from '@/features/pool/PositionList';

const Pool: NextPage = () => {
  return (
    <div className='flex justify-center py-10 select-none gap-4 w-[1200px] mx-auto overflow-y-auto'>
      <AddLiquidity />
      <PositionList />
    </div>
  );
};

export default Pool;