const fs = require('fs');
let code = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

// Remove the wrongly placed save button from the sections modal
const wrongSaveBtn = `            
            <div className="mt-8 pt-4 border-t border-border/50 flex justify-end">
              <button
                onClick={() => onSave(true, { headerSettings, footerSettings, widgets })}
                className="bg-[#2453E3] text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-sm w-full"
              >
                حفظ ونشر التغييرات
              </button>
            </div>`;
code = code.replace(wrongSaveBtn, '');

// Now we need to append the save button at the end of the theme tab.
// The theme tab ends at the end of the file. Let's look for the end of the file.
// The end is:
//               )}
//             </div>
//           </div>
//           )}
//       </div>
//     )
//   }

const correctSaveBtn = `              )}
            </div>

            <div className="mt-8 pt-4 border-t border-border/50 flex justify-end">
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

code = code.replace(/              \)\}\n            <\/div>\n          <\/div>\n          \)\}\n      <\/div>\n    \)\n  \}/, correctSaveBtn);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', code);
console.log("Moved save button to correct location");
