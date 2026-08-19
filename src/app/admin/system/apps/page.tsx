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
      <h1 className="text-3xl font-bold mb-8">التطبيقات والربط</h1>
      <AppsClient 
        initialIntegrations={initialIntegrations} 
        storeId={storeId} 
      />
    </div>
  );
}