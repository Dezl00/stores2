const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/hero-slider.tsx', 'utf8');

// Title
code = code.replace(
  /initial=\{\{ opacity: 0, y: 30 \}\}\s*animate=\{currentSlide === index \? \{\ opacity: 1, y: 0 \} : \{\ opacity: 0, y: 30 \}\}\s*transition=\{\{ duration: 0.7, delay: 0.1, ease: \[0.16, 1, 0.3, 1\] \}\}/,
  `initial={{ opacity: 0, y: 50 }}\n                          animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}\n                          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}`
);

// Subtitle
code = code.replace(
  /initial=\{\{ opacity: 0, y: 30 \}\}\s*animate=\{currentSlide === index \? \{\ opacity: 1, y: 0 \} : \{\ opacity: 0, y: 30 \}\}\s*transition=\{\{ duration: 0.7, delay: 0.2, ease: \[0.16, 1, 0.3, 1\] \}\}/,
  `initial={{ opacity: 0, y: 50 }}\n                          animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}\n                          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}`
);

// Button
code = code.replace(
  /initial=\{\{ opacity: 0, y: 30 \}\}\s*animate=\{currentSlide === index \? \{\ opacity: 1, y: 0 \} : \{\ opacity: 0, y: 30 \}\}\s*transition=\{\{ duration: 0.7, delay: 0.3, ease: \[0.16, 1, 0.3, 1\] \}\}/,
  `initial={{ opacity: 0, y: 50 }}\n                          animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}\n                          transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}`
);

fs.writeFileSync('src/components/storefront/widgets/hero-slider.tsx', code);
console.log("Updated HeroSlider animations");
