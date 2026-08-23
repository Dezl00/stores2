const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

if (!c.includes('import { Switch }')) {
  c = c.replace('import { Input }', 'import { Switch } from "@/components/ui/switch"\nimport { Input }');
}
c = c.replace(/onCheckedChange=\{\(checked\)/g, 'onCheckedChange={(checked: boolean)');

fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
