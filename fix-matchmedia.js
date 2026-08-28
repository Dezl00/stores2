const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/promo-bento-grid.tsx', 'utf8');

const oldUseEffect = `  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    
    setMounted(true);
    return () => mql.removeEventListener('change', handler);
  }, []);`;

const newUseEffect = `  useEffect(() => {
    let mql: MediaQueryList | null = null;
    try {
      mql = window.matchMedia('(max-width: 767px)');
      setIsMobile(mql.matches);
      
      const handler = (e: MediaQueryListEvent | MediaQueryListEvent | Event) => {
        setIsMobile((e as MediaQueryListEvent).matches);
      };
      
      if (mql.addEventListener) {
        mql.addEventListener('change', handler);
      } else if (mql.addListener) {
        // Fallback for older Safari
        mql.addListener(handler as any);
      }
      
      setMounted(true);
      
      return () => {
        if (mql) {
          if (mql.removeEventListener) {
            mql.removeEventListener('change', handler);
          } else if (mql.removeListener) {
            mql.removeListener(handler as any);
          }
        }
      };
    } catch (e) {
      console.error(e);
      setMounted(true);
    }
  }, []);`;

code = code.replace(oldUseEffect, newUseEffect);

fs.writeFileSync('src/components/storefront/widgets/promo-bento-grid.tsx', code);
console.log("Fixed matchMedia in PromoBentoGrid");
