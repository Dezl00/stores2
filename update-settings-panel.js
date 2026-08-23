const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

// 1. Replace single image uploader with dual for HeroSlider
const marker1 = 'صورة العنصر (أو الأيقونة)';
const idx1 = c.indexOf(marker1);
console.log('Found marker1 at index:', idx1);

// Find the <div className="space-y-2"> before the marker
// We need to find the start of this block
const blockStart = c.lastIndexOf('<div className="space-y-2">', idx1);
console.log('Block start at:', blockStart);

// Find the closing </div> after the ImageUploader block
// After the marker, we have: label > div > ImageUploader > /div > /div > /div
let depth = 0;
let searchFrom = blockStart;
let blockEnd = -1;

// Count 3 closing divs from blockStart
let divCount = 0;
for (let i = blockStart; i < c.length; i++) {
  if (c.substring(i, i+5) === '<div ') depth++;
  if (c.substring(i, i+6) === '</div>') {
    depth--;
    if (depth === 0) {
      blockEnd = i + 6;
      break;
    }
  }
}
console.log('Block end at:', blockEnd);

if (blockStart > 0 && blockEnd > 0) {
  const oldBlock = c.substring(blockStart, blockEnd);
  console.log('Old block length:', oldBlock.length);
  
  const newBlock = `{widget.type === "HeroSlider" ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">صورة الشاشات الكبيرة (Desktop)</label>
                  <div className="bg-slate-50 border border-border/50 rounded-xl p-4">
                    <ImageUploader 
                      label=""
                      value={editingItem.desktopImage || ""} 
                      onChange={(url) => {
                        handleUpdateItem({ ...editingItem, desktopImage: url })
                      }} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">صورة الهواتف (Mobile)</label>
                  <div className="bg-slate-50 border border-border/50 rounded-xl p-4">
                    <ImageUploader 
                      label=""
                      value={editingItem.mobileImage || ""} 
                      onChange={(url) => {
                        handleUpdateItem({ ...editingItem, mobileImage: url })
                      }} 
                    />
                  </div>
                </div>
              </>
            ) : (
              ${oldBlock}
            )}`;
  
  c = c.substring(0, blockStart) + newBlock + c.substring(blockEnd);
  console.log('1. SUCCESS: Replaced image block');
} else {
  console.error('1. FAILED');
}

// 2. Add productList to redirect dropdown
const marker2 = '<option value="page">';
const pageIdx = c.indexOf(marker2, c.indexOf('redirectType'));
if (pageIdx > 0) {
  // Find the end of that option tag
  const optionEnd = c.indexOf('</option>', pageIdx) + '</option>'.length;
  const afterOption = c.substring(optionEnd);
  
  // Check if productList already exists
  if (!afterOption.substring(0, 200).includes('productList')) {
    c = c.substring(0, optionEnd) + '\n                  <option value="productList">قائمة منتجات</option>' + afterOption;
    console.log('2. SUCCESS: Added productList option');
  } else {
    console.log('2. SKIPPED: productList already exists');
  }
} else {
  console.error('2. FAILED: Could not find page option');
}

fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
console.log('Done!');
