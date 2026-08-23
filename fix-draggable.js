const fs = require('fs');
let content = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

// 1. Add state for drag handle
content = content.replace(
  /const \[draggedIdx, setDraggedIdx\] = React\.useState<number \| null>\(null\)/,
  `const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null)
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null)`
);

// 2. Modify the widget card
content = content.replace(
  /<div \s*key=\{widget\.id\}\s*draggable\s*onDragStart=\{\(e\) => handleDragStart\(e, idx\)\}/g,
  `<div 
                      key={widget.id}
                      draggable={activeDragId === widget.id}
                      onDragStart={(e) => handleDragStart(e, idx)}`
);

// 3. Add pointer events to the grip icon to activate drag
content = content.replace(
  /<div className="cursor-grab text-slate-300 hover:text-slate-500">\s*<GripVertical className="w-4 h-4" \/>\s*<\/div>/g,
  `<div 
                        className="cursor-grab text-slate-300 hover:text-slate-500 p-1"
                        onMouseDown={() => setActiveDragId(widget.id)}
                        onMouseUp={() => setActiveDragId(null)}
                        onMouseLeave={() => setActiveDragId(null)}
                        onTouchStart={() => setActiveDragId(widget.id)}
                        onTouchEnd={() => setActiveDragId(null)}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>`
);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', content, 'utf8');
console.log("Fixed draggable attribute in builder-sidebar.");
