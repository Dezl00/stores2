"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { OptionDataType, OptionDisplayType, OptionBehavior } from "@prisma/client"
import { cn } from "@/lib/utils"
import { Check } from 'lucide-react'

// Define exactly what the component receives
interface ProductOptionValue {
  id: string
  label: string
  value: string
}

interface ProductOption {
  id: string
  name: string
  dataType: OptionDataType
  displayType: OptionDisplayType
  behavior: OptionBehavior
  isRequired: boolean
  values: ProductOptionValue[]
}

interface ProductVariant {
  id: string
  price: number | null
  stock: number
  imageUrl: string | null
  selections: { optionValueId: string }[]
}

interface Props {
  options: ProductOption[]
  variants: ProductVariant[]
  basePrice: number
  onVariantResolved?: (variant: ProductVariant | null, isAvailable: boolean) => void
}

export function ProductOptionsRenderer({ options, variants, basePrice, onVariantResolved }: Props) {
  // Store selected optionValueId per optionId
  const [selections, setSelections] = useState<Record<string, string>>({})
  
  const variantOptions = options.filter(o => o.behavior === OptionBehavior.VARIANT_OPTION)
  const attributeOptions = options.filter(o => o.behavior === OptionBehavior.PRODUCT_ATTRIBUTE)

  // Initialize with first available variant combinations if required
  useEffect(() => {
    if (variantOptions.length > 0 && Object.keys(selections).length === 0) {
      // Find first in-stock variant to pre-select
      const firstAvailable = variants.find(v => v.stock > 0)
      if (firstAvailable) {
        const initialSelections: Record<string, string> = {}
        firstAvailable.selections.forEach(sel => {
          // Find which option this belongs to
          const opt = variantOptions.find(o => o.values.some(v => v.id === sel.optionValueId))
          if (opt) initialSelections[opt.id] = sel.optionValueId
        })
        setSelections(initialSelections)
      }
    }
  }, [variantOptions, variants])

  // Resolve matching variant
  const resolvedVariant = useMemo(() => {
    if (variantOptions.length === 0) return null
    // All required variant options must be selected
    const requiredSelected = variantOptions.filter(o => o.isRequired).every(o => selections[o.id])
    if (!requiredSelected) return null
    
    // Find the variant that exactly matches the selections
    const selectedValueIds = Object.values(selections)
    return variants.find(v => {
      // Must have exactly the same number of selections
      if (v.selections.length !== selectedValueIds.length) return false
      // Every selected ID must be in the variant's selections
      return selectedValueIds.every(id => v.selections.some(s => s.optionValueId === id))
    }) || null
  }, [selections, variants, variantOptions])

  // Notify parent
  useEffect(() => {
    if (variantOptions.length > 0) {
      if (resolvedVariant) {
        onVariantResolved?.(resolvedVariant, resolvedVariant.stock > 0)
      } else {
        onVariantResolved?.(null, false)
      }
    }
  }, [resolvedVariant, variantOptions.length])

  const handleSelect = (optionId: string, valueId: string) => {
    setSelections(prev => ({ ...prev, [optionId]: valueId }))
  }

  // Display Components
  const renderOptionControl = (opt: ProductOption) => {
    const selectedValId = selections[opt.id]

    if (opt.displayType === OptionDisplayType.SWATCHES && opt.dataType === OptionDataType.COLOR) {
      return (
        <div className="flex flex-wrap gap-2">
          {opt.values.map(val => {
            const isSelected = selectedValId === val.id
            return (
              <button
                key={val.id}
                onClick={() => handleSelect(opt.id, val.id)}
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent ring-1 ring-border hover:ring-border/80"
                )}
                style={{ backgroundColor: val.value }}
                title={val.label}
              >
                {isSelected && (
                  <Check className={cn("w-5 h-5", isDarkColor(val.value) ? "text-white" : "text-black")} />
                )}
              </button>
            )
          })}
        </div>
      )
    }

    if (opt.displayType === OptionDisplayType.BUTTONS) {
      return (
        <div className="flex flex-wrap gap-2">
          {opt.values.map(val => (
            <button
              key={val.id}
              onClick={() => handleSelect(opt.id, val.id)}
              className={cn(
                "px-4 py-2 text-sm border rounded-md transition-all",
                selectedValId === val.id 
                  ? "border-primary bg-primary text-primary-foreground font-medium" 
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              {val.label}
            </button>
          ))}
        </div>
      )
    }

    // Default to Dropdown
    return (
      <select 
        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        value={selectedValId || ""}
        onChange={(e) => handleSelect(opt.id, e.target.value)}
      >
        <option value="" disabled>اختر {opt.name}</option>
        {opt.values.map(val => (
          <option key={val.id} value={val.id}>{val.label}</option>
        ))}
      </select>
    )
  }

  return (
    <div className="space-y-8">
      {/* Variant Selectors */}
      {variantOptions.length > 0 && (
        <div className="space-y-6">
          {variantOptions.map(opt => (
            <div key={opt.id} className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold">{opt.name}</label>
                {selections[opt.id] && (
                  <span className="text-sm text-muted-foreground">
                    {opt.values.find(v => v.id === selections[opt.id])?.label}
                  </span>
                )}
              </div>
              {renderOptionControl(opt)}
            </div>
          ))}
        </div>
      )}

      {/* Product Attributes Details Box */}
      {attributeOptions.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
          <h4 className="font-semibold text-sm mb-4">مواصفات المنتج</h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {attributeOptions.map(opt => (
              <div key={opt.id} className="flex justify-between sm:block pb-2 sm:pb-0 border-b sm:border-0 border-slate-200">
                <dt className="text-muted-foreground">{opt.name}</dt>
                {/* For attributes, we just list the values (e.g., Material: Cotton, Polyester) */}
                <dd className="font-medium">{opt.values.map(v => v.label).join('، ')}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}

function isDarkColor(hex: string) {
  if (!hex) return false
  const c = hex.substring(1)
  const rgb = parseInt(c, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >>  8) & 0xff
  const b = (rgb >>  0) & 0xff
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luma < 128
}
