"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { resolveStoreId } from "@/lib/store-context"
import { requirePermission } from "@/lib/auth/require-admin"

export async function getArticles() {
  try {
    const storeId = await resolveStoreId()
    const articles = await db.article.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" }
    })
    return { success: true, articles }
  } catch (error) {
    console.error("Error fetching articles:", error)
    return { success: false, error: "حدث خطأ أثناء استرجاع المقالات" }
  }
}

export async function getActiveArticles(limit?: number) {
  try {
    const storeId = await resolveStoreId()
    const articles = await db.article.findMany({
      where: { isActive: true, storeId },
      orderBy: { createdAt: "desc" },
      take: limit
    })
    return { success: true, articles }
  } catch (error) {
    console.error("Error fetching active articles:", error)
    return { success: false, error: "حدث خطأ أثناء استرجاع المقالات" }
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    const storeId = await resolveStoreId()
    const decodedSlug = decodeURIComponent(slug)
    const article = await db.article.findUnique({
      where: { slug_storeId: { slug: decodedSlug, storeId } }
    })
    return { success: true, article }
  } catch (error) {
    console.error("Error fetching article:", error)
    return { success: false, error: "حدث خطأ أثناء استرجاع المقال" }
  }
}

export async function getArticleById(id: string) {
  try {
    const storeId = await resolveStoreId()
    const article = await db.article.findFirst({ where: { id, storeId } })
    return { success: true, article }
  } catch (error) {
    console.error("Error fetching article:", error)
    return { success: false, error: "حدث خطأ أثناء استرجاع المقال" }
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
  try {
    await requirePermission("articles.create")
    const storeId = await resolveStoreId()
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
  } catch (error: any) {
    console.error("Error creating article:", error)
    return { success: false, error: error.message || "حدث خطأ أثناء إضافة المقال" }
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
  try {
    await requirePermission("articles.edit")
    const storeId = await resolveStoreId()
    
    const existing = await db.article.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "المقال غير موجود أو غير مصرح لك بتعديله" }
    
    const article = await db.article.update({ 
      where: { id },
      data: { ...data }
    })
    
    revalidatePath("/admin/articles")
    revalidatePath("/blog")
    revalidatePath(`/blog/${article.slug}`)
    revalidatePath("/")
    
    return { success: true, article }
  } catch (error: any) {
    console.error("Error updating article:", error)
    return { success: false, error: error.message || "حدث خطأ أثناء تعديل المقال" }
  }
}

export async function deleteArticle(id: string) {
  try {
    await requirePermission("articles.delete")
    const storeId = await resolveStoreId()
    
    const existing = await db.article.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "المقال غير موجود أو غير مصرح لك بحذفه" }
    
    await db.article.delete({ where: { id }})
    
    revalidatePath("/admin/articles")
    revalidatePath("/blog")
    revalidatePath("/")
    
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting article:", error)
    return { success: false, error: error.message || "حدث خطأ أثناء حذف المقال" }
  }
}
