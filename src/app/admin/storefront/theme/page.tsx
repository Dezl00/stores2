import React from "react"
import { getWidgets } from "@/features/widget-builder/actions"
import { WidgetsClient } from "./widgets-client"
import { db } from "@/lib/db"

export default async function WidgetBuilderPage() {
  const [widgetsData, categories] = await Promise.all([
    getWidgets(),
    db.category.findMany({ select: { id: true, name: true, slug: true } })
  ])

  return <WidgetsClient initialWidgets={widgetsData.widgets || []} categories={categories} />
}
