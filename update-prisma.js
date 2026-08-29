const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Add enums
const enumsToAdd = `
enum OptionBehavior {
  VARIANT_OPTION
  PRODUCT_ATTRIBUTE
}

enum OptionDataType {
  TEXT
  NUMBER
  COLOR
  SELECT
  MULTI_SELECT
  BOOLEAN
}

enum OptionDisplayType {
  INPUT
  DROPDOWN
  BUTTONS
  SWATCHES
  CHECKBOX
  IMAGE_SWATCHES
}
`;
if (!code.includes('enum OptionBehavior')) {
  code = code.replace(/\/\/ ============================================================\n\/\/ PLATFORM-LEVEL MODELS \(no storeId\)/, enumsToAdd + '\n// ============================================================\n// PLATFORM-LEVEL MODELS (no storeId)');
}

// 2. Modify Product
code = code.replace(
  /model Product \{\n([^}]+)\}/,
  (match, p1) => {
    if (p1.includes('options')) return match; // already added
    return `model Product {\n${p1}  options            ProductOption[]\n  variants           ProductVariant[]\n}`;
  }
);

// 3. Modify CartItem
code = code.replace(
  /model CartItem \{\n([^}]+)\}/,
  (match, p1) => {
    if (p1.includes('variantId')) return match;
    return `model CartItem {\n${p1}  variantId       String?\n  variant         ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)\n  selectedOptions Json?           // Store snapshot of selected options\n`;
  }
);

// 4. Modify OrderItem
code = code.replace(
  /model OrderItem \{\n([^}]+)\}/,
  (match, p1) => {
    if (p1.includes('variantId')) return match;
    return `model OrderItem {\n${p1}  variantId       String?\n  variant         ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)\n  selectedOptions Json?           // Store snapshot of selected options\n`;
  }
);

// 5. Add new models
const newModels = `
// ---------- Product Options & Variants ----------

model ProductOption {
  id              String  @id @default(cuid())
  productId       String
  product         Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  name            String
  dataType        OptionDataType
  displayType     OptionDisplayType
  behavior        OptionBehavior
  isRequired      Boolean @default(false)
  systemOptionId  String? // Identifies built-in options (e.g., 'color', 'size')
  sortOrder       Int     @default(0)
  
  values          ProductOptionValue[]

  @@index([productId])
}

model ProductOptionValue {
  id              String  @id @default(cuid())
  optionId        String
  option          ProductOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  
  label           String  // e.g., "Red", "Cotton"
  value           String  // e.g., "#FF0000", "cotton"
  sortOrder       Int     @default(0)

  // Join table for Variant associations
  variantSelections VariantSelection[]

  @@index([optionId])
}

model ProductVariant {
  id              String  @id @default(cuid())
  productId       String
  product         Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  price           Float?
  compareAtPrice  Float?
  cost            Float?
  stock           Int     @default(0)
  sku             String?
  barcode         String?
  weight          Float?
  imageUrl        String?
  isActive        Boolean @default(true)
  
  selections      VariantSelection[]
  
  cartItems       CartItem[]
  orderItems      OrderItem[]

  @@index([productId])
}

// Join Table mapping a Variant to its chosen Option Values
model VariantSelection {
  variantId       String
  variant         ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  optionValueId   String
  optionValue     ProductOptionValue @relation(fields: [optionValueId], references: [id], onDelete: Cascade)

  @@id([variantId, optionValueId])
  @@index([variantId])
  @@index([optionValueId])
}
`;
if (!code.includes('model ProductOption')) {
  code += '\n' + newModels;
}

fs.writeFileSync('prisma/schema.prisma', code);
console.log("Updated Prisma schema successfully.");
