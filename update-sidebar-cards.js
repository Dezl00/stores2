const fs = require('fs');
let content = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

// 1. Reduce padding and gap
content = content.replace(
  /"group bg-white border border-border\/50 rounded-lg p-2.5 flex items-center gap-3 cursor-pointer transition-all hover:border-\[\#2453E3\]\/50 hover:shadow-md"/g,
  '"group bg-white border border-border/50 rounded-lg p-1.5 flex items-center gap-2 cursor-pointer transition-all hover:border-[#2453E3]/50 hover:shadow-md"'
);

// 2. Reduce text size
content = content.replace(
  /<p className="text-sm font-bold text-slate-800 truncate group-hover:text-\[\#2453E3\] transition-colors">\{widget.title \|\| widget.type\}<\/p>/g,
  '<p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#2453E3] transition-colors">{widget.title || widget.type}</p>'
);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', content, 'utf8');
console.log("Updated builder sidebar cards.");
