const fs = require('fs');
let code = fs.readFileSync('src/features/products/actions.ts', 'utf8');

const regex = /(const product = await db\.product\.create\(\{\s*data: \{[\s\S]*?\}\s*\}\))/;
const match = code.match(regex);

if (match) {
  const replacement = `
    const optionsDataStr = formData.get("optionsData") as string
    let optionsData: any = null
    if (optionsDataStr) {
      try { optionsData = JSON.parse(optionsDataStr) } catch(e) {}
    }

    ${match[1]}

    // Process Options & Variants
    if (optionsData) {
      if (optionsData.options && optionsData.options.length > 0) {
        for (const opt of optionsData.options) {
          const createdOpt = await db.productOption.create({
            data: {
              productId: product.id,
              name: opt.name,
              dataType: opt.dataType,
              displayType: opt.displayType,
              behavior: opt.behavior,
              isRequired: opt.isRequired,
              systemOptionId: opt.systemOptionId,
              sortOrder: opt.sortOrder,
              values: {
                create: opt.values.map((v: any, i: number) => ({
                  label: v.label,
                  value: v.value,
                  sortOrder: i
                }))
              }
            }
          });
          opt.id = createdOpt.id;
        }
      }

      if (optionsData.variants && optionsData.variants.length > 0) {
        const savedOptions = await db.productOption.findMany({ 
          where: { productId: product.id },
          include: { values: true }
        });

        for (const v of optionsData.variants) {
          const variant = await db.productVariant.create({
            data: {
              productId: product.id,
              price: v.price ?? product.price,
              compareAtPrice: v.compareAtPrice,
              stock: v.stock || 0,
              sku: v.sku || null,
              imageUrl: v.imageUrl || null,
            }
          });

          if (v.selections) {
             for (const sel of v.selections) {
               const dbOpt = savedOptions.find(o => o.name === sel.optionName);
               if (dbOpt) {
                 const dbVal = dbOpt.values.find(val => val.label === sel.valueLabel);
                 if (dbVal) {
                   await db.variantSelection.create({
                     data: { variantId: variant.id, optionValueId: dbVal.id }
                   });
                 }
               }
             }
          }
        }
      }
    }
`;
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/features/products/actions.ts', code);
  console.log("Updated actions.ts cleanly");
} else {
  console.log("Could not match createProduct block");
}
