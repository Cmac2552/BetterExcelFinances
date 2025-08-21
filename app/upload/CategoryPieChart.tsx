"use client";

import { Pie, PieChart, Cell, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type Props = {
  data: {
    category: string;
    amount: number;
  }[];
};

const COLORS = [
  "#A2CFFE", // Baby Blue
  "#D98880", // Muted Red
  "#98FB98", // Muted Green
  "#F3E5AB", // Muted Yellow
  "#D3D3D3", // Light Grey
  "#F5F5F5", // White Smoke
  "#B0C4DE", // Light Steel Blue
  "#E9967A", // Dark Salmon (Muted Red/Orange)
  "#8FBC8F", // Dark Sea Green
  "#EEE8AA", // Pale Goldenrod (Muted Yellow)
  "#C0C0C0", // Silver
  "#AFEEEE", // Pale Turquoise
  "#FFB6C1", // Light Pink
  "#90EE90", // Light Green
  "#ADD8E6", // Light Blue
  "#778899", // Light Slate Gray
];

export function CategoryPieChart({ data }: Readonly<Props>) {
  if (data.length === 0) {
    return <p className="text-center text-gray-500">No data to display.</p>;
  }

  const chartConfig = data.reduce((acc, item) => {
    acc[item.category] = { label: item.category };
    return acc;
  }, {} as any);

  return (
    <div className="min-h-[225px] max-h-[225px] w-full">
      <ChartContainer config={chartConfig} className="max-h-[225px] w-full">
        <PieChart>
          <Legend
            layout="vertical"
            align="left"
            verticalAlign="middle"
            iconType="circle"
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />

          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
