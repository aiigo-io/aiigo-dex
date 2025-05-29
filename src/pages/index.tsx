import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button } from '@/components';
import { useEffect } from 'react';

const Home: NextPage = () => {
  const router = useRouter()
  useEffect(() => {
    router.replace('/swap')
  }, []);

  return (<div className="flex flex-col items-center justify-center min-h-[calc(100vh-154px)]">
    <h1 className="text-4xl font-bold">Aiigo DEX</h1>
  </div>);
};

export default Home;
