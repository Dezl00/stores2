import { OptionDataType, OptionDisplayType, OptionBehavior } from "@prisma/client";

export interface SystemOptionDefinition {
  id: string; // The systemOptionId used in the database
  name: string;
  nameAr?: string;
  dataType: OptionDataType;
  defaultDisplayType: OptionDisplayType;
  allowedDisplayTypes: OptionDisplayType[];
  defaultBehavior: OptionBehavior;
}

export const SYSTEM_OPTIONS: SystemOptionDefinition[] = [
  {
    id: "color",
    name: "Color",
    nameAr: "اللون",
    dataType: OptionDataType.COLOR,
    defaultDisplayType: OptionDisplayType.SWATCHES,
    allowedDisplayTypes: [OptionDisplayType.SWATCHES, OptionDisplayType.DROPDOWN],
    defaultBehavior: OptionBehavior.VARIANT_OPTION,
  },
  {
    id: "size",
    name: "Size",
    nameAr: "المقاس",
    dataType: OptionDataType.SELECT,
    defaultDisplayType: OptionDisplayType.BUTTONS,
    allowedDisplayTypes: [OptionDisplayType.BUTTONS, OptionDisplayType.DROPDOWN],
    defaultBehavior: OptionBehavior.VARIANT_OPTION,
  },
  {
    id: "material",
    name: "Material",
    nameAr: "الخامة",
    dataType: OptionDataType.SELECT,
    defaultDisplayType: OptionDisplayType.DROPDOWN,
    allowedDisplayTypes: [OptionDisplayType.DROPDOWN, OptionDisplayType.BUTTONS],
    defaultBehavior: OptionBehavior.PRODUCT_ATTRIBUTE,
  },
  {
    id: "weight",
    name: "Weight",
    nameAr: "الوزن",
    dataType: OptionDataType.NUMBER,
    defaultDisplayType: OptionDisplayType.INPUT,
    allowedDisplayTypes: [OptionDisplayType.INPUT, OptionDisplayType.DROPDOWN, OptionDisplayType.BUTTONS],
    defaultBehavior: OptionBehavior.PRODUCT_ATTRIBUTE,
  },
  {
    id: "volume",
    name: "Volume",
    nameAr: "الحجم",
    dataType: OptionDataType.SELECT,
    defaultDisplayType: OptionDisplayType.BUTTONS,
    allowedDisplayTypes: [OptionDisplayType.BUTTONS, OptionDisplayType.DROPDOWN],
    defaultBehavior: OptionBehavior.VARIANT_OPTION,
  },
  {
    id: "capacity",
    name: "Capacity",
    nameAr: "السعة",
    dataType: OptionDataType.SELECT,
    defaultDisplayType: OptionDisplayType.BUTTONS,
    allowedDisplayTypes: [OptionDisplayType.BUTTONS, OptionDisplayType.DROPDOWN],
    defaultBehavior: OptionBehavior.VARIANT_OPTION,
  },
  {
    id: "flavor",
    name: "Flavor",
    nameAr: "النكهة",
    dataType: OptionDataType.SELECT,
    defaultDisplayType: OptionDisplayType.BUTTONS,
    allowedDisplayTypes: [OptionDisplayType.BUTTONS, OptionDisplayType.DROPDOWN],
    defaultBehavior: OptionBehavior.VARIANT_OPTION,
  },
  {
    id: "scent",
    name: "Scent",
    nameAr: "الرائحة",
    dataType: OptionDataType.SELECT,
    defaultDisplayType: OptionDisplayType.BUTTONS,
    allowedDisplayTypes: [OptionDisplayType.BUTTONS, OptionDisplayType.DROPDOWN],
    defaultBehavior: OptionBehavior.VARIANT_OPTION,
  },
  {
    id: "style",
    name: "Style",
    nameAr: "النمط / الموديل",
    dataType: OptionDataType.SELECT,
    defaultDisplayType: OptionDisplayType.BUTTONS,
    allowedDisplayTypes: [OptionDisplayType.BUTTONS, OptionDisplayType.DROPDOWN],
    defaultBehavior: OptionBehavior.VARIANT_OPTION,
  },
  {
    id: "shape",
    name: "Shape",
    nameAr: "الشكل",
    dataType: OptionDataType.SELECT,
    defaultDisplayType: OptionDisplayType.BUTTONS,
    allowedDisplayTypes: [OptionDisplayType.BUTTONS, OptionDisplayType.DROPDOWN],
    defaultBehavior: OptionBehavior.VARIANT_OPTION,
  }
];

export function getSystemOption(id: string): SystemOptionDefinition | undefined {
  return SYSTEM_OPTIONS.find(opt => opt.id === id);
}

// Maps data types to their compatible display types (for Custom Options validation)
export const COMPATIBLE_DISPLAY_TYPES: Record<OptionDataType, OptionDisplayType[]> = {
  [OptionDataType.TEXT]: [OptionDisplayType.INPUT],
  [OptionDataType.NUMBER]: [OptionDisplayType.INPUT, OptionDisplayType.DROPDOWN, OptionDisplayType.BUTTONS],
  [OptionDataType.COLOR]: [OptionDisplayType.SWATCHES, OptionDisplayType.DROPDOWN],
  [OptionDataType.SELECT]: [OptionDisplayType.DROPDOWN, OptionDisplayType.BUTTONS],
  [OptionDataType.MULTI_SELECT]: [OptionDisplayType.CHECKBOX],
  [OptionDataType.BOOLEAN]: [OptionDisplayType.CHECKBOX, OptionDisplayType.BUTTONS] // Buttons like Yes/No
};
