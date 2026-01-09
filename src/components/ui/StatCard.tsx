import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
  iconClassName?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className, iconClassName }: StatCardProps) {
  return (
    <div className={cn(
      "bg-card border border-border rounded-xl p-5 card-hover",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={cn(
              "text-xs font-medium",
              trend.positive ? "text-status-free" : "text-status-active"
            )}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% за месяц
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          iconClassName || "bg-primary/10"
        )}>
          <Icon className={cn("w-6 h-6", iconClassName ? "text-current" : "text-primary")} />
        </div>
      </div>
    </div>
  );
}
