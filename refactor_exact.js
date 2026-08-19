const fs = require('fs');

let content = fs.readFileSync('src/app/admin/catalog/categories/categories-client.tsx', 'utf8');

// 1. Component signature
content = content.replace(
    'export function CategoriesClient({ categories, departments = [] }: { categories: any[], departments?: any[] }) {',
    'export function CategoriesClient({ categories }: { categories: any[] }) {'
);

// 2. States
content = content.replace(
    '  const [filterDepartment, setFilterDepartment] = useState<string>("all")\r\n  const [filterCategory, setFilterCategory] = useState<string>("all")',
    ''
);
content = content.replace(
    '  const [filterDepartment, setFilterDepartment] = useState<string>("all")\n  const [filterCategory, setFilterCategory] = useState<string>("all")',
    ''
);

// 3. Filter dropdowns in JSX
const filter_ui_old = `              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                  value={filterDepartment}
                  onChange={(e) => { setFilterDepartment(e.target.value); setFilterCategory("all"); }}
                  className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto max-w-[200px]"
                >
                  <option value="all">كل المجالات</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {filterDepartment !== "all" && (
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto max-w-[200px]"
                  >
                    <option value="all">كل الأقسام للمجال</option>
                    {localCategories.filter(c => !c.parentId && c.departmentId === filterDepartment).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>`;

content = content.split(filter_ui_old.replace(/\r\n/g, '\n')).join('').split(filter_ui_old.replace(/\n/g, '\r\n')).join('');

// 4. Filters logic
const filter_logic_old = `    if (filterDepartment !== "all") {
      const parent = localCategories.find(p => p.id === c.parentId)
      if (c.departmentId !== filterDepartment && parent?.departmentId !== filterDepartment) return false
    }

    if (filterCategory !== "all") {
      if (c.id !== filterCategory && c.parentId !== filterCategory) return false
    }`;
content = content.split(filter_logic_old.replace(/\r\n/g, '\n')).join('').split(filter_logic_old.replace(/\n/g, '\r\n')).join('');

// 5. Form editingCategory setup
const form_edit_1 = `          const deptSelect = document.getElementById('departmentId-select') as HTMLSelectElement
          if (deptSelect) {
            deptSelect.value = editingCategory.departmentId || ""
          }`;
content = content.split(form_edit_1.replace(/\r\n/g, '\n')).join('').split(form_edit_1.replace(/\n/g, '\r\n')).join('');

const form_edit_2 = `      const deptSelect = document.getElementById('departmentId-select') as HTMLSelectElement
      if (deptSelect) {
        deptSelect.value = ""
      }`;
content = content.split(form_edit_2.replace(/\r\n/g, '\n')).join('').split(form_edit_2.replace(/\n/g, '\r\n')).join('');


// 6. handleSubmit departmentId delete
const submit_dep = `    if (categoryType === "main") {
      formData.delete("parentId")
    } else {
      formData.delete("departmentId")
    }`;
const submit_dep_new = `    if (categoryType === "main") {
      formData.delete("parentId")
    }`;
content = content.split(submit_dep.replace(/\r\n/g, '\n')).join(submit_dep_new.replace(/\r\n/g, '\n')).split(submit_dep.replace(/\n/g, '\r\n')).join(submit_dep_new.replace(/\n/g, '\r\n'));

// 7. Form Select for departmentId
const form_select = `                {categoryType === "main" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">المجال التابع له <span className="text-red-500">*</span></label>
                    <select 
                      id="departmentId-select"
                      name="departmentId"
                      required
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                    >
                      <option value="">اختر المجال...</option>
                      {departments?.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}`;
content = content.split(form_select.replace(/\r\n/g, '\n')).join('').split(form_select.replace(/\n/g, '\r\n')).join('');

// 8. Table Headers
content = content.split('<th className="px-6 py-4 font-medium">القسم الرئيسي / المجال</th>').join('<th className="px-6 py-4 font-medium">القسم الرئيسي</th>');

// 9. Table Body
const table_body_old = `                        <td className="px-6 py-4">
                          {category.parent ? (
                            <span className="text-muted-foreground">{category.parent.name}</span>
                          ) : (
                            <span className="text-muted-foreground" title={departments.find(d => d.id === category.departmentId)?.name || ""}>
                              {truncateText(departments.find(d => d.id === category.departmentId)?.name || "-", 3)}
                            </span>
                          )}
                        </td>`;
const table_body_new = `                        <td className="px-6 py-4">
                          {category.parent ? (
                            <span className="text-muted-foreground">{category.parent.name}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>`;
content = content.split(table_body_old.replace(/\r\n/g, '\n')).join(table_body_new.replace(/\r\n/g, '\n')).split(table_body_old.replace(/\n/g, '\r\n')).join(table_body_new.replace(/\n/g, '\r\n'));

// 10. Mobile View tags
const mobile_old = `                      <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                        <span className="text-muted-foreground text-xs">{category.parentId ? 'الرئيسي:' : 'المجال:'}</span>
                        <span className="font-medium text-xs" title={!category.parent ? (departments.find(d => d.id === category.departmentId)?.name || "") : ""}>
                          {category.parent 
                            ? category.parent.name 
                            : truncateText(departments.find(d => d.id === category.departmentId)?.name || "-", 3)}
                        </span>
                      </div>`;
const mobile_new = `                      <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                        <span className="text-muted-foreground text-xs">الرئيسي:</span>
                        <span className="font-medium text-xs">
                          {category.parent ? category.parent.name : "-"}
                        </span>
                      </div>`;
content = content.split(mobile_old.replace(/\r\n/g, '\n')).join(mobile_new.replace(/\r\n/g, '\n')).split(mobile_old.replace(/\n/g, '\r\n')).join(mobile_new.replace(/\n/g, '\r\n'));


// 11. Bulk Updates form extraction
const bulk_extract_old = `    if (formData.has("departmentId")) {
      data.departmentId = formData.get("departmentId") as string
    }
    if (formData.has("parentId")) {
      data.parentId = formData.get("parentId") as string
    }`;
const bulk_extract_new = `    if (formData.has("parentId")) {
      data.parentId = formData.get("parentId") as string
    }`;
content = content.split(bulk_extract_old.replace(/\r\n/g, '\n')).join(bulk_extract_new.replace(/\r\n/g, '\n')).split(bulk_extract_old.replace(/\n/g, '\r\n')).join(bulk_extract_new.replace(/\n/g, '\r\n'));

// 12. Bulk actions button
const bulk_btn_old = `                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => setIsBulkModalOpen(true)}
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    {(!localCategories.find(c => c.id === selectedIds[0])?.parentId) ? "تغيير المجال" : "تغيير القسم الرئيسي"}
                  </Button>`;
const bulk_btn_new = `                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => setIsBulkModalOpen(true)}
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تغيير القسم الرئيسي
                  </Button>`;
content = content.split(bulk_btn_old.replace(/\r\n/g, '\n')).join(bulk_btn_new.replace(/\r\n/g, '\n')).split(bulk_btn_old.replace(/\n/g, '\r\n')).join(bulk_btn_new.replace(/\n/g, '\r\n'));


// 13. Bulk Update Modal Title
const bulk_modal_title_old = `              <h2 className="text-lg font-semibold tracking-tight">
                {(!localCategories.find(c => c.id === selectedIds[0])?.parentId) ? "تغيير المجال" : "تغيير القسم الرئيسي"}
              </h2>`;
const bulk_modal_title_new = `              <h2 className="text-lg font-semibold tracking-tight">
                تغيير القسم الرئيسي
              </h2>`;
content = content.split(bulk_modal_title_old.replace(/\r\n/g, '\n')).join(bulk_modal_title_new.replace(/\r\n/g, '\n')).split(bulk_modal_title_old.replace(/\n/g, '\r\n')).join(bulk_modal_title_new.replace(/\n/g, '\r\n'));

// 14. Bulk Update Modal fields
const bulk_modal_form_old = `              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {(!localCategories.find(c => c.id === selectedIds[0])?.parentId) ? "اختر المجال الجديد" : "اختر القسم الأب الجديد"}
                </label>
                {(!localCategories.find(c => c.id === selectedIds[0])?.parentId) ? (
                  <select 
                    name="departmentId"
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                  >
                    <option value="">اختر المجال...</option>
                    {departments?.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                ) : (
                  <select 
                    name="parentId"
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                  >
                    <option value="">اختر القسم الأب...</option>
                    {categories.filter(c => !c.parentId && !selectedIds.includes(c.id)).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                )}
              </div>`;
const bulk_modal_form_new = `              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  اختر القسم الأب الجديد
                </label>
                  <select 
                    name="parentId"
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                  >
                    <option value="">اختر القسم الأب...</option>
                    {categories.filter(c => !c.parentId && !selectedIds.includes(c.id)).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
              </div>`;
content = content.split(bulk_modal_form_old.replace(/\r\n/g, '\n')).join(bulk_modal_form_new.replace(/\r\n/g, '\n')).split(bulk_modal_form_old.replace(/\n/g, '\r\n')).join(bulk_modal_form_new.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/app/admin/catalog/categories/categories-client.tsx', content);
