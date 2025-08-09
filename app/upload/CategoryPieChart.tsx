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
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
  "#775DD0",
  "#546E7A",
  "#26A69A",
  "#D4E157",
  "#FF7043",
  "#8D6E63",
  "#789262",
  "#BA68C8",
  "#FFD600",
  "#43A047",
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
            label
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
