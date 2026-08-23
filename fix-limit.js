const fs = require('fs');
let content = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

// Revert the < 7 restriction
content = content.replace(
  /\{sortedWidgets\.filter\(w => w\.type !== "MarqueeAlerts"\)\.length < 7 && \([\s\S]*?<button \s*onClick=\{\(\) => setIsAddModalOpen\(true\)\}[\s\S]*?<\/button>\s*\)\s*\}/,
  `<button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#2453E3]/30 text-[#2453E3] font-bold py-3 mt-2 rounded-lg hover:bg-[#2453E3]/5 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      إضافة قسم جديد
                    </button>`
);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', content, 'utf8');
console.log("Reverted the < 7 limit on add section.");
