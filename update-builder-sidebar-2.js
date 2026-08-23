const fs = require('fs');
let content = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

// 1. Remove MarqueeAlerts from WIDGET_TYPES
content = content.replace(
  /\{\s*id:\s*"MarqueeAlerts".*?\},?\s*/g,
  ''
);

// 2. Change PromoBentoGrid name
content = content.replace(
  /name:\s*"صور إعلانية \(Bento\)"/,
  'name: "صور إعلانية"'
);

// 3. Limit content widgets to 7. 
// Find: onClick={() => setIsAddModalOpen(true)}
content = content.replace(
  /<button \s*onClick=\{\(\) => setIsAddModalOpen\(true\)\}\s*className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-\[\#2453E3\]\/30 text-\[\#2453E3\] font-bold py-3 mt-2 rounded-lg hover:bg-\[\#2453E3\]\/5 transition-colors"\s*>\s*<Plus className="w-5 h-5" \/>\s*إضافة قسم جديد\s*<\/button>/g,
  `{sortedWidgets.filter(w => w.type !== "MarqueeAlerts").length < 7 && (
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#2453E3]/30 text-[#2453E3] font-bold py-3 mt-2 rounded-lg hover:bg-[#2453E3]/5 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      إضافة قسم جديد
                    </button>
                  )}`
);

// 4. Add MarqueeAlerts to Header accordion
const headerAddition = `
                <div className="p-3 border-t border-border/50">
                  <div 
                    onClick={() => {
                      const existingMarquee = widgets.find((w: any) => w.type === "MarqueeAlerts");
                      if (existingMarquee) {
                        onSelectWidget(existingMarquee.id);
                      } else {
                        const newWidget = {
                          id: \`new-\${Date.now()}\`,
                          type: "MarqueeAlerts",
                          title: "شريط التنبيهات",
                          status: true,
                          showDesktop: true,
                          showTablet: true,
                          showMobile: true,
                          sortOrder: -1,
                          settings: { scrollDirection: "right", backgroundColor: "#000000", textColor: "#ffffff" },
                          items: []
                        };
                        const updatedWidgets = [newWidget, ...widgets];
                        // re-sort
                        updatedWidgets.forEach((w, i) => w.sortOrder = i);
                        setWidgets(updatedWidgets);
                        onSelectWidget(newWidget.id);
                        onSave(true, { widgets: updatedWidgets, headerSettings, footerSettings });
                      }
                    }}
                    className="bg-white border border-border/50 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-[#2453E3]/50 hover:shadow-md transition-all group mt-2"
                  >
                    <AlignLeft className="w-4 h-4 text-slate-400 group-hover:text-[#2453E3]" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-[#2453E3]">شريط التنبيهات</span>
                  </div>
                </div>
`;
content = content.replace(
  /\{\s*expanded === "header" && \(\s*<div className="p-3 border-t border-border\/50">\s*<div \s*onClick=\{\(\) => onSelectWidget\("HEADER"\)\}\s*className="bg-white border border-border\/50 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-\[\#2453E3\]\/50 hover:shadow-md transition-all group"\s*>\s*<Settings2 className="w-4 h-4 text-slate-400 group-hover:text-\[\#2453E3\]" \/>\s*<span className="text-sm font-bold text-slate-700 group-hover:text-\[\#2453E3\]">إعدادات الهيدر<\/span>\s*<\/div>\s*<\/div>\s*\)\s*\}/,
  `{expanded === "header" && (
                <div className="p-3 border-t border-border/50">
                  <div 
                    onClick={() => onSelectWidget("HEADER")}
                    className="bg-white border border-border/50 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-[#2453E3]/50 hover:shadow-md transition-all group"
                  >
                    <Settings2 className="w-4 h-4 text-slate-400 group-hover:text-[#2453E3]" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-[#2453E3]">إعدادات الهيدر</span>
                  </div>
                  ${headerAddition.replace(/<div className="p-3 border-t border-border\/50">/, "").replace(/<\/div>\s*$/, "")}
                </div>
              )}`
);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', content, 'utf8');
console.log("Updated builder-sidebar limits and marquee location.");
