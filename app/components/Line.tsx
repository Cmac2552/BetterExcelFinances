"use client";
import {
  XAxis,
  YAxis,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { format } from "date-fns";
import { TableData } from "../types";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface LineInputProps {
  tableData: TableData[];
}

export default function Chart({ tableData }: LineInputProps) {
  return (
    <div className="min-h-[450px] max-h-[450px] w-full flex flex-col items-center gap-12">
      <ChartContainer config={chartConfig} className="max-h-[375px] w-[75%]">
        <AreaChart
          data={tableData}
          margin={{ left: 0, right: 65, bottom: 0 }}
          className="w-full max-w-[400px] mx-auto"
        >
          <CartesianGrid stroke="#393939" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => format(new Date(value), "MMM yyyy")}
          ></XAxis>
          <YAxis />
          <Tooltip
            contentStyle={{
              color: "#000000", // This changes the font color
              fontSize: "14px",
            }}
            itemStyle={{
              color: "#000000", // This changes the value color (y-axis values)
            }}
            labelStyle={{
              color: "#000000", // This ensures the label (x-axis value) color is set
            }}
          />
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00A896" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#00A896" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            dataKey="value"
            type="monotone"
            fill="url(#splitColor)"
            stroke="#f4f0e1"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
