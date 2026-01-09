import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface EditSubscriberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscriber: any;
}

export function EditSubscriberModal({ open, onOpenChange, subscriber }: EditSubscriberModalProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [type, setType] = useState<'individual' | 'legal_entity'>('individual');
    const [name, setName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address, setAddress] = useState('');
    const [inn, setInn] = useState('');
    const [passportSeries, setPassportSeries] = useState('');
    const [passportNumber, setPassportNumber] = useState('');

    useEffect(() => {
        if (subscriber) {
            setType(subscriber.type || 'individual');
            setName(subscriber.name || '');
            setContactPhone(subscriber.contactPhone || '');
            setAddress(subscriber.address || '');
            setInn(subscriber.inn || '');
            setPassportSeries(subscriber.passportSeries || '');
            setPassportNumber(subscriber.passportNumber || '');
        }
    }, [subscriber]);

    const mutation = useMutation({
        mutationFn: async (updatedSubscriber: any) => {
            return (await api.put(`/subs/subscribers/${subscriber.id}`, updatedSubscriber)).data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscribers'] });
            toast.success(t('common.success', 'Абонент успешно обновлен'));
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(t('common.error', 'Ошибка') + ': ' + (error.response?.data?.message || error.message));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !contactPhone) {
            toast.error(t('common.fill_all_fields', 'Пожалуйста, заполните необходимые поля'));
            return;
        }
        mutation.mutate({ type, name, contactPhone, address, inn, passportSeries, passportNumber });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('common.edit', 'Редактировать абонента')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t('subscribers.table.type', 'Тип абонента')}</Label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="individual">{t('subscribers.types.individual', 'Физическое лицо')}</SelectItem>
                                <SelectItem value="legal_entity">{t('subscribers.types.entity', 'Юридическое лицо')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">{type === 'individual' ? t('common.name', 'ФИО') : t('subscribers.table.name', 'Название организации')}</Label>
                        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-sub-phone">{t('common.phone', 'Телефон')}</Label>
                            <Input id="edit-sub-phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                        </div>
                        {type === 'legal_entity' ? (
                            <div className="space-y-2">
                                <Label htmlFor="edit-inn">{t('common.inn', 'ИНН')}</Label>
                                <Input id="edit-inn" value={inn} onChange={(e) => setInn(e.target.value)} />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="edit-passport">{t('subscribers.table.inn', 'Паспорт (серия и №)')}</Label>
                                <div className="flex gap-2">
                                    <Input className="w-16" value={passportSeries} onChange={(e) => setPassportSeries(e.target.value)} placeholder="А" />
                                    <Input value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} placeholder="1234567" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-address">{t('common.address', 'Адрес')}</Label>
                        <Textarea id="edit-address" value={address} onChange={(e) => setAddress(e.target.value)} />
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
