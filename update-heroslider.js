const fs = require('fs');

let hero = fs.readFileSync('src/components/storefront/widgets/hero-slider.tsx', 'utf8');

const injectClasses = `
  const textAlign = widget.settings?.textAlign || 'center';
  const textPosition = widget.settings?.textPosition || 'center';

  const getFlexAlign = (pos: string) => {
    if (pos === 'top') return 'justify-start mt-12 md:mt-24';
    if (pos === 'center') return 'justify-center';
    return 'justify-end mb-12 md:mb-24';
  }
  const getTextJustify = (align: string) => {
    if (align === 'right') return 'items-end text-right';
    if (align === 'left') return 'items-start text-left';
    return 'items-center text-center';
  }
`;

if (!hero.includes('getFlexAlign')) {
  hero = hero.replace('export function HeroSlider({ widget }: { widget: any }) {', 'export function HeroSlider({ widget }: { widget: any }) {\n' + injectClasses);
  
  hero = hero.replace(/<div className="relative z-20 flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-4 text-center">/, 
  '<div className={`relative z-20 flex flex-col h-full max-w-5xl mx-auto px-4 sm:px-8 ${getFlexAlign(textPosition)} ${getTextJustify(textAlign)}`}>');
  
  fs.writeFileSync('src/components/storefront/widgets/hero-slider.tsx', hero, 'utf8');
}
console.log("Updated HeroSlider for text alignment.");
