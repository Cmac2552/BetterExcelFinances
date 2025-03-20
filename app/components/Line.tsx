"use client";
import { useEffect, useState } from "react";
import { XAxis, YAxis, AreaChart, Area } from "recharts";
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

interface LineInputProps {
  lineLoading: (loading: boolean) => void;
}
export default function Chart({ lineLoading }: LineInputProps) {
  const [tableData, setTableData] = useState([] as TableData[]);

  useEffect(() => {
    const fetchData = async () => {
      lineLoading(true);
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
        lineLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-[500px] max-h-[500px] w-full">
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
    </div>
  );
}
