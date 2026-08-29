const fs = require('fs');
let code = fs.readFileSync('src/components/admin/product-options-manager.tsx', 'utf8');

code = code.replace(
  /import \{ addProductOption, updateProductOption, deleteProductOption, addProductOptionValue, deleteProductOptionValue, generateVariants \} from "@\/features\/products\/options-actions"/,
  'import { addProductOption, updateProductOption, deleteProductOption, addProductOptionValue, deleteProductOptionValue, generateVariants, getProductOptions } from "@/features/products/options-actions"'
);

const fetchReplacement = `
  const fetchOptions = async () => {
    setLoading(true)
    try {
      const res = await getProductOptions(productId)
      if (res.success) {
        setOptions(res.options)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
`;

code = code.replace(
  /const fetchOptions = async \(\) => \{[\s\S]*?\}\n  \}/,
  fetchReplacement.trim()
);

fs.writeFileSync('src/components/admin/product-options-manager.tsx', code);
console.log("Updated ProductOptionsManager to use getProductOptions");
