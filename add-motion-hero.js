const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/hero-slider.tsx', 'utf8');

// Add import
if (!code.includes('import { motion } from "framer-motion"')) {
  code = code.replace(
    'import Image from "next/image"',
    'import Image from "next/image"\nimport { motion } from "framer-motion"'
  );
}

// Replace title
code = code.replace(
  /<h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-5 leading-tight">([\s\S]*?)<\/h2>/,
  `<motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-5 leading-tight"
                      >$1</motion.h2>`
);

// Replace subtitle
code = code.replace(
  /<p className="text-base md:text-xl lg:text-2xl text-white\/90 mb-6 md:mb-8 leading-relaxed max-w-2xl inline-block">([\s\S]*?)<\/p>/,
  `<motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-base md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 leading-relaxed max-w-2xl inline-block"
                      >$1</motion.p>`
);

// Replace button wrapper
code = code.replace(
  /<div>\s*<Link prefetch=\{false\} href=\{getValidLink\(computeHref\(slide\)\)\}>\s*<Button size="lg" variant="outline" className="px-8 md:px-10 py-5 md:py-6 text-base md:text-lg font-bold bg-transparent text-white border-2 border-white hover:bg-white hover:text-black rounded-full shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group">\s*\{slide\.buttonText \|\| ".*?"\}\s*<ChevronLeft className="w-5 h-5 -translate-x-1 group-hover:-translate-x-2 transition-transform" \/>\s*<\/Button>\s*<\/Link>\s*<\/div>/,
  `<motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link prefetch={false} href={getValidLink(computeHref(slide))}>
                          <Button size="lg" variant="outline" className="px-8 md:px-10 py-5 md:py-6 text-base md:text-lg font-bold bg-transparent text-white border-2 border-white hover:bg-white hover:text-black rounded-full shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group">
                            {slide.buttonText || "تسوق الآن"}
                            <ChevronLeft className="w-5 h-5 -translate-x-1 group-hover:-translate-x-2 transition-transform" />
                          </Button>
                        </Link>
                      </motion.div>`
);

fs.writeFileSync('src/components/storefront/widgets/hero-slider.tsx', code);
console.log("Framer motion animations added to HeroSlider text");
