import { cn } from '@/lib/utils';
import { NumberCategory } from '@/types/ncms';
import { Crown, Star, Sparkles, Circle } from 'lucide-react';

const categoryConfig: Record<string, { label: string; className: string; icon: typeof Crown }> = {
  platinum: { label: 'Платина', className: 'bg-category-platinum/15 text-category-platinum border-category-platinum/30', icon: Crown },
  gold: { label: 'Золото', className: 'bg-category-gold/15 text-category-gold border-category-gold/30', icon: Star },
  silver: { label: 'Серебро', className: 'bg-category-silver/15 text-category-silver border-category-silver/30', icon: Sparkles },
  regular: { label: 'Обычный', className: 'bg-category-regular/15 text-category-regular border-category-regular/30', icon: Circle },
  economy: { label: 'Эконом', className: 'bg-status-free/15 text-status-free border-status-free/30', icon: Circle },
};

interface CategoryBadgeProps {
  category: NumberCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category] || categoryConfig.regular;
  const Icon = config.icon;

  return (
    <span className={cn(
      "status-badge border",
      config.className,
      className
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
