const fs = require('fs');

let client = fs.readFileSync('src/app/builder/builder-client.tsx', 'utf8');
client = client.replace(
  'className="w-80 flex-shrink-0 bg-white border-l border-border/50 flex flex-col z-20 shadow-sm transition-transform duration-300"',
  'className="w-80 flex-shrink-0 bg-white border-l border-border/50 flex flex-col min-h-0 z-20 shadow-sm transition-transform duration-300"'
);
fs.writeFileSync('src/app/builder/builder-client.tsx', client, 'utf8');

let sidebar = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  'className="flex flex-col h-full bg-white"',
  'className="flex flex-col h-full bg-white min-h-0"'
);
fs.writeFileSync('src/app/builder/builder-sidebar.tsx', sidebar, 'utf8');

console.log("Added min-h-0 to fix scrolling");
