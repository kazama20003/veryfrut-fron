"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { useMobile } from "@/hooks/use-mobile"

// Sample data for the inventory chart
const data = [
  { name: "Frutas", value: 45, color: "#22c55e" },
  { name: "Verduras", value: 35, color: "#84cc16" },
  { name: "Packs", value: 15, color: "#10b981" },
  { name: "Otros", value: 5, color: "#14b8a6" },
]

export function InventoryStatusChart() {
  const isMobile = useMobile()

  return (
    <div className="flex flex-col h-[180px] sm:h-[250px]">
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 30 : 50}
              outerRadius={isMobile ? 50 : 70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <Card>
                      <CardContent className="py-1 px-2">
                        <p className="text-xs font-medium">{payload[0].name}</p>
                        <p className="text-xs font-bold">{payload[0].value}%</p>
                      </CardContent>
                    </Card>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-2 pt-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
