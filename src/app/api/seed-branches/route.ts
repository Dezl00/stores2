import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const branches = [
      {
        name: "الإدارة",
        address: "أسوان - النفق عمارة مركز الزهراء الدور الثالث",
        phone: "01000329303",
      },
      {
        name: "معرض العسال فرنتشر للأثاث",
        address: "أسوان شارع الغازات أمام شركة الغازات سابقاً",
        phone: "01098711123",
      },
      {
        name: "مصنع العسال فرنتشر للأثاث",
        address: "أسوان - المنطقة الصناعية الجديدة بالعلاقي",
        phone: "01100663739",
      },
      {
        name: "معرض توتال وتجهيز الفنادق",
        address: "أسوان - العناني عمارة د. عبد الحميد حامد الدور الأرضي",
        phone: "01100663739",
      },
      {
        name: "مول العسال للعدد والأدوات والسلامة المهنية",
        address: "محافظة قنا - شارع 16 - مول العسال.",
        phone: "01100663739 - 01080911981",
      },
    ];

    const { resolveStoreId } = await import("@/lib/store-context");
    const storeId = await resolveStoreId();

    for (const branch of branches) {
      await db.branch.create({ data: { ...branch, storeId } });
    }

    return NextResponse.json({ success: true, message: "تم إضافة الفروع بنجاح!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
