const fs = require('fs');
let code = fs.readFileSync('src/app/builder/builder-client.tsx', 'utf8');

code = code.replace(
  /headerSettings=\{headerSettings\}/,
  'headerSettings={headerSettings}\n              setHeaderSettings={setHeaderSettings}'
);

fs.writeFileSync('src/app/builder/builder-client.tsx', code);
console.log("Updated builder-client.tsx props");
