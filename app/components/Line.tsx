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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-[500px] max-h-[500px] w-full">
      {loading ? (
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      ) : (
        <ChartContainer config={chartConfig} className="max-h-[500px] w-full">
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
      )}
    </div>
  );
}
