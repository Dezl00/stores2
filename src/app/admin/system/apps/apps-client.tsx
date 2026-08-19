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
    label: "الشحن والتوصيل",
    apps: [
      { id: "aramex", name: "Aramex (أرامكس)", provider: "aramex" },
      { id: "bosta", name: "Bosta (بوسطة)", provider: "bosta" },
      { id: "jt_express", name: "J&T Express", provider: "jt_express" },
    ],
  },
  {
    id: "payment",
    label: "بوابات الدفع",
    apps: [
      { id: "paymob", name: "Paymob (باي موب)", provider: "paymob" },
      { id: "fawry", name: "Fawry (فوري)", provider: "fawry" },
      { id: "kashier", name: "Kashier (كاشير)", provider: "kashier" },
    ],
  },
  {
    id: "marketing",
    label: "التحليلات والتسويق",
    apps: [
      { id: "facebook", name: "Facebook Pixel", provider: "facebook_pixel" },
      { id: "snapchat", name: "Snapchat Pixel", provider: "snapchat" },
      { id: "google-analytics", name: "Google Analytics", provider: "google_analytics" },
    ],
  }
];

export function AppsClient({ initialIntegrations, storeId }: AppsClientProps) {
  const [integrations, setIntegrations] = useState(initialIntegrations || []);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);

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

  const activeCategory = CATEGORIES.find(c => c.id === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      
      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === category.id 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">{activeCategory?.label}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeCategory?.apps.map((app) => {
            const integration = getIntegration(app.provider);
            const isActive = integration?.isActive || false;

            return (
              <div
                key={app.id}
                className="p-5 flex flex-col justify-between bg-background border border-border/50 rounded-xl shadow-sm hover:border-primary/30 transition-colors gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-base">{app.name}</div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {isActive ? "نشط" : "غير نشط"}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/5 hover:text-primary"
                    onClick={() => setSelectedApp({...app, category: activeCategory.id})}
                  >
                    الإعدادات
                  </Button>
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => handleToggle(app.provider, activeCategory.id, checked)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
