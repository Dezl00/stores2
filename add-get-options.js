const fs = require('fs');
let code = fs.readFileSync('src/features/products/options-actions.ts', 'utf8');

const getOptionsFunc = `
export async function getProductOptions(productId: string) {
  try {
    const storeId = await resolveStoreId()
    const options = await db.productOption.findMany({
      where: { productId, product: { storeId } },
      include: { values: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' }
    })
    
    const variants = await db.productVariant.findMany({
      where: { productId, product: { storeId } },
      include: { selections: true }
    })
    
    return { success: true, options, variants }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
`;

if (!code.includes('getProductOptions')) {
  code += '\n' + getOptionsFunc;
  fs.writeFileSync('src/features/products/options-actions.ts', code);
  console.log("Added getProductOptions");
}
