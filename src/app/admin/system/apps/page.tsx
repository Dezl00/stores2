import { resolveStoreId } from "@/lib/store-context";
import { db } from "@/lib/db";
import { AppsClient } from "./apps-client";

export default async function AppsPage() {
  const storeId = await resolveStoreId();
  
  // Fetch integrations from the database
  const initialIntegrations = await db.appIntegration.findMany({
    where: { storeId },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <span>الرئيسية</span>
        <span>/</span>
        <span className="text-foreground">التطبيقات والربط</span>
      </nav>
      <AppsClient 
        initialIntegrations={initialIntegrations} 
        storeId={storeId} 
      />
    </div>
  );
}