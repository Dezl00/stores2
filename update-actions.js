const fs = require('fs');
let code = fs.readFileSync('src/features/products/actions.ts', 'utf8');

const createReplacement = `
    const optionsDataStr = formData.get("optionsData") as string
    let optionsData: any = null
    if (optionsDataStr) {
      try { optionsData = JSON.parse(optionsDataStr) } catch(e) {}
    }

    // 2. Create the Product and the ProductImages
    const product = await db.product.create({
      data: {
        name,
        slug,
        sku,
        price,
        discountPrice,
        stock,
        categoryId,
        departmentId,
        brandId,
        description,
        storeId,
        images: {
          create: images.map((url, index) => ({
            url,
            isPrimary: index === 0,
            sortOrder: index
          }))
        }
      }
    })

    // Process Options & Variants
    if (optionsData) {
      // Create options and values
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
          opt.id = createdOpt.id; // back-reference for variant generation if needed
        }
      }

      // Generate variants if we have combinations configured
      // Or we can let the UI pass pre-configured variants to create
      if (optionsData.variants && optionsData.variants.length > 0) {
        // Need to refetch options to get the real DB IDs for option values based on label/value mapping
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

          // Link selected option values
          if (v.selections) {
             for (const sel of v.selections) {
               // find real optionValueId
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

// Replace createProduct
code = code.replace(
  /\/\/ 2\. Create the Product and the ProductImages\s*const product = await db\.product\.create\(\{[\s\S]*?\}\)/,
  createReplacement.trim()
);

// We need to also do updateProduct, but it's more complex (updating/deleting options).
// Let's rely on the dedicated server actions (options-actions.ts) for updates!
// So updateProduct doesn't HAVE to handle nested options updates, we can just save the basic product.
// Wait, if it's simpler, I'll just leave updateProduct alone for now and let the UI call options-actions directly when editing.
// BUT for creation, it's nice to send it all at once so we don't have dangling products without options.

fs.writeFileSync('src/features/products/actions.ts', code);
console.log("Updated actions.ts for creating product with options.");
