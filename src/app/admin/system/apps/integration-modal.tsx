"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface IntegrationModalProps {
  app: { id: string; name: string; provider: string };
  integration?: { config: any };
  onClose: () => void;
  onSave: (config: Record<string, any>) => Promise<void>;
}

const PROVIDER_FIELDS: Record<string, { key: string; label: string; type: string }[]> = {
  aramex: [
    { key: "AccountNumber", label: "رقم الحساب", type: "text" },
    { key: "AccountPin", label: "الرقم السري", type: "password" },
    { key: "AccountEntity", label: "كيان الحساب", type: "text" },
    { key: "AccountCountryCode", label: "كود الدولة", type: "text" },
  ],
  smsa: [
    { key: "Passkey", label: "مفتاح المرور", type: "password" },
  ],
  saee: [
    { key: "APIKey", label: "مفتاح API", type: "password" },
  ],
  tap: [
    { key: "SecretAPIKey", label: "مفتاح API السري", type: "password" },
  ],
  payfort: [
    { key: "MerchantIdentifier", label: "معرف التاجر", type: "text" },
    { key: "AccessCode", label: "رمز الوصول", type: "text" },
    { key: "SHARequestPhrase", label: "عبارة طلب SHA", type: "password" },
    { key: "SHAResponsePhrase", label: "عبارة استجابة SHA", type: "password" },
  ],
  stripe: [
    { key: "PublishableKey", label: "مفتاح النشر", type: "text" },
    { key: "SecretKey", label: "المفتاح السري", type: "password" },
    { key: "WebhookSecret", label: "سر الويب هوك", type: "password" },
  ],
  snapchat: [
    { key: "PixelID", label: "معرف بيكسل", type: "text" },
  ],
  google_analytics: [
    { key: "MeasurementID", label: "معرف القياس", type: "text" },
  ],
  mailchimp: [
    { key: "APIKey", label: "مفتاح API", type: "password" },
    { key: "AudienceID", label: "معرف الجمهور", type: "text" },
  ],
  qoyod: [
    { key: "APIKey", label: "مفتاح API", type: "password" },
  ],
  daftra: [
    { key: "APIKey", label: "مفتاح API", type: "password" },
    { key: "Subdomain", label: "النطاق الفرعي", type: "text" },
  ],
  odoo: [
    { key: "URL", label: "الرابط", type: "text" },
    { key: "DBName", label: "اسم قاعدة البيانات", type: "text" },
    { key: "Username", label: "اسم المستخدم", type: "text" },
    { key: "Password", label: "كلمة المرور", type: "password" },
  ],
};

export function IntegrationModal({ app, integration, onClose, onSave }: IntegrationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (integration?.config) {
      setFormData(integration.config);
    }
  }, [integration]);

  const fields = PROVIDER_FIELDS[app.provider] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" dir="rtl">
      <div className="bg-card w-full max-w-md p-6 rounded-lg border border-border/50 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">إعدادات {app.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-sm font-medium">{field.label}</label>
              <input
                type={field.type}
                className="w-full p-2 border border-border/50 rounded-md bg-background"
                value={formData[field.key] || ""}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                required
              />
            </div>
          ))}

          {fields.length === 0 && (
            <div className="text-sm text-muted-foreground">لا توجد إعدادات مطلوبة.</div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
