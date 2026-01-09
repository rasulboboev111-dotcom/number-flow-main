import { useState, useCallback, memo } from 'react';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddSubscriberModal } from './AddSubscriberModal';
import { EditSubscriberModal } from './EditSubscriberModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreHorizontal, User, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface SubscriberCardProps {
  sub: any;
  onNavigateHistory: (name: string) => void;
  onEdit: (sub: any) => void;
  onDelete: (id: string) => void;
}

const SubscriberCard = memo(({ sub, onNavigateHistory, onEdit, onDelete }: SubscriberCardProps) => {
  const { t } = useTranslation();
  return (
    <div
      className="bg-card border border-border rounded-xl p-5 card-hover animate-fade-in"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            sub.type === 'individual' ? "bg-primary/10" : "bg-category-gold/10"
          )}>
            {sub.type === 'individual' ? (
              <User className="w-5 h-5 text-primary" />
            ) : (
              <Building2 className="w-5 h-5 text-category-gold" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-sm">{sub.name}</h4>
            <span className="text-xs text-muted-foreground">
              {sub.type === 'individual' ? t('subscribers.types.individual', 'Физ. лицо') : t('subscribers.types.entity', 'Юр. лицо')}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(sub)}>
              {t('common.edit', 'Редактировать')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigateHistory(sub.name)}>
              {t('common.history', 'История номеров')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(sub.id)}
            >
              {t('common.delete', 'Удалить')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t('common.phone', 'Телефон')}</span>
          <span className="font-mono">{sub.contactPhone}</span>
        </div>
        {sub.type === 'legal_entity' && sub.inn && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('common.inn', 'ИНН')}</span>
            <span className="font-mono">{sub.inn}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t('subscribers.table.numbers_count', 'Номеров')}</span>
          <span className={cn(
            "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
            (sub.numbersCount || 0) > 0 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
          )}>
            {sub.numbersCount || 0}
          </span>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground truncate">{sub.address}</p>
        </div>
      </div>
    </div>
  );
});

export function SubscribersTable() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['subscribers', searchQuery, typeFilter],
    queryFn: async () => {
      const res = await api.get('/subs/subscribers');
      let filtered = res.data;
      if (searchQuery) {
        filtered = filtered.filter((s: any) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.contactPhone.includes(searchQuery)
        );
      }
      if (typeFilter !== 'all') {
        filtered = filtered.filter((s: any) => s.type === typeFilter);
      }
      return filtered;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/subs/subscribers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      toast.success(t('subscribers.modals.success_delete_toast', 'Абонент удален'));
    },
    onError: (error: any) => {
      toast.error(t('common.error', 'Ошибка') + ': ' + (error.response?.data?.message || error.message));
    }
  });

  const handleNavigateHistory = useCallback((name: string) => {
    navigate(`/numbers?search=${name}`);
  }, [navigate]);

  const handleDelete = useCallback((id: string) => {
    if (confirm(t('subscribers.modals.confirm_delete', 'Вы уверены, что хотите удалить этого абонента?'))) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation, t]);

  return (
    <div className="space-y-4" >
      {/* Toolbar */}
      < div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between" >
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search_placeholder', 'Поиск по имени или телефону...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10 bg-secondary"
            />
          </div>

          < Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 bg-secondary">
              <SelectValue placeholder={t('subscribers.table.type', 'Тип абонента')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all', 'Все типы')}</SelectItem>
              <SelectItem value="individual">{t('subscribers.types.individual', 'Физические лица')}</SelectItem>
              <SelectItem value="legal_entity">{t('subscribers.types.entity', 'Юридические лица')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('subscribers.add_subscriber', 'Новый абонент')}
        </Button>
      </div >

      <AddSubscriberModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
      <EditSubscriberModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        subscriber={selectedSubscriber}
      />

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('common.loading', 'Загрузка...')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {subscribers.map((sub: any) => (
            <SubscriberCard
              key={sub.id}
              sub={sub}
              onNavigateHistory={handleNavigateHistory}
              onEdit={(s) => {
                setSelectedSubscriber(s);
                setIsEditModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div >
  );
}
