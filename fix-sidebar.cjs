const fs = require('fs');

const file = 'src/app/admin/admin-layout-client.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('LayoutDashboard,', 'LayoutDashboard, ChevronDown,');

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
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors focus:outline-none"
      >
        <span>{group.title}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen ? "rotate-180" : "rotate-0")} />
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
}`;

content = content.replace('function AdminLayoutInner', `${navGroupCode}\n\nfunction AdminLayoutInner`);

const oldNav = `<nav className="p-4 space-y-6 flex-1 overflow-y-auto">
          {navGroups.map((group) => {
            const groupItems = group.items.filter(i => i.show)
            if (groupItems.length === 0) return null
            return (
              <div key={group.title} className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {groupItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link prefetch={false}
                        key={item.name}
                        href={item.href}
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
          })}
        </nav>`;

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

// Replace first occurrence (desktop)
content = content.replace(oldNav, newDesktopNav);
// Replace second occurrence (mobile)
content = content.replace(oldNav, newMobileNav);

fs.writeFileSync(file, content, 'utf8');
