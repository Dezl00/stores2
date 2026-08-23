const fs = require('fs');
let content = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

// Add X icon
content = content.replace(
  /import \{ ChevronRight, Settings, Image as ImageIcon, Plus, Trash2 \} from "lucide-react"/,
  'import { ChevronRight, Settings, Image as ImageIcon, Plus, Trash2, X } from "lucide-react"'
);

// Find the block using index to avoid regex parsing issues
const startStr = "if (editingItem) {";
const endStr = "    return (\n      <div className=\"flex flex-col h-full bg-white\">";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find blocks");
  process.exit(1);
}

const block = content.substring(startIndex, endIndex);

// We need to extract the actual JSX inside the return statement of the block
const jsxStart = block.indexOf("<div className=\"flex flex-col h-full bg-white relative");
const jsxEnd = block.lastIndexOf("</div>\n      )\n    }");

if (jsxStart === -1 || jsxEnd === -1) {
  console.log("Could not find JSX inside block");
  process.exit(1);
}

let jsxContent = block.substring(jsxStart, jsxEnd + 6); // +6 to include </div>

// Transform the JSX content into a modal
jsxContent = jsxContent.replace(
  /<div className="h-14 flex items-center gap-3 px-4 border-b border-border\/50 shrink-0 bg-slate-50">([\s\S]*?)<\/div>\s*<div className="flex-1 overflow-y-auto p-4 space-y-6">/,
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
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]">`
);

const modalHTML = `
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" dir="rtl">
            ${jsxContent}
          </div>
        </div>
      )}
`;

// Remove the block
content = content.substring(0, startIndex) + content.substring(endIndex);

// Append the modal at the end of the main return
const finalClosing = "</div>\n    )\n  }";
const finalIndex = content.lastIndexOf(finalClosing);

if (finalIndex !== -1) {
  content = content.substring(0, finalIndex) + modalHTML + "\n      " + finalClosing + content.substring(finalIndex + finalClosing.length);
}

fs.writeFileSync('src/app/builder/settings-panel.tsx', content, 'utf8');
console.log("Safely converted to modal.");
