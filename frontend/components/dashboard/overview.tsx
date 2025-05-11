"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartWrapper, TooltipWrapper, TooltipContent } from "@/components/ui/chart"
import { OverviewInterface } from "@/lib/types";

interface OverviewProps {
  data: OverviewInterface;
  view: 'monthly' | 'yearly'; 
}

export function Overview({ data, view="monthly" }: OverviewProps) {
  // Ensure we have valid data
  const viewData = view === 'monthly' ? data.monthly : data.yearly;
  const safeData = Array.isArray(viewData) ? viewData : []
  const chartData = safeData.map((item) => ({
    date: view === 'monthly' ? item.month : item.year,
    profit: item.total_profit,
  }));
  console.log(safeData)

  // If no data, show empty chart with placeholder
  if (safeData.length === 0) {
    const emptyData = Array(6)
      .fill(0)
      .map((_, i) => ({
        date: `Month ${i + 1}`,
        profit: 0,
      }))

    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No profit data available</p>
      </div>
    )
  }

  return (
    <ChartWrapper
      className="h-[300px] w-full"
      customTooltip={
        <TooltipWrapper>
          <TooltipContent
            content={({ payload, label }) => {
              if (!payload?.length) {
                return null
              }

              return (
                <div className="space-y-1">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">₦{payload[0].value?.toLocaleString()}</p>
                </div>
              )
            }}
          />
        </TooltipWrapper>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 20,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₦${value}`}
          />
          <Tooltip />
          <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}
