import { getArticleById } from "@/features/articles/actions"
import { ArticleEditorClient } from "./article-editor-client"

export default async function EditArticlePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const isNew = params.id === "new"
  
  let article = null
  if (!isNew) {
    const res = await getArticleById(params.id)
    if (res.success) {
      article = res.article
    }
  }

  return <ArticleEditorClient initialArticle={article} />
}
