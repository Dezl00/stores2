const fs = require('fs');

let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

c = c.replace('<option value={40}>بطيء جداً</option>', '<option value={200}>بطيء جداً</option>');
c = c.replace('<option value={30}>بطيء</option>', '<option value={150}>بطيء</option>');
c = c.replace('<option value={20}>عادي</option>', '<option value={100}>عادي</option>');
c = c.replace('<option value={10}>سريع</option>', '<option value={60}>سريع</option>');
c = c.replace('<option value={5}>سريع جداً</option>', '<option value={30}>سريع جداً</option>');

fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
console.log("Updated speed options in settings-panel.tsx");
