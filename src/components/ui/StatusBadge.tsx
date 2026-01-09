import { cn } from '@/lib/utils';
import { NumberStatus } from '@/types/ncms';

const statusConfig: Record<NumberStatus, { label: string; className: string }> = {
  free: { label: 'Свободен', className: 'bg-status-free/15 text-status-free border-status-free/30' },
  active: { label: 'Активен', className: 'bg-status-active/15 text-status-active border-status-active/30' },
  reserved: { label: 'Забронирован', className: 'bg-status-reserved/15 text-status-reserved border-status-reserved/30' },
  blocked: { label: 'Заблокирован', className: 'bg-status-blocked/15 text-status-blocked border-status-blocked/30' },
  quarantine: { label: 'Карантин', className: 'bg-status-quarantine/15 text-status-quarantine border-status-quarantine/30' },
};

interface StatusBadgeProps {
  status: NumberStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={cn(
      "status-badge border",
      config.className,
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
