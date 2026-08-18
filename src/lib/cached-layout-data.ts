import { db } from "@/lib/db"
import { unstable_cache } from "next/cache"

export const getCachedLayoutData = unstable_cache(
  async (storeId: string) => {
    const [
      headerMenu,
      footerMenu,
      fallbackMenu,
      themeConfig,
      categories,
      branches,
      departments
    ] = await Promise.all([
      db.menu.findFirst({
        where: { name: { contains: "header", mode: "insensitive" }, storeId },
        include: { items: { orderBy: { sortOrder: 'asc' } } }
      }),
      db.menu.findFirst({
        where: { name: { contains: "footer", mode: "insensitive" }, storeId },
        include: { items: { orderBy: { sortOrder: 'asc' } } }
      }),
      db.menu.findFirst({
        include: { items: { orderBy: { sortOrder: 'asc' } } }
      }),
      db.themeConfig.findUnique({
        where: { storeId }
      }),
      db.category.findMany({
        include: { children: true }
      }),
      db.branch.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }),
      db.department.findMany({
        include: { categories: true }
      })
    ])

    return {
      headerMenu,
      footerMenu,
      fallbackMenu,
      themeConfig,
      categories,
      branches,
      departments
    }
  },
  ['store-layout-data'],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ['layout-data']
  }
)
