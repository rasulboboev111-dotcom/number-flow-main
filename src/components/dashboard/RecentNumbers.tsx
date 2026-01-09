import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { NumberCategory } from '@/types/ncms';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RecentNumbers() {
  const { data: numbers = [], isLoading } = useQuery({
    queryKey: ['recent-numbers'],
    queryFn: async () => {
      // Get last 5 numbers
      const res = await api.get('/numbers', { params: { limit: 5 } });
      return res.data.numbers;
    },
  });

  if (isLoading) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Последние номера</h3>
        <Link to="/numbers" className="text-sm text-primary hover:underline flex items-center gap-1">
          Все номера <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {numbers.map((num: any) => {
          const operator = num.operator;
          const category = num.category;

          return (
            <div key={num.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm font-medium">{num.number}</span>
                <span className="text-xs text-muted-foreground">{operator?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <CategoryBadge category={category?.code as NumberCategory || 'regular'} />
                <StatusBadge status={num.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
