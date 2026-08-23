const fs = require('fs');
let content = fs.readFileSync('src/app/admin/storefront/theme/widgets-client.tsx', 'utf8');

// 1. WIDGET_TYPES
content = content.replace(
  /\{ id: "FeaturedProducts", name: "منتجات مختارة",.*?\},\s*/,
  ""
);

content = content.replace(
  /\{ id: "HeroSlider", name: "شريط صور", icon: ImageIcon, desc: "شريط صور متحرك أعلى الصفحة" \},/,
  `{ id: "HeroSlider", name: "شريط صور", icon: ImageIcon, desc: "شريط صور متحرك أعلى الصفحة" },
  { id: "PromoBanner", name: "شريط إعلاني (مؤقت)", icon: LayoutTemplate, desc: "شريط إعلاني مع عداد تنازلي وخلفية" },
  { id: "MarqueeAlerts", name: "شريط تنبيهات متحرك", icon: AlignLeft, desc: "شريط نصوص متحركة للإعلانات" },
  { id: "PromoBentoGrid", name: "صور إعلانية (Bento)", icon: ImagePlus, desc: "شبكة صور إعلانية بأحجام متنوعة" },`
);


// 2. saveWidgetSettings handling
const saveSettingsReplacement = `      if (editingWidget.type === "AboutUs") {
        data.settings = {
          content: formData.get("content") as string,
          visionTitle: formData.get("visionTitle") as string,
          visionContent: formData.get("visionContent") as string,
          missionTitle: formData.get("missionTitle") as string,
          missionContent: formData.get("missionContent") as string,
          image: aboutUsImage
        }
      } else if (editingWidget.type === "PromoBanner") {
        data.settings = {
          timerEndDate: formData.get("timerEndDate") as string,
          backgroundColor: formData.get("backgroundColor") as string || "#2453E3",
          overlayOpacity: parseInt(formData.get("overlayOpacity") as string || "50"),
          image: aboutUsImage // reusing aboutUsImage state for banner image
        }
      } else if (editingWidget.type === "MarqueeAlerts") {
        data.settings = {
          scrollDirection: formData.get("scrollDirection") as string || "right",
          backgroundColor: formData.get("backgroundColor") as string || "#000000",
          textColor: formData.get("textColor") as string || "#ffffff"
        }
      } else if (editingWidget.type === "CategoryGrid") {`;

content = content.replace(
  /if \(editingWidget\.type === "AboutUs"\) \{\s*data\.settings = \{\s*content: formData\.get\("content"\) as string,\s*visionTitle: formData\.get\("visionTitle"\) as string,\s*visionContent: formData\.get\("visionContent"\) as string,\s*missionTitle: formData\.get\("missionTitle"\) as string,\s*missionContent: formData\.get\("missionContent"\) as string,\s*image: aboutUsImage\s*\}\s*\} else if \(editingWidget\.type === "CategoryGrid"\) \{/,
  saveSettingsReplacement
);


// 3. UI logic in settings tab (adding PromoBanner & MarqueeAlerts settings form fields)
// First, I need to find where AboutUs fields are rendered and add my forms nearby.
const formFieldsReplacement = `{editingWidget.type === "AboutUs" && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold">صورة من نحن</label>
                                <ImageUploader
                                  value={aboutUsImage}
                                  onChange={setAboutUsImage}
                                  bucket="widgets"
                                  className="h-32"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold">محتوى عن المتجر</label>
                                <textarea
                                  name="content"
                                  defaultValue={editingWidget.settings?.content || ""}
                                  className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[100px]"
                                />
                              </div>
                            </div>
                          )}

                          {editingWidget.type === "PromoBanner" && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold">صورة الخلفية (اختياري)</label>
                                <ImageUploader
                                  value={aboutUsImage}
                                  onChange={setAboutUsImage}
                                  bucket="widgets"
                                  className="h-32"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-xs font-semibold">لون الخلفية</label>
                                  <input type="color" name="backgroundColor" defaultValue={editingWidget.settings?.backgroundColor || "#2453E3"} className="w-full h-9 rounded cursor-pointer" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-semibold">تعتيم الصورة (0-100)</label>
                                  <input type="range" name="overlayOpacity" min="0" max="100" defaultValue={editingWidget.settings?.overlayOpacity ?? 50} className="w-full h-9" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold">تاريخ ووقت انتهاء العرض (اختياري)</label>
                                <input type="datetime-local" name="timerEndDate" defaultValue={editingWidget.settings?.timerEndDate || ""} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" />
                              </div>
                            </div>
                          )}

                          {editingWidget.type === "MarqueeAlerts" && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-xs font-semibold">لون الخلفية</label>
                                  <input type="color" name="backgroundColor" defaultValue={editingWidget.settings?.backgroundColor || "#000000"} className="w-full h-9 rounded cursor-pointer" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-semibold">لون النص</label>
                                  <input type="color" name="textColor" defaultValue={editingWidget.settings?.textColor || "#ffffff"} className="w-full h-9 rounded cursor-pointer" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold">اتجاه الحركة</label>
                                <select name="scrollDirection" defaultValue={editingWidget.settings?.scrollDirection || "right"} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                                  <option value="right">من اليسار لليمين</option>
                                  <option value="left">من اليمين لليسار</option>
                                </select>
                              </div>
                            </div>
                          )}`;

// Find AboutUs rendering block to replace
const aboutUsRegex = /\{editingWidget\.type === "AboutUs" && \(\s*<div className="space-y-4">\s*<div className="space-y-2">\s*<label className="text-xs font-semibold">صورة من نحن<\/label>\s*<ImageUploader\s*value=\{aboutUsImage\}\s*onChange=\{setAboutUsImage\}\s*bucket="widgets"\s*className="h-32"\s*\/>\s*<\/div>\s*<div className="space-y-2">\s*<label className="text-xs font-semibold">محتوى عن المتجر<\/label>\s*<textarea\s*name="content"\s*defaultValue=\{editingWidget\.settings\?\.content \|\| ""\}\s*className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-\[100px\]"\s*\/>\s*<\/div>[\s\S]*?<\/div>\s*\)\}/;

content = content.replace(aboutUsRegex, formFieldsReplacement);


// 4. PromoBentoGrid requires some modifications to the item form (like overlay opacity per item).
// We'll add overlayOpacity for items if the widget is PromoBentoGrid, HeroSlider, or BannerGrid.
// This is already done for HeroSlider (overlayOpacity is already there). We just need to make sure PromoBentoGrid is included.
const overlayItemReplacement = `(editingWidget.type === "HeroSlider" || editingWidget.type === "BannerGrid" || editingWidget.type === "PromoBentoGrid") && (`;
content = content.replace(/\(editingWidget\.type === "HeroSlider" \|\| editingWidget\.type === "BannerGrid"\) && \(/g, overlayItemReplacement);

fs.writeFileSync('src/app/admin/storefront/theme/widgets-client.tsx', content, 'utf8');
console.log("Updated widgets-client.tsx successfully.");
