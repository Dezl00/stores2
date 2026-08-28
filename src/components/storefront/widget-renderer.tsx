import React from "react"
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

  switch (widget.type) {
    case "PromoBanner":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <PromoBanner widget={widget} />
        </section>
      )
    case "MarqueeAlerts":
      if (widget.settings?.placement !== 'content') return null;
      return (
        <section className={`w-full ${visibilityClass}`}>
          <MarqueeAlerts widget={widget} />
        </section>
      )
    case "PromoBentoGrid":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <PromoBentoGrid widget={widget} />
        </section>
      )
    case "CategoryGrid":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <CategoryGrid widget={widget} />
        </section>
      )
    case "HeroSlider":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <HeroSlider widget={widget} />
        </section>
      )
    case "ProductList":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <ProductList widget={widget} />
        </section>
      )
    case "FeaturedProduct":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <FeaturedProductWidget widget={widget} />
        </section>
      )
    
    case "TextBlock":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <TextBlock widget={widget} />
        </section>
      )
    case "BrandSlider":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <BrandSlider widget={widget} />
        </section>
      )
    case "AboutUs":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <AboutUs widget={widget} />
        </section>
      )
    case "ValuesSlider":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <ValuesSlider widget={widget} />
        </section>
      )
    case "StoreFeatures":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <StoreFeatures widget={widget} />
        </section>
      )
    case "LatestArticles":
      return (
        <section className={`w-full ${visibilityClass}`}>
          <LatestArticlesWidget widget={widget} />
        </section>
      )
    default:
      return null
  }
}
