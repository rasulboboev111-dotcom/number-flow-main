import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { NumberCategory } from '@/types/ncms';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { AddCategoryModal } from './AddCategoryModal';
import { EditCategoryModal } from './EditCategoryModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function CategoriesList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', debouncedSearch],
    queryFn: async () => (await api.get('/categories', {
      params: { search: debouncedSearch }
    })).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('common.success', 'Категория удалена'));
    },
    onError: (error: any) => {
      toast.error(t('common.error', 'Ошибка') + ': ' + (error.response?.data?.message || error.message));
    }
  });

  return (
    <div className="space-y-4">
      <AddCategoryModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
      <EditCategoryModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        category={selectedCategory}
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
          <p className="text-muted-foreground text-sm whitespace-nowrap hidden sm:block">
            {t('categories.subtitle', 'Категории определяют ценность номера')}
          </p>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('categories.add_category', 'Добавить категорию')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            {t('common.loading', 'Загрузка...')}
          </div>
        ) : categories.map((category: any, index: number) => (
          <div
            key={category.id}
            className="bg-card border border-border rounded-xl p-5 card-hover animate-fade-in group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <CategoryBadge category={category.code as NumberCategory} />
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => {
                    if (confirm(t('common.confirm', 'Удалить категорию? Это может повлиять на связанные номера.'))) {
                      deleteMutation.mutate(category.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{category.name}</h3>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">
                {category.surcharge > 0 ? `+${category.surcharge.toLocaleString()}` : '0'}
              </span>
              <span className="text-sm text-muted-foreground">
                {category.surchargeType === 'fixed' ? 'сомони' : '%'}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              {t('settings.quarantine_hint', 'Наценка за "красивый" номер')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
