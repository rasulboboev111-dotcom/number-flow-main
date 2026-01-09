import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Mail, Building2, Plus, MoreHorizontal, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddOperatorModal } from './AddOperatorModal';
import { EditOperatorModal } from './EditOperatorModal';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function OperatorsList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: operators = [], isLoading } = useQuery({
    queryKey: ['operators', debouncedSearch],
    queryFn: async () => (await api.get('/operators', {
      params: { search: debouncedSearch }
    })).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/operators/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      toast.success(t('common.success', 'Оператор удален'));
    },
    onError: (error: any) => {
      toast.error(t('common.error', 'Ошибка') + ': ' + (error.response?.data?.message || error.message));
    }
  });

  return (
    <div className="space-y-4">
      <AddOperatorModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
      <EditOperatorModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        operator={selectedOperator}
      />
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search', 'Поиск...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">

          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('operators.add_operator', 'Добавить оператора')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            {t('common.loading', 'Загрузка...')}
          </div>
        ) : operators.map((operator: any, index: number) => (
          <div
            key={operator.id}
            className="bg-card border border-border rounded-xl p-6 card-hover animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{operator.name}</h3>
                  <span className="text-sm text-muted-foreground font-mono">MNC: {operator.mnc}</span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>{t('common.edit', 'Редактировать')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/numbers?operatorId=${operator.id}`)}>
                    {t('common.view', 'Просмотр номеров')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      if (confirm(t('common.confirm', 'Удалить оператора? Все связанные номера также будут удалены.'))) {
                        deleteMutation.mutate(operator.id);
                      }
                    }}
                  >
                    {t('common.delete', 'Удалить')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-primary">{operator.numbersCount || 0}</p>
                <p className="text-xs text-muted-foreground">{t('numbers.table.number', 'Номеров в пуле')}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-status-free">{(operator.freeNumbersCount || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{t('status.free', 'Свободных')}</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              {operator.contactPhone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{operator.contactPhone}</span>
                </div>
              )}
              {operator.contactEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{operator.contactEmail}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
