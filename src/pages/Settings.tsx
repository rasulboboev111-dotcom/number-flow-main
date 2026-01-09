import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [companyName, setCompanyName] = useState('NCMS Tajikistan');
  const [quarantineDays, setQuarantineDays] = useState('30');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [auditLog, setAuditLog] = useState(true);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/settings')).data,
  });

  useEffect(() => {
    if (settings) {
      if (settings.companyName) setCompanyName(settings.companyName);
      if (settings.quarantineDays) setQuarantineDays(settings.quarantineDays);
      if (settings.emailNotifications) setEmailNotifications(settings.emailNotifications === 'true');
      if (settings.auditLog) setAuditLog(settings.auditLog === 'true');
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success(t('common.success', 'Настройки сохранены'));
    },
    onError: (error: any) => {
      toast.error(t('common.error', 'Ошибка сохранения'));
    }
  });

  const handleSave = () => {
    mutation.mutate({
      companyName,
      quarantineDays,
      emailNotifications: String(emailNotifications),
      auditLog: String(auditLog)
    });
  };

  return (
    <MainLayout
      title={t('nav.settings', "Настройки")}
      subtitle={t('settings.subtitle', "Конфигурация системы")}
    >
      <div className="max-w-2xl space-y-8">
        {/* General Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">{t('settings.general', "Общие настройки")}</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">{t('settings.company_name', "Название организации")}</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">{t('settings.timezone', "Часовой пояс")}</Label>
              <Input id="timezone" defaultValue="Asia/Dushanbe (UTC+5)" disabled className="bg-secondary" />
            </div>
          </div>
        </div>

        {/* Quarantine Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">{t('status.quarantine', "Карантин номеров")}</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quarantine-days">{t('settings.quarantine_days', "Дней в карантине")}</Label>
              <Input
                id="quarantine-days"
                type="number"
                value={quarantineDays}
                onChange={(e) => setQuarantineDays(e.target.value)}
                className="w-32 bg-secondary"
              />
              <p className="text-xs text-muted-foreground">
                {t('settings.quarantine_hint', "Период, в течение которого номер недоступен после расторжения договора")}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">{t('settings.notifications', "Уведомления")}</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email-уведомления</p>
                <p className="text-sm text-muted-foreground">Получать уведомления о новых заявках</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Аудит действий</p>
                <p className="text-sm text-muted-foreground">Логировать все изменения в системе</p>
              </div>
              <Switch
                checked={auditLog}
                onCheckedChange={setAuditLog}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline">{t('common.cancel', "Отмена")}</Button>
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? t('common.loading', "Сохранение...") : t('common.save', "Сохранить изменения")}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
