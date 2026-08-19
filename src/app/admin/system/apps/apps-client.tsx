"use client";

import { useState } from "react";
import { IntegrationModal } from "./integration-modal";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { saveIntegration } from "@/features/integrations/actions";

interface Integration {
  id: string;
  provider: string;
  isActive: boolean;
  category: string;
  config: any;
}

interface AppsClientProps {
  initialIntegrations: Integration[];
  storeId: string;
}

const CATEGORIES = [
  {
    id: "shipping",
    label: "الشحن",
    apps: [
      { id: "aramex", name: "Aramex", provider: "aramex" },
      { id: "smsa", name: "SMSA", provider: "smsa" },
      { id: "saee", name: "Saee", provider: "saee" },
    ],
  },
  {
    id: "payment",
    label: "الدفع",
    apps: [
      { id: "tap", name: "Tap", provider: "tap" },
      { id: "payfort", name: "Payfort", provider: "payfort" },
      { id: "stripe", name: "Stripe", provider: "stripe" },
    ],
  },
  {
    id: "marketing",
    label: "التسويق",
    apps: [
      { id: "snapchat", name: "Snapchat Pixel", provider: "snapchat" },
      { id: "google-analytics", name: "Google Analytics", provider: "google_analytics" },
      { id: "mailchimp", name: "Mailchimp", provider: "mailchimp" },
    ],
  },
  {
    id: "accounting",
    label: "المحاسبة",
    apps: [
      { id: "qoyod", name: "Qoyod", provider: "qoyod" },
      { id: "daftra", name: "Daftra", provider: "daftra" },
      { id: "odoo", name: "Odoo", provider: "odoo" },
    ],
  },
];

export function AppsClient({ initialIntegrations, storeId }: AppsClientProps) {
  const [integrations, setIntegrations] = useState(initialIntegrations || []);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const getIntegration = (provider: string) => {
    return integrations.find((i) => i.provider === provider);
  };

  const handleToggle = async (provider: string, category: string, checked: boolean) => {
    const integration = getIntegration(provider);
    const config = integration?.config || {};
    
    // Optimistic update
    const newIntegrations = [...integrations];
    const index = newIntegrations.findIndex((i) => i.provider === provider);
    
    if (index >= 0) {
      newIntegrations[index].isActive = checked;
    } else {
      newIntegrations.push({
        id: "",
        provider,
        category,
        isActive: checked,
        config
      });
    }
    setIntegrations(newIntegrations);

    await saveIntegration(provider, category, config, checked);
  };

  return (
    <div className="space-y-8" dir="rtl">
      {CATEGORIES.map((category) => (
        <div key={category.id} className="space-y-4">
          <h2 className="text-xl font-semibold">{category.label}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.apps.map((app) => {
              const integration = getIntegration(app.provider);
              const isActive = integration?.isActive || false;

              return (
                <div
                  key={app.id}
                  className="p-4 flex items-center justify-between bg-card border border-border/50 rounded-lg shadow-sm"
                >
                  <div className="font-medium">{app.name}</div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApp({...app, category: category.id})}
                    >
                      الإعدادات
                    </Button>
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) => handleToggle(app.provider, category.id, checked)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {selectedApp && (
        <IntegrationModal
          app={selectedApp}
          integration={getIntegration(selectedApp.provider)}
          onClose={() => setSelectedApp(null)}
          onSave={async (config) => {
            const isActive = getIntegration(selectedApp.provider)?.isActive ?? false;
            await saveIntegration(selectedApp.provider, selectedApp.category, config, isActive);
            
            setIntegrations((prev) => {
              const copy = [...prev];
              const idx = copy.findIndex((i) => i.provider === selectedApp.provider);
              if (idx >= 0) {
                copy[idx].config = config;
              } else {
                copy.push({
                  id: "",
                  provider: selectedApp.provider,
                  category: selectedApp.category,
                  isActive,
                  config
                });
              }
              return copy;
            });
            setSelectedApp(null);
          }}
        />
      )}
    </div>
  );
}
