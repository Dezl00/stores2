import React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { HeroSlider } from "./widgets/hero-slider"
import { TextBlock } from "./widgets/text-block"
import { BrandSlider } from "./widgets/brand-slider"
import { CategoryGrid } from "./widgets/category-grid"
import { AboutUs } from "./widgets/about-us"
import { ValuesSlider } from "./widgets/values-slider"
import { StoreFeatures } from "./widgets/store-features"
import { ProductList } from "./widgets/product-list"
import { FeaturedProductWidget } from "./widgets/featured-product"
import { LatestArticlesWidget } from "./widgets/latest-articles"
import { PromoBanner } from "./widgets/promo-banner"
import { MarqueeAlerts } from "./widgets/marquee-alerts"
import { PromoBentoGrid } from "./widgets/promo-bento-grid"

export function WidgetRenderer({ widget }: { widget: any }) {
  // Common visibility classes based on settings
  if (!widget.showDesktop && !widget.showMobile) return null
  let visibilityClass = ""
  if (!widget.showDesktop) visibilityClass += " md:hidden"
  if (!widget.showMobile) visibilityClass += " hidden md:block"

  const renderContent = () => {
    switch (widget.type) {
      case "PromoBanner":
        return <PromoBanner widget={widget} />
      case "MarqueeAlerts":
        if (widget.settings?.placement !== 'content') return null;
        return <MarqueeAlerts widget={widget} />
      case "PromoBentoGrid":
        return <PromoBentoGrid widget={widget} />
      case "CategoryGrid":
        return <CategoryGrid widget={widget} />
      case "HeroSlider":
        return <HeroSlider widget={widget} />
      case "ProductList":
        return <ProductList widget={widget} />
      case "FeaturedProduct":
        return <FeaturedProductWidget widget={widget} />
      case "TextBlock":
        return <TextBlock widget={widget} />
      case "BrandSlider":
        return <BrandSlider widget={widget} />
      case "AboutUs":
        return <AboutUs widget={widget} />
      case "ValuesSlider":
        return <ValuesSlider widget={widget} />
      case "StoreFeatures":
        return <StoreFeatures widget={widget} />
      case "LatestArticles":
        return <LatestArticlesWidget widget={widget} />
      default:
        return null
    }
  }

  const content = renderContent()
  if (!content) return null

  // Don't wrap HeroSlider or MarqueeAlerts in global scroll reveal
  if (widget.type === "HeroSlider" || widget.type === "MarqueeAlerts") {
    return (
      <section className={`w-full ${visibilityClass}`}>
        {content}
      </section>
    )
  }

  // Wrap all other widgets in a smooth scroll reveal for professional entrance
  return (
    <ScrollReveal variant="fade-up" duration={1.0} delay={0.1}>
      <section className={`w-full ${visibilityClass}`}>
        {content}
      </section>
    </ScrollReveal>
  )
}
