"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

// Sample data for the sales chart
const data = [
  { date: "01/04", sales: 4000 },
  { date: "02/04", sales: 3000 },
  { date: "03/04", sales: 5000 },
  { date: "04/04", sales: 2780 },
  { date: "05/04", sales: 1890 },
  { date: "06/04", sales: 2390 },
  { date: "07/04", sales: 3490 },
  { date: "08/04", sales: 2000 },
  { date: "09/04", sales: 2780 },
  { date: "10/04", sales: 1890 },
  { date: "11/04", sales: 2390 },
  { date: "12/04", sales: 3490 },
  { date: "13/04", sales: 3000 },
  { date: "14/04", sales: 2000 },
  { date: "15/04", sales: 2780 },
  { date: "16/04", sales: 1890 },
  { date: "17/04", sales: 2390 },
  { date: "18/04", sales: 3490 },
  { date: "19/04", sales: 2000 },
  { date: "20/04", sales: 2780 },
  { date: "21/04", sales: 1890 },
  { date: "22/04", sales: 2390 },
  { date: "23/04", sales: 3490 },
  { date: "24/04", sales: 4000 },
  { date: "25/04", sales: 3000 },
  { date: "26/04", sales: 2000 },
  { date: "27/04", sales: 5000 },
  { date: "28/04", sales: 3490 },
  { date: "29/04", sales: 4000 },
  { date: "30/04", sales: 5000 },
]

export function SalesOverviewChart() {
  const isMobile = useMobile()
  const [chartData, setChartData] = useState(data)

  // For mobile, show fewer data points to avoid crowding
  useEffect(() => {
    if (isMobile) {
      // Show every 5th data point on mobile
      const filteredData = data.filter((_, index) => index % 5 === 0)
      setChartData(filteredData)
    } else {
      setChartData(data)
    }
  }, [isMobile])

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 180 : 250}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={(value) => value}
          stroke="#888888"
          fontSize={10}
          tick={{ fontSize: isMobile ? 8 : 10 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={(value) => `${value}`}
          stroke="#888888"
          fontSize={10}
          tick={{ fontSize: isMobile ? 8 : 10 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card>
                  <CardContent className="py-1 px-2">
                    <p className="text-xs font-medium">{payload[0].payload.date}</p>
                    <p className="text-xs font-bold">${payload[0].value}</p>
                  </CardContent>
                </Card>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#22c55e", stroke: "#ffffff", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
