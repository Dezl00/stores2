const fs = require('fs');

let content = fs.readFileSync('src/app/admin/catalog/categories/categories-client.tsx', 'utf8');

// 1. Function signature
content = content.replace(
  /export function CategoriesClient\(\{ categories, departments = \[\] \}: \{ categories: any\[\], departments\?: any\[\] \}\) \{/,
  'export function CategoriesClient({ categories }: { categories: any[] }) {'
);

// 2. Remove states
content = content.replace(
  /const \[filterDepartment, setFilterDepartment\] = useState<string>\("all"\)\r?\n\s*const \[filterCategory, setFilterCategory\] = useState<string>\("all"\)/,
  ''
);

// 3. Remove department filter in filteredCategories
content = content.replace(
  /if \(filterDepartment !== "all"\) \{[\s\S]*?if \(filterCategory !== "all"\) \{[\s\S]*?\}\r?\n/,
  ''
);

// 4. Remove departmentId from form reset / editingCategory sync
content = content.replace(
  /const deptSelect = document.getElementById\('departmentId-select'\) as HTMLSelectElement\r?\n\s*if \(deptSelect\) \{\r?\n\s*deptSelect\.value = editingCategory\.departmentId \|\| ""\r?\n\s*\}/g,
  ''
);
content = content.replace(
  /const deptSelect = document.getElementById\('departmentId-select'\) as HTMLSelectElement\r?\n\s*if \(deptSelect\) \{\r?\n\s*deptSelect\.value = ""\r?\n\s*\}/g,
  ''
);

// 5. Remove departmentId from handleSubmit
content = content.replace(
  /\} else \{\r?\n\s*formData\.delete\("departmentId"\)\r?\n\s*\}/g,
  '} else {\n      // removed departmentId\n    }'
);

// 6. Remove filters UI
content = content.replace(
  /<div className="flex items-center gap-2 w-full sm:w-auto">[\s\S]*?<\/div>\r?\n\s*<\/div>\r?\n\s*\{\/\* Bulk Actions Bar \*\/\}/,
  '</div>\n            {/* Bulk Actions Bar */}'
);

// 7. Update table headers
content = content.replace(
  /<th className="px-6 py-4 font-medium">القسم الرئيسي \/ المجال<\/th>/g,
  '<th className="px-6 py-4 font-medium">القسم الرئيسي</th>'
);

// 8. Update table body column
content = content.replace(
  /<span className="text-muted-foreground" title=\{departments\.find\(d => d\.id === category\.departmentId\)\?\.name \|\| ""\}>\r?\n\s*\{truncateText\(departments\.find\(d => d\.id === category\.departmentId\)\?\.name \|\| "-", 3\)\}\r?\n\s*<\/span>/g,
  '<span className="text-muted-foreground">-</span>'
);

// 9. Update mobile view tags
content = content.replace(
  /<span className="text-muted-foreground text-xs">\{category\.parentId \? 'الرئيسي:' : 'المجال:'\}<\/span>\r?\n\s*<span className="font-medium text-xs" title=\{!category\.parent \? \(departments\.find\(d => d\.id === category\.departmentId\)\?\.name \|\| ""\) : ""\}>\r?\n\s*\{category\.parent \r?\n\s*\? category\.parent\.name \r?\n\s*: truncateText\(departments\.find\(d => d\.id === category\.departmentId\)\?\.name \|\| "-", 3\)\}\r?\n\s*<\/span>/g,
  '<span className="text-muted-foreground text-xs">الرئيسي:</span>\n                        <span className="font-medium text-xs">\n                          {category.parent ? category.parent.name : "-"}\n                        </span>'
);

// 10. Form fields removal
content = content.replace(
  /\{categoryType === "main" && \([\s\S]*?\}\)/,
  ''
);

// 11. Remove department logic from bulkUpdate
content = content.replace(
  /if \(formData\.has\("departmentId"\)\) \{\r?\n\s*data\.departmentId = formData\.get\("departmentId"\) as string\r?\n\s*\}/g,
  ''
);

// 12. Fix bulk action button texts
content = content.replace(
  /\{\(!localCategories\.find\(c => c\.id === selectedIds\[0\]\)\?\.parentId\) \? "تغيير المجال" : "تغيير القسم الرئيسي"\}/g,
  '"تغيير القسم الأب"'
);

// 13. Modal logic in bulkUpdate
content = content.replace(
  /\{!\(!localCategories\.find\(c => c\.id === selectedIds\[0\]\)\?\.parentId\) \? \([\s\S]*?\) : \(/,
  '('
);
content = content.replace(
  /<label className="text-sm font-medium text-foreground">\r?\n\s*\{!\(!localCategories\.find\(c => c\.id === selectedIds\[0\]\)\?\.parentId\) \? "اختر المجال الجديد" : "اختر القسم الأب الجديد"\}\r?\n\s*<\/label>\r?\n\s*\{!\(!localCategories\.find\(c => c\.id === selectedIds\[0\]\)\?\.parentId\) \? \([\s\S]*?\) : \([\s\S]*?\}\)/,
  `<label className="text-sm font-medium text-foreground">
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
                  </select>`
);

content = content.replace(
  /<label className="text-sm font-medium text-foreground">\r?\n\s*\{\(!localCategories\.find\(c => c\.id === selectedIds\[0\]\)\?\.parentId\) \? "اختر المجال الجديد" : "اختر القسم الأب الجديد"\}\r?\n\s*<\/label>\r?\n\s*\{\(!localCategories\.find\(c => c\.id === selectedIds\[0\]\)\?\.parentId\) \? \([\s\S]*?\) : \(/,
  `<label className="text-sm font-medium text-foreground">
                  اختر القسم الأب الجديد
                </label>
                (`
);

fs.writeFileSync('src/app/admin/catalog/categories/categories-client.tsx', content);
console.log('Done refactoring');
