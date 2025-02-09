"use client";
import { useEffect, useState } from "react";
import { XAxis, YAxis, LineChart, Line, AreaChart, Area } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

type TableData = {
  month: string;
  value: number;
};
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;
const chartData = [
  { month: "January", value: 0 },
  { month: "February", value: -20 },
  { month: "March", value: 237 },
  { month: "April", value: 0 },
  { month: "May", value: 0 },
  { month: "June", value: 214 },
];
export default function Chart() {
  const [tableData, setTableData] = useState([] as TableData[]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetch("/api/table-data", {
          cache: "no-store",
        });
        if (!result.ok) {
          throw new Error("Failed to fetch Table Data");
        }
        const tableData = await result.json();
        setTableData(tableData);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] max-h-[500px] w-full"
    >
      <AreaChart
        data={tableData}
        margin={{ left: 0, right: 65, bottom: 0 }}
        className="w-full max-w-[400px] mx-auto"
      >
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          interval={0}
        ></XAxis>
        <YAxis />
        <Area dataKey="value" type="monotone" />
      </AreaChart>
    </ChartContainer>
  );
}
