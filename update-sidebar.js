const fs = require('fs');
let content = fs.readFileSync('src/app/admin/admin-layout-client.tsx', 'utf8');

// We will replace the existing NavGroup component and the rendering block.
const newNavCode = `
function SidebarNav({ navGroups, pathname, isMobile, setMobileMenuOpen }: any) {
  const [openGroup, setOpenGroup] = React.useState<string | null>(null)

  React.useEffect(() => {
    const activeGroup = navGroups.find((g: any) => g.items.some((i: any) => i.show && (i.href === '/admin' ? pathname === '/admin' : pathname.startsWith(i.href))))
    if (activeGroup) {
      setOpenGroup(activeGroup.title)
    } else {
      setOpenGroup("الرئيسية")
    }
  }, [pathname, navGroups])

  return (
    <nav className="p-4 flex-1 overflow-y-auto custom-scrollbar">
      {navGroups.map((group: any) => (
        <NavGroup 
           key={group.title} 
           group={group} 
           pathname={pathname} 
           isMobile={isMobile} 
           setMobileMenuOpen={setMobileMenuOpen}
           isOpen={openGroup === group.title}
           onToggle={() => setOpenGroup(openGroup === group.title ? null : group.title)}
        />
      ))}
    </nav>
  )
}

function NavGroup({ group, pathname, isMobile, setMobileMenuOpen, isOpen, onToggle }: { group: any, pathname: string, isMobile?: boolean, setMobileMenuOpen?: (open: boolean) => void, isOpen: boolean, onToggle: () => void }) {
  const groupItems = group.items.filter((i: any) => i.show)
  if (groupItems.length === 0) return null

  const isActiveGroup = groupItems.some((item: any) => {
    if (item.href === '/admin') return pathname === '/admin'
    return pathname.startsWith(item.href)
  })

  return (
    <div className="space-y-1 mb-2">
      <button 
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold transition-all focus:outline-none rounded-lg group",
          isOpen || isActiveGroup ? "text-[#2453E3]" : "text-slate-700 hover:bg-slate-50 hover:text-[#2453E3]"
        )}
      >
        <div className="flex items-center gap-2">
          {group.icon && <group.icon className={cn("h-4 w-4", isOpen || isActiveGroup ? "text-[#2453E3]" : "text-slate-400 group-hover:text-[#2453E3]")} />}
          <span>{group.title}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen ? "rotate-180 text-[#2453E3]" : "text-slate-400")} />
      </button>
      
      <div 
        className={cn(
          "space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
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
                "group flex items-center gap-3 rounded-lg px-3 py-2 ms-6 text-[13px] font-medium transition-all active:scale-95",
                isActive ? "bg-[#2453E3]/10 text-[#2453E3]" : "text-slate-500 hover:bg-slate-50 hover:text-[#2453E3]"
              )}
            >
              <item.icon className={cn("h-4 w-4 transition-colors rtl-flip", isActive ? "text-[#2453E3]" : "text-slate-400 group-hover:text-[#2453E3]")} />
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
`;

// Remove the old NavGroup function entirely.
const navGroupRegex = /function NavGroup\(\{.*?return \(\n\s*<div className="space-y-1 mb-2">.*?<\/div>\n\s*\)\n\}\n/s;
content = content.replace(navGroupRegex, newNavCode + '\n');

// Replace both <nav> blocks with SidebarNav
const navRegexDesktop = /<nav className="p-4 flex-1 overflow-y-auto custom-scrollbar">\s*\{navGroups\.map\(\(group\) => \(\s*<NavGroup key=\{group\.title\} group=\{group\} pathname=\{pathname\} isMobile=\{false\} \/>\s*\)\)\}\s*<\/nav>/g;
content = content.replace(navRegexDesktop, `<SidebarNav navGroups={navGroups} pathname={pathname} isMobile={false} />`);

const navRegexMobile = /<nav className="p-4 flex-1 overflow-y-auto custom-scrollbar">\s*\{navGroups\.map\(\(group\) => \(\s*<NavGroup key=\{group\.title\} group=\{group\} pathname=\{pathname\} isMobile=\{true\} setMobileMenuOpen=\{setIsMobileMenuOpen\} \/>\s*\)\)\}\s*<\/nav>/g;
content = content.replace(navRegexMobile, `<SidebarNav navGroups={navGroups} pathname={pathname} isMobile={true} setMobileMenuOpen={setIsMobileMenuOpen} />`);

fs.writeFileSync('src/app/admin/admin-layout-client.tsx', content, 'utf8');
console.log("Updated to SidebarNav.");
