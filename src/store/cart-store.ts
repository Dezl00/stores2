import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'id'>, openDrawer?: boolean) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setIsOpen: (isOpen: boolean) => void
  getTotals: () => { total: number; count: number }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (newItem, openDrawer = false) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId
          )

          if (existingItemIndex > -1) {
            const newItems = [...state.items]
            newItems[existingItemIndex].quantity += newItem.quantity
            return { items: newItems, ...(openDrawer && { isOpen: true }) }
          }

          return {
            items: [...state.items, { ...newItem, id: Math.random().toString(36).substring(7) }],
            ...(openDrawer && { isOpen: true })
          }
        })
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),
      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen) => set({ isOpen }),
      getTotals: () => {
        const { items } = get()
        return items.reduce(
          (totals, item) => ({
            total: totals.total + item.price * item.quantity,
            count: totals.count + item.quantity,
          }),
          { total: 0, count: 0 }
        )
      },
    }),
    {
      name: 'assal-cart-storage',
    }
  )
)
