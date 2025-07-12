"use client"

import { Progress } from "@/components/ui/progress"
import { Apple, Carrot, ShoppingBag } from "lucide-react"

// Sample data for top selling products
const topProducts = [
  {
    id: 1,
    name: "Manzanas Orgánicas",
    category: "Frutas",
    sales: 1245,
    percentage: 85,
    icon: Apple,
  },
  {
    id: 2,
    name: "Plátanos Orgánicos",
    category: "Frutas",
    sales: 980,
    percentage: 72,
    icon: Apple,
  },
  {
    id: 3,
    name: "Zanahorias Frescas",
    category: "Verduras",
    sales: 865,
    percentage: 65,
    icon: Carrot,
  },
  {
    id: 4,
    name: "Pack Familiar Semanal",
    category: "Packs",
    sales: 720,
    percentage: 58,
    icon: ShoppingBag,
  },
  {
    id: 5,
    name: "Espinacas Orgánicas",
    category: "Verduras",
    sales: 650,
    percentage: 48,
    icon: Carrot,
  },
]

export function TopSellingProducts() {
  // Eliminada la variable isMobile que no se usaba

  return (
    <div className="space-y-3">
      {topProducts.map((product) => (
        <div key={product.id} className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <product.icon className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs sm:text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs font-medium">{product.sales} uds</p>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={product.percentage} className="h-1.5" />
              <span className="text-xs text-muted-foreground">{product.percentage}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
