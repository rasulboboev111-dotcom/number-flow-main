import { useState, useEffect, useCallback, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AddNumberModal } from './AddNumberModal';
import { EditNumberModal } from './EditNumberModal';
import { ImportModal } from './ImportModal';
import { StatusHistoryModal } from './StatusHistoryModal';
import { AddContractModal } from '@/components/contracts/AddContractModal';
import * as XLSX from 'xlsx';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { NumberCategory, NumberStatus } from '@/types/ncms';
import { Search, Download, Upload, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NumberRowProps {
  num: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (num: any) => void;
  onEdit: (num: any) => void;
  onHistory: (num: any) => void;
  onAssign: (num: any) => void;
  onBlock: (id: string) => void;
  onDelete: (id: string) => void;
  t: any;
}

const NumberRow = memo(({
  num,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onHistory,
  onAssign,
  onBlock,
  onDelete,
  t
}: NumberRowProps) => {
  const operator = num.operator;
  const category = num.category;
  const subscriber = num.subscriber;

  return (
    <tr key={num.id} className="hover:bg-secondary/30 transition-colors">
      <td className="data-table-cell">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(num.id)}
        />
      </td>
      <td className="data-table-cell font-mono font-medium">{num.number}</td>
      <td className="data-table-cell text-muted-foreground">{operator?.name}</td>
      <td className="data-table-cell">
        <CategoryBadge category={category?.code as NumberCategory || 'regular'} />
      </td>
      <td className="data-table-cell">
        <StatusBadge status={num.status} />
      </td>
      <td className="data-table-cell text-muted-foreground">
        {subscriber?.name || '—'}
      </td>
      <td className="data-table-cell text-muted-foreground text-xs">
        {num.updatedAt}
      </td>
      <td className="data-table-cell">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(num)}>
              {t('common.view', 'Просмотр')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(num)}>
              {t('common.edit', 'Редактировать')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onHistory(num)}>
              {t('common.history', 'История статусов')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssign(num)}>
              {t('numbers.assign_to_subscriber', 'Закрепить за абонентом')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onBlock(num.id)}
            >
              {t('common.block', 'Заблокировать')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(num.id)}
            >
              {t('common.delete', 'Удалить')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
});

export function NumbersTable() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [operatorFilter, setOperatorFilter] = useState<string>(searchParams.get('operatorId') || 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('categoryId') || 'all');

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setStatusFilter(searchParams.get('status') || 'all');
    setOperatorFilter(searchParams.get('operatorId') || 'all');
    setCategoryFilter(searchParams.get('categoryId') || 'all');
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value) {
      setSearchParams(prev => {
        prev.set('search', value);
        return prev;
      });
    } else {
      setSearchParams(prev => {
        prev.delete('search');
        return prev;
      });
    }
  };
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<any>(null);
  const [isReadOnlyView, setIsReadOnlyView] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedNumberForHistory, setSelectedNumberForHistory] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedNumberForAssignment, setSelectedNumberForAssignment] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['numbers', searchQuery, statusFilter, operatorFilter, categoryFilter, page],
    queryFn: async () => {
      const params: any = { page, limit: 15 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (operatorFilter !== 'all') params.operatorId = operatorFilter;
      if (categoryFilter !== 'all') params.categoryId = categoryFilter;
      const res = await api.get('/numbers', { params });
      return res.data;
    },
  });

  const numbers = data?.numbers || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/numbers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['numbers'] });
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(t('numbers.delete_success', 'Номер удален'));
    },
    onError: (error: any) => {
      toast.error(t('numbers.delete_error', 'Ошибка при удалении') + ': ' + (error.response?.data?.message || error.message));
    }
  });

  const { data: operators = [] } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => (await api.get('/operators')).data,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data,
  });

  const handleView = useCallback((num: any) => {
    setSelectedNumber(num);
    setIsReadOnlyView(true);
    setIsEditModalOpen(true);
  }, []);

  const handleEdit = useCallback((num: any) => {
    setSelectedNumber(num);
    setIsReadOnlyView(false);
    setIsEditModalOpen(true);
  }, []);

  const handleHistory = useCallback((num: any) => {
    setSelectedNumberForHistory(num);
    setIsHistoryModalOpen(true);
  }, []);

  const handleBlock = useCallback((id: string) => {
    api.put(`/numbers/${id}`, { status: 'blocked' }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['numbers'] });
      toast.success('Номер заблокирован');
    });
  }, [queryClient]);

  const handleDelete = useCallback((id: string) => {
    if (confirm(t('numbers.confirm_delete', 'Вы уверены, что хотите удалить этот номер?'))) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation, t]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === numbers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(numbers.map((n: any) => n.id));
    }
  };

  const handleExport = () => {
    const exportData = numbers.map((n: any) => ({
      'Номер': n.number,
      'Оператор': n.operator?.name,
      'Категория': n.category?.name,
      'Статус': n.status,
      'Владелец': n.subscriber?.name || '—',
      'Обновлен': n.updatedAt
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Numbers");
    XLSX.writeFile(wb, "number_registry.xlsx");
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search_placeholder', 'Поиск по номеру...')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-64 pl-10 bg-secondary"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setSearchParams(prev => {
                if (v === 'all') prev.delete('status');
                else prev.set('status', v);
                return prev;
              });
            }}
          >
            <SelectTrigger className="w-40 bg-secondary">
              <SelectValue placeholder={t('common.status', 'Статус')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all_statuses', 'Все статусы')}</SelectItem>
              <SelectItem value="free">{t('status.free', 'Свободен')}</SelectItem>
              <SelectItem value="active">{t('status.active', 'Активен')}</SelectItem>
              <SelectItem value="reserved">{t('status.reserved', 'Забронирован')}</SelectItem>
              <SelectItem value="blocked">{t('status.blocked', 'Заблокирован')}</SelectItem>
              <SelectItem value="quarantine">{t('status.quarantine', 'Карантин')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={operatorFilter}
            onValueChange={(v) => {
              setOperatorFilter(v);
              setSearchParams(prev => {
                if (v === 'all') prev.delete('operatorId');
                else prev.set('operatorId', v);
                return prev;
              });
            }}
          >
            <SelectTrigger className="w-40 bg-secondary">
              <SelectValue placeholder={t('numbers.table.operator', 'Оператор')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('numbers.filters.all_operators', 'Все операторы')}</SelectItem>
              {operators.map((op: any) => (
                <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v);
              setSearchParams(prev => {
                if (v === 'all') prev.delete('categoryId');
                else prev.set('categoryId', v);
                return prev;
              });
            }}
          >
            <SelectTrigger className="w-40 bg-secondary">
              <SelectValue placeholder={t('numbers.table.category', 'Категория')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('numbers.filters.all_categories', 'Все категории')}</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            {t('numbers.import', 'Импорт')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            {t('numbers.export', 'Экспорт')}
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            + {t('numbers.add_number', 'Добавить номер')}
          </Button>
        </div>
      </div>

      <AddNumberModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      <ImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />

      <EditNumberModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        numberData={selectedNumber}
        isReadOnly={isReadOnlyView}
      />

      <StatusHistoryModal
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        numberId={selectedNumberForHistory?.id}
        number={selectedNumberForHistory?.number}
      />

      <AddContractModal
        open={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        defaultPhoneNumber={selectedNumberForAssignment ? {
          id: selectedNumberForAssignment.id,
          number: selectedNumberForAssignment.number
        } : undefined}
      />

      {/* Selected actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">Выбрано: {selectedIds.length}</span>
          <Button variant="outline" size="sm">Сменить статус</Button>
          <Button variant="outline" size="sm">В карантин</Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="data-table-cell w-12">
                  <Checkbox
                    checked={selectedIds.length === numbers.length && numbers.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="data-table-cell text-left text-muted-foreground font-medium">{t('numbers.table.number', 'Номер')}</th>
                <th className="data-table-cell text-left text-muted-foreground font-medium">{t('numbers.table.operator', 'Оператор')}</th>
                <th className="data-table-cell text-left text-muted-foreground font-medium">{t('numbers.table.category', 'Категория')}</th>
                <th className="data-table-cell text-left text-muted-foreground font-medium">{t('numbers.table.status', 'Статус')}</th>
                <th className="data-table-cell text-left text-muted-foreground font-medium">{t('common.owner', 'Владелец')}</th>
                <th className="data-table-cell text-left text-muted-foreground font-medium">{t('numbers.table.last_update', 'Обновлен')}</th>
                <th className="data-table-cell w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {numbers.map((num: any) => (
                <NumberRow
                  key={num.id}
                  num={num}
                  isSelected={selectedIds.includes(num.id)}
                  onSelect={toggleSelect}
                  onView={handleView}
                  onEdit={handleEdit}
                  onHistory={handleHistory}
                  onAssign={(num) => {
                    setSelectedNumberForAssignment(num);
                    setIsAssignModalOpen(true);
                  }}
                  onBlock={handleBlock}
                  onDelete={handleDelete}
                  t={t}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-sm text-muted-foreground">

          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isLoading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              {t('common.previous', 'Назад')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages || isLoading}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              {t('common.next', 'Далее')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
