import os

filepath = 'src/app/admin/catalog/categories/categories-client.tsx'
with open(filepath, 'r', encoding='utf8') as f:
    content = f.read()

# 1. Component signature
content = content.replace(
    'export function CategoriesClient({ categories, departments = [] }: { categories: any[], departments?: any[] }) {',
    'export function CategoriesClient({ categories }: { categories: any[] }) {'
)

# 2. States
content = content.replace(
    '  const [filterDepartment, setFilterDepartment] = useState<string>("all")\n  const [filterCategory, setFilterCategory] = useState<string>("all")',
    ''
)

# 3. Filter dropdowns in JSX
filter_ui_old = """              <div className="flex items-center gap-2 w-full sm:w-auto">
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
              </div>"""

content = content.replace(filter_ui_old, '')

# 4. Filters logic
filter_logic_old = """    if (filterDepartment !== "all") {
      const parent = localCategories.find(p => p.id === c.parentId)
      if (c.departmentId !== filterDepartment && parent?.departmentId !== filterDepartment) return false
    }

    if (filterCategory !== "all") {
      if (c.id !== filterCategory && c.parentId !== filterCategory) return false
    }"""
content = content.replace(filter_logic_old, '')

# 5. Form editingCategory setup
form_edit_1 = """          const deptSelect = document.getElementById('departmentId-select') as HTMLSelectElement
          if (deptSelect) {
            deptSelect.value = editingCategory.departmentId || ""
          }"""
content = content.replace(form_edit_1, '')

form_edit_2 = """      const deptSelect = document.getElementById('departmentId-select') as HTMLSelectElement
      if (deptSelect) {
        deptSelect.value = ""
      }"""
content = content.replace(form_edit_2, '')

# 6. handleSubmit departmentId delete
submit_dep = """    if (categoryType === "main") {
      formData.delete("parentId")
    } else {
      formData.delete("departmentId")
    }"""
content = content.replace(submit_dep, """    if (categoryType === "main") {
      formData.delete("parentId")
    }""")

# 7. Form Select for departmentId
form_select = """                {categoryType === "main" && (
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
                )}"""
content = content.replace(form_select, '')

# 8. Table Headers
content = content.replace(
    '<th className="px-6 py-4 font-medium">القسم الرئيسي / المجال</th>',
    '<th className="px-6 py-4 font-medium">القسم الرئيسي</th>'
)

# 9. Table Body
table_body_old = """                        <td className="px-6 py-4">
                          {category.parent ? (
                            <span className="text-muted-foreground">{category.parent.name}</span>
                          ) : (
                            <span className="text-muted-foreground" title={departments.find(d => d.id === category.departmentId)?.name || ""}>
                              {truncateText(departments.find(d => d.id === category.departmentId)?.name || "-", 3)}
                            </span>
                          )}
                        </td>"""
table_body_new = """                        <td className="px-6 py-4">
                          {category.parent ? (
                            <span className="text-muted-foreground">{category.parent.name}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>"""
content = content.replace(table_body_old, table_body_new)

# 10. Mobile View tags
mobile_old = """                      <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                        <span className="text-muted-foreground text-xs">{category.parentId ? 'الرئيسي:' : 'المجال:'}</span>
                        <span className="font-medium text-xs" title={!category.parent ? (departments.find(d => d.id === category.departmentId)?.name || "") : ""}>
                          {category.parent 
                            ? category.parent.name 
                            : truncateText(departments.find(d => d.id === category.departmentId)?.name || "-", 3)}
                        </span>
                      </div>"""
mobile_new = """                      <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                        <span className="text-muted-foreground text-xs">الرئيسي:</span>
                        <span className="font-medium text-xs">
                          {category.parent ? category.parent.name : "-"}
                        </span>
                      </div>"""
content = content.replace(mobile_old, mobile_new)

# 11. Bulk Updates form extraction
bulk_extract_old = """    if (formData.has("departmentId")) {
      data.departmentId = formData.get("departmentId") as string
    }
    if (formData.has("parentId")) {
      data.parentId = formData.get("parentId") as string
    }"""
bulk_extract_new = """    if (formData.has("parentId")) {
      data.parentId = formData.get("parentId") as string
    }"""
content = content.replace(bulk_extract_old, bulk_extract_new)

# 12. Bulk actions button
bulk_btn_old = """                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => setIsBulkModalOpen(true)}
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    {(!localCategories.find(c => c.id === selectedIds[0])?.parentId) ? "تغيير المجال" : "تغيير القسم الرئيسي"}
                  </Button>"""
bulk_btn_new = """                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => setIsBulkModalOpen(true)}
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تغيير القسم الرئيسي
                  </Button>"""
content = content.replace(bulk_btn_old, bulk_btn_new)

# 13. Bulk Update Modal Title
bulk_modal_title_old = """              <h2 className="text-lg font-semibold tracking-tight">
                {(!localCategories.find(c => c.id === selectedIds[0])?.parentId) ? "تغيير المجال" : "تغيير القسم الرئيسي"}
              </h2>"""
bulk_modal_title_new = """              <h2 className="text-lg font-semibold tracking-tight">
                تغيير القسم الرئيسي
              </h2>"""
content = content.replace(bulk_modal_title_old, bulk_modal_title_new)

# 14. Bulk Update Modal fields
bulk_modal_form_old = """              <div className="space-y-2">
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
              </div>"""
bulk_modal_form_new = """              <div className="space-y-2">
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
              </div>"""
content = content.replace(bulk_modal_form_old, bulk_modal_form_new)

with open(filepath, 'w', encoding='utf8') as f:
    f.write(content)
