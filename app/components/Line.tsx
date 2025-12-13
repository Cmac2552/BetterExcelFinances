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
import { Tailspin } from "ldrs/react";
import { formatCurrency } from "../utils/currencyUtils";
import "ldrs/react/Tailspin.css";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface Props {
  tableData: TableData[];
}

export function LineChart({ tableData }: Readonly<Props>) {
  if (tableData.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Tailspin size="75" stroke="5" speed="0.9" color="#f4f0e1" />
      </div>
    );
  }
  return (
    <div className="min-h-[450px] max-h-[450px] w-full flex flex-col items-center justify-center">
      <ChartContainer config={chartConfig} className="max-h-[375px] w-full">
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
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip
            contentStyle={{
              color: "#000000",
              fontSize: "14px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "#f4f0e1",
            }}
            content={({ active, payload }) => {
              if (active && payload?.length) {
                return (
                  <div className="bg-[#f4f0e1] rounded px-2 py-1">
                    <div>{payload[0].payload.month}</div>
                    <div>{formatCurrency(payload[0].value as number)}</div>
                  </div>
                );
              }
              return null;
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
