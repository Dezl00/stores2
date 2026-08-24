import {
  IBM_Plex_Sans_Arabic,
  Cairo,
  Tajawal,
  Almarai,
  Changa,
  El_Messiri,
  Readex_Pro,
  Alexandria,
  Noto_Kufi_Arabic,
  Noto_Naskh_Arabic,
  Amiri
} from "next/font/google";

export const fontIbm = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-agnadeen" });
export const fontCairo = Cairo({ subsets: ["arabic"], display: "swap", variable: "--font-agnadeen" });
export const fontTajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700"], display: "swap", variable: "--font-agnadeen" });
export const fontAlmarai = Almarai({ subsets: ["arabic"], weight: ["400", "700", "800"], display: "swap", variable: "--font-agnadeen" });
export const fontChanga = Changa({ subsets: ["arabic"], display: "swap", variable: "--font-agnadeen" });
export const fontElMessiri = El_Messiri({ subsets: ["arabic"], display: "swap", variable: "--font-agnadeen" });
export const fontReadex = Readex_Pro({ subsets: ["arabic"], display: "swap", variable: "--font-agnadeen" });
export const fontAlexandria = Alexandria({ subsets: ["arabic"], display: "swap", variable: "--font-agnadeen" });
export const fontNotoKufi = Noto_Kufi_Arabic({ subsets: ["arabic"], display: "swap", variable: "--font-agnadeen" });
export const fontNotoNaskh = Noto_Naskh_Arabic({ subsets: ["arabic"], display: "swap", variable: "--font-agnadeen" });
export const fontAmiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], display: "swap", variable: "--font-agnadeen" });

export const FONT_MAP: Record<string, any> = {
  "ibm": fontIbm,
  "cairo": fontCairo,
  "tajawal": fontTajawal,
  "almarai": fontAlmarai,
  "changa": fontChanga,
  "messiri": fontElMessiri,
  "readex": fontReadex,
  "alexandria": fontAlexandria,
  "noto-kufi": fontNotoKufi,
  "noto-naskh": fontNotoNaskh,
  "amiri": fontAmiri
};

export const FONT_OPTIONS = [
  { id: "ibm", name: "آي بي إم (IBM Plex)" },
  { id: "cairo", name: "كايرو (Cairo)" },
  { id: "tajawal", name: "تجوال (Tajawal)" },
  { id: "almarai", name: "المراعي (Almarai)" },
  { id: "changa", name: "تشانجا (Changa)" },
  { id: "messiri", name: "المسيري (El Messiri)" },
  { id: "readex", name: "ريدكس (Readex Pro)" },
  { id: "alexandria", name: "الإسكندرية (Alexandria)" },
  { id: "noto-kufi", name: "نوتو كوفي (Noto Kufi)" },
  { id: "noto-naskh", name: "نوتو نسخ (Noto Naskh)" },
  { id: "amiri", name: "أميري (Amiri)" }
];
