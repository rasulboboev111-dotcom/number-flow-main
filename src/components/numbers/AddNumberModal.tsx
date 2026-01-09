import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Operator, Category } from '@/types/ncms';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface AddNumberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddNumberModal({ open, onOpenChange }: AddNumberModalProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [number, setNumber] = useState('');
    const [operatorId, setOperatorId] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const { data: operators } = useQuery<Operator[]>({
        queryKey: ['operators'],
        queryFn: async () => (await api.get('/operators')).data,
    });

    const { data: categories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => (await api.get('/categories')).data,
    });

    const mutation = useMutation({
        mutationFn: async (newNumber: any) => {
            return (await api.post('/numbers', newNumber)).data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['numbers'] });
            queryClient.invalidateQueries({ queryKey: ['operators'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast.success(t('numbers.modals.success_add', 'Номер успешно добавлен'));
            onOpenChange(false);
            setNumber('');
            setOperatorId('');
            setCategoryId('');
        },
        onError: (error: any) => {
            toast.error(t('numbers.delete_error', 'Ошибка') + ': ' + (error.response?.data?.message || error.message));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!number || !operatorId || !categoryId) {
            toast.error(t('common.fill_all_fields', 'Пожалуйста, заполните все поля'));
            return;
        }
        mutation.mutate({ number, operatorId, categoryId, status: 'free' });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('numbers.modals.add_title', 'Добавить новый номер')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="number">{t('numbers.modals.phone_number', 'Номер телефона')}</Label>
                        <Input
                            id="number"
                            placeholder="+992 000 000 000"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="operator">{t('numbers.table.operator', 'Оператор')}</Label>
                        <Select value={operatorId} onValueChange={setOperatorId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('numbers.modals.operator_placeholder', 'Выберите оператора')} />
                            </SelectTrigger>
                            <SelectContent>
                                {operators?.map((op) => (
                                    <SelectItem key={op.id} value={op.id}>
                                        {op.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">{t('numbers.table.category', 'Категория')}</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('numbers.modals.category_placeholder', 'Выберите категорию')} />
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('common.cancel', 'Отмена')}
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? t('numbers.modals.adding', 'Добавление...') : t('common.add', 'Добавить')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
