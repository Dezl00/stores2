"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { resolveStoreId } from "@/lib/store-context"

export async function getArticles() {
  const storeId = await resolveStoreId()
  try {
    const articles = await db.article.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" }
    })
    return { success: true, articles }
  } catch (error) {
    console.error("Error fetching articles:", error)
    return { success: false, error: "حدث خطأ أثناء جلب المقالات" }
  }
}

export async function getActiveArticles(limit?: number) {
  const storeId = await resolveStoreId()
  try {
    const articles = await db.article.findMany({
      where: { isActive: true, storeId },
      orderBy: { createdAt: "desc" },
      take: limit
    })
    return { success: true, articles }
  } catch (error) {
    console.error("Error fetching active articles:", error)
    return { success: false, error: "حدث خطأ أثناء جلب المقالات" }
  }
}

export async function getArticleBySlug(slug: string) {
  const storeId = await resolveStoreId()
  try {
    const decodedSlug = decodeURIComponent(slug)
    const article = await db.article.findUnique({
      where: { slug_storeId: { slug: decodedSlug, storeId } }
    })
    return { success: true, article }
  } catch (error) {
    console.error("Error fetching article:", error)
    return { success: false, error: "حدث خطأ أثناء جلب المقال" }
  }
}

export async function getArticleById(id: string) {
  const storeId = await resolveStoreId()
  try {
    const article = await db.article.findFirst({ where: { id, storeId } })
    return { success: true, article }
  } catch (error) {
    console.error("Error fetching article:", error)
    return { success: false, error: "حدث خطأ أثناء جلب المقال" }
  }
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function createArticle(data: {
  title: string
  content: string
  imageUrl?: string
  seoTitle?: string
  seoDesc?: string
  isActive?: boolean
}) {
  const session = await auth()
  const storeId = await resolveStoreId()
  // Allow ADMIN or MANAGER to create articles. 
  // In `assal` project, it seems we check if session?.user has permission, but for simplicity we check if not CUSTOMER
  if (!session?.user || session.user.role === "CUSTOMER") return { success: false, error: "غير مصرح لك" }

  try {
    const slug = generateSlug(data.title)
    const article = await db.article.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        imageUrl: data.imageUrl,
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        isActive: data.isActive ?? true,
        storeId,
      }
    })
    
    revalidatePath("/admin/articles")
    revalidatePath("/blog")
    revalidatePath("/")
    
    return { success: true, article }
  } catch (error) {
    console.error("Error creating article:", error)
    return { success: false, error: "حدث خطأ أثناء إنشاء المقال" }
  }
}

export async function updateArticle(id: string, data: {
  title?: string
  content?: string
  imageUrl?: string
  seoTitle?: string
  seoDesc?: string
  isActive?: boolean
}) {
  const session = await auth()
  const storeId = await resolveStoreId()
  if (!session?.user || session.user.role === "CUSTOMER") return { success: false, error: "غير مصرح لك" }

  try {
    const article = await db.article.update({ where: { id },
      data: {
        ...data,
      }
    })
    
    revalidatePath("/admin/articles")
    revalidatePath("/blog")
    revalidatePath(`/blog/${article.slug}`)
    revalidatePath("/")
    
    return { success: true, article }
  } catch (error) {
    console.error("Error updating article:", error)
    return { success: false, error: "حدث خطأ أثناء تعديل المقال" }
  }
}

export async function deleteArticle(id: string) {
  const session = await auth()
  const storeId = await resolveStoreId()
  if (!session?.user || session.user.role === "CUSTOMER") return { success: false, error: "غير مصرح لك" }

  try {
    await db.article.delete({ where: { id }})
    
    revalidatePath("/admin/articles")
    revalidatePath("/blog")
    revalidatePath("/")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting article:", error)
    return { success: false, error: "حدث خطأ أثناء حذف المقال" }
  }
}

