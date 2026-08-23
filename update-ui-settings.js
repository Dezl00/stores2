const fs = require('fs');
let content = fs.readFileSync('src/app/admin/storefront/theme/widgets-client.tsx', 'utf8');

// 1. In saveWidgetSettings
const saveSettingsAdditions = `
    if (editingWidget.type === "PromoBanner") {
      data.settings = {
        timerEndDate: formData.get("timerEndDate") as string,
        backgroundColor: formData.get("backgroundColor") as string || "#2453E3",
        overlayOpacity: parseInt(formData.get("overlayOpacity") as string || "50"),
        backgroundImage: formData.get("backgroundImage") as string
      }
    }
    if (editingWidget.type === "MarqueeAlerts") {
      data.settings = {
        scrollDirection: formData.get("scrollDirection") as string || "right",
        backgroundColor: formData.get("backgroundColor") as string || "#000000",
        textColor: formData.get("textColor") as string || "#ffffff"
      }
    }
`;

content = content.replace(
  /if \(editingWidget\.type === "AboutUs"\) \{/g,
  saveSettingsAdditions + '    if (editingWidget.type === "AboutUs") {'
);

// 2. In JSX rendering block
const jsxAdditions = `
                    {editingWidget.type === "PromoBanner" && (
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold">صورة الخلفية (اختياري)</label>
                          <input type="hidden" name="backgroundImage" value={aboutUsImage} />
                          <ImageUploader 
                            value={aboutUsImage} 
                            onChange={setAboutUsImage} 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold">لون الخلفية</label>
                            <input type="color" name="backgroundColor" defaultValue={editingWidget.settings?.backgroundColor || "#2453E3"} className="w-full h-9 rounded cursor-pointer border border-input" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold">تعتيم الصورة (0-100)</label>
                            <input type="range" name="overlayOpacity" min="0" max="100" defaultValue={editingWidget.settings?.overlayOpacity ?? 50} className="w-full h-9" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold">تاريخ ووقت انتهاء العرض (اختياري)</label>
                          <input type="datetime-local" name="timerEndDate" defaultValue={editingWidget.settings?.timerEndDate || ""} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" />
                        </div>
                      </div>
                    )}

                    {editingWidget.type === "MarqueeAlerts" && (
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold">لون الخلفية</label>
                            <input type="color" name="backgroundColor" defaultValue={editingWidget.settings?.backgroundColor || "#000000"} className="w-full h-9 rounded cursor-pointer border border-input" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold">لون النص</label>
                            <input type="color" name="textColor" defaultValue={editingWidget.settings?.textColor || "#ffffff"} className="w-full h-9 rounded cursor-pointer border border-input" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold">اتجاه الحركة</label>
                          <select name="scrollDirection" defaultValue={editingWidget.settings?.scrollDirection || "right"} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="right">من اليسار لليمين</option>
                            <option value="left">من اليمين لليسار</option>
                          </select>
                        </div>
                      </div>
                    )}
`;

content = content.replace(
  /\{editingWidget\.type === "AboutUs" && \(/g,
  jsxAdditions + '{editingWidget.type === "AboutUs" && ('
);

fs.writeFileSync('src/app/admin/storefront/theme/widgets-client.tsx', content, 'utf8');
console.log("Updated widget settings UI.");
