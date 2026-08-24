const fs = require('fs');
let code = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

const correctSaveBtn = `              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-border/50 flex justify-end shrink-0">
            <button
              onClick={() => onSave(true, { headerSettings, footerSettings, widgets })}
              className="bg-[#2453E3] text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-sm w-full"
            >
              حفظ ونشر التغييرات
            </button>
          </div>

        </div>
        )}
    </div>
  )
}`;

code = code.replace(/              <\/div>\n            \)\}\n          <\/div>\n        <\/div>\n        \)\}\n    <\/div>\n  \)\n\}/, correctSaveBtn);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', code);
console.log("Added save button at the end");
