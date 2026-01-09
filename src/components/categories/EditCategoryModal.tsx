import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface EditCategoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: any;
}

export function EditCategoryModal({ open, onOpenChange, category }: EditCategoryModalProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [surcharge, setSurcharge] = useState('0');
    const [surchargeType, setSurchargeType] = useState<'fixed' | 'percent'>('fixed');

    useEffect(() => {
        if (category) {
            setName(category.name || '');
            setCode(category.code || '');
            setSurcharge(String(category.surcharge || '0'));
            setSurchargeType(category.surchargeType || 'fixed');
        }
    }, [category]);

    const mutation = useMutation({
        mutationFn: async (updatedCategory: any) => {
            return (await api.put(`/categories/${category.id}`, updatedCategory)).data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success(t('common.success', 'Категория успешно обновлена'));
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(t('common.error', 'Ошибка') + ': ' + (error.response?.data?.message || error.message));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !code) {
            toast.error(t('common.fill_all_fields', 'Пожалуйста, заполните необходимые поля'));
            return;
        }
        mutation.mutate({ name, code, surcharge: parseFloat(surcharge), surchargeType });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('common.edit', 'Редактировать категорию')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-cat-name">{t('common.name', 'Название')}</Label>
                        <Input
                            id="edit-cat-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-cat-code">{t('common.type', 'Код (латиница)')}</Label>
                        <Input
                            id="edit-cat-code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-surcharge">{t('numbers.table.category', 'Наценка')}</Label>
                            <Input
                                id="edit-surcharge"
                                type="number"
                                value={surcharge}
                                onChange={(e) => setSurcharge(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-type">{t('common.type', 'Тип')}</Label>
                            <Select value={surchargeType} onValueChange={(v: any) => setSurchargeType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fixed">{t('common.save', 'Фикс. (TJS)')}</SelectItem>
                                    <SelectItem value="percent">{t('common.save', 'Процент (%)')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('common.cancel', 'Отмена')}
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? t('common.loading', 'Сохранение...') : t('common.save', 'Сохранить')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
