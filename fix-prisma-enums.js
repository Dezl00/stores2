const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

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
  // Find the end of existing enums to inject this.
  code = code.replace('enum StoreRole {', enumsToAdd + '\nenum StoreRole {');
  fs.writeFileSync('prisma/schema.prisma', code);
  console.log("Added enums successfully.");
} else {
  console.log("Enums already exist.");
}
