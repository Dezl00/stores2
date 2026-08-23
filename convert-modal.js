const fs = require('fs');
let content = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

// 1. Add X icon
content = content.replace(
  /import \{ ChevronRight, Settings, Image as ImageIcon, Plus, Trash2 \} from "lucide-react"/,
  'import { ChevronRight, Settings, Image as ImageIcon, Plus, Trash2, X } from "lucide-react"'
);

// 2. Extract the editingItem form block
const blockRegex = /if \(editingItem\) \{\s*return \(\s*<div className="flex flex-col h-full bg-white relative animate-in slide-in-from-right-4 duration-300">([\s\S]*?)<\/div>\s*\)\s*\}/;

const match = content.match(blockRegex);
if (!match) {
  console.error("Could not find editingItem block.");
  process.exit(1);
}

const innerContent = match[1];

// We'll replace the top header of that block to look like a modal header
let modalInner = innerContent.replace(
  /<div className="h-14 flex items-center gap-3 px-4 border-b border-border\/50 shrink-0 bg-slate-50">([\s\S]*?)<\/div>\s*<\/div>/,
  `<div className="h-14 flex items-center justify-between px-6 border-b border-border/50 shrink-0 bg-slate-50">
            <div>
              <h3 className="font-bold text-sm text-slate-800">تعديل العنصر</h3>
              <p className="text-[11px] text-slate-500">تخصيص خصائص العنصر</p>
            </div>
            <button 
              onClick={() => setEditingItem(null)}
              className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>`
);

// Update padding and max-height for modal body
modalInner = modalInner.replace(
  /<div className="flex-1 overflow-y-auto p-4 space-y-6">/,
  '<div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]">'
);


const modalHTML = `
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" dir="rtl">
            ${modalInner}
          </div>
        </div>
      )}
`;

// Remove the `if (editingItem) { return (...) }`
content = content.replace(blockRegex, '');

// Inject the modal before the final `</div>`
// Wait, the main render is:
// return (
//   <div className="flex flex-col h-full bg-white"> ... </div>
// )
content = content.replace(
  /(\s*<\/div>\s*)\)\s*\}\s*$/,
  (m, closingDiv) => `\n${modalHTML}\n${closingDiv})\n}`
);

fs.writeFileSync('src/app/builder/settings-panel.tsx', content, 'utf8');
console.log("Moved editingItem to a modal.");
