const fs = require('fs');
let code = fs.readFileSync('src/app/admin/catalog/products/products-client.tsx', 'utf8');

// 1. Import ProductOptionsManager
if (!code.includes('ProductOptionsManager')) {
  code = code.replace(
    /import \{ MultiImageUploader \} from "@\/components\/ui\/multi-image-uploader"/,
    'import { MultiImageUploader } from "@/components/ui/multi-image-uploader"\nimport { ProductOptionsManager } from "@/components/admin/product-options-manager"'
  );
}

// 2. Add State for Options Modal
if (!code.includes('isOptionsModalOpen')) {
  code = code.replace(
    /const \[isFormVisible, setIsFormVisible\] = useState\(false\)/,
    'const [isFormVisible, setIsFormVisible] = useState(false)\n    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)'
  );
}

// 3. Add Button in Form Header to Open Options Modal
const btnHtml = `
                {editingProduct && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="ml-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOptionsModalOpen(true);
                    }}
                  >
                    إدارة الخيارات والمتغيرات
                  </Button>
                )}
`;
if (!code.includes('إدارة الخيارات والمتغيرات')) {
  // Find the reset button and prepend
  code = code.replace(
    /\{editingProduct && \(\s*<Button variant="ghost" size="icon" onClick=\{[^}]+\} className="h-8 w-8 shrink-0 text-muted-foreground">\s*<X className="w-4 h-4" \/>\s*<\/Button>\s*\)\}/,
    (match) => btnHtml + match
  );
}

// 4. Mount the ProductOptionsManager at the bottom of the component
const modalHtml = `
      {editingProduct && (
        <ProductOptionsManager 
          productId={editingProduct.id} 
          open={isOptionsModalOpen} 
          onOpenChange={setIsOptionsModalOpen} 
        />
      )}
`;
if (!code.includes('<ProductOptionsManager')) {
  code = code.replace(
    /<\/div>\n    <\/div>\n  \)\n\}\n$/,
    (match) => modalHtml + match
  );
}

fs.writeFileSync('src/app/admin/catalog/products/products-client.tsx', code);
console.log("Updated products-client.tsx");
