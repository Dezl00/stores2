const fs = require('fs');
let content = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

// 1. Add imports for ProductPickerModal
content = content.replace(
  /import \{ Button \} from "@\/components\/ui\/button"/,
  'import { Button } from "@/components/ui/button"\nimport { ProductPickerModal } from "@/components/admin/product-picker-modal"'
);

// 2. Add state for ProductPickerModal
content = content.replace(
  /const \[editingItem, setEditingItem\] = useState<any>\(null\)/,
  'const [editingItem, setEditingItem] = useState<any>(null)\n  const [productPickerOpen, setProductPickerOpen] = useState(false)'
);

// 3. Replace the basic buttonUrl field with advanced routing fields
const routingFields = `
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">نص الزر (اختياري)</label>
                <Input 
                  value={editingItem.buttonText || ""} 
                  onChange={(e) => handleUpdateItem({ ...editingItem, buttonText: e.target.value })}
                  className="bg-slate-50 text-xs"
                  placeholder="مثال: تسوق الآن"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">توجيه الزر / الصورة</label>
                <select
                  value={editingItem.redirectType || "custom"}
                  onChange={(e) => {
                    handleUpdateItem({ ...editingItem, redirectType: e.target.value, redirectId: "", buttonUrl: "" })
                  }}
                  className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                >
                  <option value="custom">رابط مخصص</option>
                  <option value="product">منتج</option>
                  <option value="category">تصنيف</option>
                  <option value="page">صفحة</option>
                </select>
              </div>

              {(!editingItem.redirectType || editingItem.redirectType === "custom") && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">الرابط المخصص</label>
                  <Input 
                    value={editingItem.buttonUrl || ""} 
                    onChange={(e) => handleUpdateItem({ ...editingItem, buttonUrl: e.target.value })}
                    className="bg-slate-50 text-xs text-left"
                    dir="ltr"
                    placeholder="https://..."
                  />
                </div>
              )}

              {editingItem.redirectType === "category" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">اختر التصنيف</label>
                  <select
                    value={editingItem.redirectId || ""}
                    onChange={(e) => handleUpdateItem({ ...editingItem, redirectId: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                  >
                    <option value="">-- اختر --</option>
                    {categories?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {editingItem.redirectType === "page" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">اختر الصفحة</label>
                  <select
                    value={editingItem.redirectId || ""}
                    onChange={(e) => handleUpdateItem({ ...editingItem, redirectId: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                  >
                    <option value="">-- اختر --</option>
                    <option value="about">من نحن</option>
                    <option value="contact">اتصل بنا</option>
                    <option value="terms">الشروط والأحكام</option>
                    <option value="privacy">سياسة الخصوصية</option>
                  </select>
                </div>
              )}

              {editingItem.redirectType === "product" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">المنتج المختار</label>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-slate-50 text-xs h-10"
                    onClick={() => setProductPickerOpen(true)}
                  >
                    <span className="truncate">{editingItem.redirectId ? "تغيير المنتج" : "اختر منتجاً..."}</span>
                  </Button>
                  {productPickerOpen && (
                    <ProductPickerModal 
                      open={productPickerOpen}
                      onOpenChange={setProductPickerOpen}
                      initialSelectedIds={editingItem.redirectId ? [editingItem.redirectId] : []}
                      single={true}
                      onSave={(selected: string[]) => {
                        handleUpdateItem({ ...editingItem, redirectId: selected[0] || "" })
                      }}
                    />
                  )}
                </div>
              )}
`;

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-xs font-bold text-slate-600 block">[^<]*?\(اختياري\)<\/label>\s*<Input \s*value=\{editingItem\.buttonUrl \|\| ""\}\s*onChange=\{\(e\) => handleUpdateItem\(\{ \.\.\.editingItem, buttonUrl: e\.target\.value \}\)\}\s*className="bg-slate-50 text-xs text-left"\s*dir="ltr"\s*placeholder="https:\/\/\.\.\."\s*\/>\s*<\/div>/,
  routingFields
);

fs.writeFileSync('src/app/builder/settings-panel.tsx', content, 'utf8');
console.log("Updated item routing settings.");
