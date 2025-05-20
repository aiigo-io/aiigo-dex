import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

function Loading({ className, size = 32, ...props }: LoadingProps) {
  return (
    <div className={cn(' mx-auto w-fit', className)} {...props}>
      <Loader2 size={size} className="animate-spin" />
    </div>
  );
}

export { Loading };
