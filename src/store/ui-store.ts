import { create } from "zustand"

interface UIState {
  isAuthModalOpen: boolean
  setAuthModalOpen: (isOpen: boolean) => void
  isMobileMenuOpen: boolean
  setMobileMenuOpen: (isOpen: boolean) => void
  isFilterSidebarOpen: boolean
  setFilterSidebarOpen: (isOpen: boolean) => void
  storeLogo: string | null
  setStoreLogo: (url: string | null) => void
  themeConfig: any | null
  setThemeConfig: (config: any) => void
}

export const useUIStore = create<UIState>((set) => ({
  isAuthModalOpen: false,
  setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
  
  isMobileMenuOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  
  isFilterSidebarOpen: false,
  setFilterSidebarOpen: (isOpen) => set({ isFilterSidebarOpen: isOpen }),
  
  storeLogo: null,
  setStoreLogo: (url) => set({ storeLogo: url }),
  themeConfig: null,
  setThemeConfig: (config) => set({ themeConfig: config }),
}))
