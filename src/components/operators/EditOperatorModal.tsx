import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface EditOperatorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    operator: any;
}

export function EditOperatorModal({ open, onOpenChange, operator }: EditOperatorModalProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [mnc, setMnc] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');

    useEffect(() => {
        if (operator) {
            setName(operator.name || '');
            setMnc(operator.mnc || '');
            setContactPhone(operator.contactPhone || '');
            setContactEmail(operator.contactEmail || '');
        }
    }, [operator]);

    const mutation = useMutation({
        mutationFn: async (updatedOperator: any) => {
            return (await api.put(`/operators/${operator.id}`, updatedOperator)).data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operators'] });
            toast.success(t('common.success', 'Оператор успешно обновлен'));
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(t('common.error', 'Ошибка') + ': ' + (error.response?.data?.message || error.message));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !mnc) {
            toast.error(t('common.fill_all_fields', 'Пожалуйста, заполните необходимые поля'));
            return;
        }
        mutation.mutate({ name, mnc, contactPhone, contactEmail });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('common.edit', 'Редактировать оператора')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">{t('common.name', 'Название')}</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-mnc">MNC ({t('common.type', 'код сети')})</Label>
                        <Input
                            id="edit-mnc"
                            value={mnc}
                            onChange={(e) => setMnc(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-phone">{t('common.phone', 'Контактный телефон')}</Label>
                        <Input
                            id="edit-phone"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-email">{t('common.email', 'Контактный Email')}</Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('common.cancel', 'Отмена')}
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? t('common.loading', 'Загрузка...') : t('common.save', 'Сохранить')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
