const fs = require('fs');
let content = fs.readFileSync('src/app/admin/admin-layout-client.tsx', 'utf8');

// 1. Imports
content = content.replace(
  /import \{ (.*?) \} from "lucide-react"/, 
  (match, p1) => {
    let icons = p1.split(',').map(i => i.trim());
    const needed = ['ChevronDown', 'Home', 'Megaphone', 'Store', 'Shield'];
    needed.forEach(n => {
      if (!icons.includes(n)) icons.push(n);
    });
    return `import { ${icons.join(', ')} } from "lucide-react"`;
  }
);

// 2. Add icons to navGroups
content = content.replace(/title: "الرئيسية",\r?\n\s*items:/g, 'title: "الرئيسية",\n      icon: Home,\n      items:');
content = content.replace(/title: "المبيعات",\r?\n\s*items:/g, 'title: "المبيعات",\n      icon: ShoppingBag,\n      items:');
content = content.replace(/title: "الكتالوج",\r?\n\s*items:/g, 'title: "الكتالوج",\n      icon: ListTree,\n      items:');
content = content.replace(/title: "التسويق",\r?\n\s*items:/g, 'title: "التسويق",\n      icon: Megaphone,\n      items:');
content = content.replace(/title: "واجهة المتجر",\r?\n\s*items:/g, 'title: "واجهة المتجر",\n      icon: Store,\n      items:');
content = content.replace(/title: "النظام",\r?\n\s*items:/g, 'title: "النظام",\n      icon: Shield,\n      items:');

// 3. Add NavGroup
const navGroupCode = `function NavGroup({ group, pathname, isMobile, setMobileMenuOpen }: { group: any, pathname: string, isMobile?: boolean, setMobileMenuOpen?: (open: boolean) => void }) {
  const groupItems = group.items.filter((i: any) => i.show)
  if (groupItems.length === 0) return null

  const isActiveGroup = groupItems.some((item: any) => {
    if (item.href === '/admin') return pathname === '/admin'
    return pathname.startsWith(item.href)
  })

  const [isOpen, setIsOpen] = React.useState(isActiveGroup || group.title === "الرئيسية")

  React.useEffect(() => {
    if (isActiveGroup) setIsOpen(true)
  }, [isActiveGroup])

  return (
    <div className="space-y-1 mb-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-[#2453E3] transition-colors focus:outline-none group"
      >
        <div className="flex items-center gap-2">
          {group.icon && <group.icon className={cn("h-4 w-4", isOpen ? "text-[#2453E3]" : "text-slate-400 group-hover:text-[#2453E3]")} />}
          <span className={cn(isOpen ? "text-[#2453E3]" : "")}>{group.title}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen ? "rotate-180 text-[#2453E3]" : "text-slate-400")} />
      </button>
      
      <div 
        className={cn(
          "space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {groupItems.map((item: any) => {
          const isActive = pathname === item.href
          return (
            <Link prefetch={false}
              key={item.name}
              href={item.href}
              onClick={() => isMobile && setMobileMenuOpen && setMobileMenuOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-95",
                isActive ? "bg-[#2453E3] text-white shadow-sm" : "hover:bg-slate-50 text-slate-600 hover:text-[#2453E3]"
              )}
            >
              <item.icon className={cn("h-4 w-4 transition-colors rtl-flip", isActive ? "text-white" : "text-slate-400 group-hover:text-[#2453E3]")} />
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

`;

content = content.replace("function AdminLayoutInner", navGroupCode + "function AdminLayoutInner");

// 4. Replace the old nav block using regex dotAll
const oldNavRegex = /<nav className="p-4 space-y-6 flex-1 overflow-y-auto">[\s\S]*?<\/nav>/g;
const matches = [...content.matchAll(oldNavRegex)];
if (matches.length === 2) {
    const newDesktopNav = `<nav className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => (
            <NavGroup key={group.title} group={group} pathname={pathname} isMobile={false} />
          ))}
        </nav>`;

    const newMobileNav = `<nav className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => (
            <NavGroup key={group.title} group={group} pathname={pathname} isMobile={true} setMobileMenuOpen={setIsMobileMenuOpen} />
          ))}
        </nav>`;
    
    // Replace first
    content = content.replace(matches[0][0], newDesktopNav);
    // Replace second
    content = content.replace(matches[1][0], newMobileNav);
    console.log("Successfully replaced both navs");
} else {
    console.log("WARNING: Found " + matches.length + " matches instead of 2!");
}

fs.writeFileSync('src/app/admin/admin-layout-client.tsx', content, 'utf8');
