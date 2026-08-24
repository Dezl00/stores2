const fs = require('fs');

let code = fs.readFileSync('src/components/storefront/product-card.tsx', 'utf8');

// 1. Add themeConfig from UI Store
code = code.replace(
  /const \{ storeLogo \} = useUIStore\(\)/,
  'const { storeLogo, themeConfig } = useUIStore()'
);

// 2. Add description to ProductCardProps
code = code.replace(
  /category\?: \{ name: string; slug: string \}/,
  'category?: { name: string; slug: string }\n    description?: string'
);

// 3. Setup settings variables
code = code.replace(
  /const finalPrice = product\.discountPrice \?\? product\.price/,
  `const cardSettings = themeConfig?.headerSettings?.productCard || {}
  const showCategory = cardSettings.showCategory !== false
  const showDescription = cardSettings.showDescription === true
  const priceColor = cardSettings.priceColor || "var(--color-primary)"
  const showAddToCart = cardSettings.showAddToCart !== false
  const addToCartText = cardSettings.addToCartText || "أضف للسلة"
  const addToCartStyle = cardSettings.addToCartStyle || "solid"
  const addToCartColor = cardSettings.addToCartColor || "var(--color-primary)"
  
  const aspectClass = cardSettings.aspectRatio === "portrait" ? "aspect-[3/4]" : cardSettings.aspectRatio === "landscape" ? "aspect-[4/3]" : "aspect-square"
  
  const finalPrice = product.discountPrice ?? product.price`
);

// 4. Update aspect ratio
code = code.replace(
  /aspect-square/,
  '${aspectClass}'
);
code = code.replace(
  /className="block relative aspect-square/,
  'className={`block relative ${aspectClass}'
);
code = code.replace(
  /overflow-hidden rounded-xl mb-4 bg-transparent shrink-0"/,
  'overflow-hidden rounded-xl mb-4 bg-transparent shrink-0`}'
);

// 5. Update category
code = code.replace(
  /\{product\.category && \(\s*<p className="text-xs text-muted-foreground">\{product\.category\.name\}<\/p>\s*\)\}/,
  '{showCategory && product.category && (\n            <p className="text-xs text-muted-foreground">{product.category.name}</p>\n          )}'
);

// 6. Update title and add description
code = code.replace(
  /<Link prefetch=\{false\} href=\{\`\/product\/\$\{product\.slug\}\`\} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base leading-snug">\s*\{product\.name\}\s*<\/Link>/,
  `<Link prefetch={false} href={\`/product/\${product.slug}\`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base leading-snug">
            {product.name}
          </Link>
          {showDescription && product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">{product.description}</p>
          )}`
);

// 7. Update price color
code = code.replace(
  /<span className="font-bold text-lg text-primary">\{finalPrice\.toFixed\(2\)\} /,
  '<span className="font-bold text-lg" style={{ color: priceColor }}>{finalPrice.toFixed(2)} '
);

// 8. Remove old overlay
code = code.replace(
  /\{\/\* Quick Add Overlay \*\/\}[\s\S]*?<\/div>\s*\)\}/,
  ''
);

// 9. Add new full width button at the bottom
code = code.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*\)\s*\}\s*$/,
  `</div>
        
        {showAddToCart && !isOutOfStock && (
          <div className="mt-4">
            <button 
              onClick={handleQuickAdd}
              disabled={isAdding}
              style={{
                backgroundColor: addToCartStyle === 'solid' ? addToCartColor : 'transparent',
                color: addToCartStyle === 'solid' ? '#fff' : addToCartColor,
                borderColor: addToCartColor,
              }}
              className={\`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] \${addToCartStyle === 'outline' ? 'border-2' : ''}\`}
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
              <span>{isAdding ? "جاري الإضافة..." : addToCartText}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}`
);

fs.writeFileSync('src/components/storefront/product-card.tsx', code);
console.log("Updated product-card.tsx");
