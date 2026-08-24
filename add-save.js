const fs = require('fs');
let code = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

const regexToFindThemeTabEnd = /<\/div>\n\s*\}\)\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/;

// Wait, the end is:
//               )}
//             </div>
//           </div>
//           )}
//       </div>
//     )
//   }

code = code.replace(
  /(\s+)<\/div>\n\s*\}\)\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/, 
  // Wait, I can just replace the end
  ''
);

// I will just use string replace.
const endStr = `              )}
            </div>
          </div>
          )}
      </div>
    )
  }`;

const newEndStr = `              )}
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

code = code.replace(endStr, newEndStr);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', code);
console.log("Added save button");
