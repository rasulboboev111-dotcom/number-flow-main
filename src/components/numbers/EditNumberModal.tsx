import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Operator, Category, NumberStatus } from '@/types/ncms';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface EditNumberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    numberData: any;
    isReadOnly?: boolean;
}

export function EditNumberModal({ open, onOpenChange, numberData, isReadOnly = false }: EditNumberModalProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [number, setNumber] = useState('');
    const [operatorId, setOperatorId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [status, setStatus] = useState<NumberStatus>('free');

    useEffect(() => {
        if (numberData) {
            setNumber(numberData.number || '');
            setOperatorId(numberData.operatorId || '');
            setCategoryId(numberData.categoryId || '');
            setStatus(numberData.status || 'free');
        }
    }, [numberData]);

    const { data: operators } = useQuery<Operator[]>({
        queryKey: ['operators'],
        queryFn: async () => (await api.get('/operators')).data,
    });

    const { data: categories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => (await api.get('/categories')).data,
    });

    const mutation = useMutation({
        mutationFn: async (updatedData: any) => {
            return (await api.put(`/numbers/${numberData.id}`, updatedData)).data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['numbers'] });
            queryClient.invalidateQueries({ queryKey: ['operators'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast.success(t('numbers.modals.success_edit', 'Данные номера обновлены'));
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(t('numbers.delete_error', 'Ошибка') + ': ' + (error.response?.data?.message || error.message));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) {
            onOpenChange(false);
            return;
        }
        if (!number || !operatorId || !categoryId) {
            toast.error(t('common.fill_all_fields', 'Пожалуйста, заполните все поля'));
            return;
        }
        mutation.mutate({ number, operatorId, categoryId, status });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isReadOnly ? t('numbers.modals.view_title', 'Просмотр номера') : t('numbers.modals.edit_title', 'Редактирование номера')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="number">{t('numbers.modals.phone_number', 'Номер телефона')}</Label>
                        <Input
                            id="number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            placeholder="+992..."
                            disabled={isReadOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('numbers.table.operator', 'Оператор')}</Label>
                        <Select value={operatorId} onValueChange={setOperatorId} disabled={isReadOnly}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('numbers.modals.operator_placeholder', 'Выберите оператора')} />
                            </SelectTrigger>
                            <SelectContent>
                                {operators?.map((op) => (
                                    <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('numbers.table.category', 'Категория')}</Label>
                        <Select value={categoryId} onValueChange={setCategoryId} disabled={isReadOnly}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('numbers.modals.category_placeholder', 'Выберите категорию')} />
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('common.status', 'Статус')}</Label>
                        <Select value={status} onValueChange={(val) => setStatus(val as NumberStatus)} disabled={isReadOnly}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('numbers.modals.status_placeholder', 'Выберите статус')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="free">{t('status.free', 'Свободен')}</SelectItem>
                                <SelectItem value="active">{t('status.active', 'Активен')}</SelectItem>
                                <SelectItem value="reserved">{t('status.reserved', 'Забронирован')}</SelectItem>
                                <SelectItem value="blocked">{t('status.blocked', 'Заблокирован')}</SelectItem>
                                <SelectItem value="quarantine">{t('status.quarantine', 'Карантин')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {isReadOnly ? t('common.close', 'Закрыть') : t('common.cancel', 'Отмена')}
                        </Button>
                        {!isReadOnly && (
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? t('numbers.modals.saving', 'Сохранение...') : t('common.save', 'Сохранить изменения')}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
