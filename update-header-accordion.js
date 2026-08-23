const fs = require('fs');
let content = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

const replacement = `{expanded === "header" && (
                <div className="p-3 border-t border-border/50">
                  <div 
                    onClick={() => onSelectWidget("HEADER")}
                    className="bg-white border border-border/50 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-[#2453E3]/50 hover:shadow-md transition-all group"
                  >
                    <Settings2 className="w-4 h-4 text-slate-400 group-hover:text-[#2453E3]" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-[#2453E3]">إعدادات الهيدر</span>
                  </div>
                  
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
              )}`;

content = content.replace(/\{expanded === "header" && \([\s\S]*?<\/div>\s*\)\}/, replacement);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', content, 'utf8');
console.log("Updated header accordion in builder sidebar.");
