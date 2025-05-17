"use client";
import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
} from "recharts";
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

  const fetchData = async () => {
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
        if (tableData.error) {
          throw new Error(tableData.error);
        }
        setTableData(tableData);
      } catch (err) {
        console.log(err);
        setTableData([]);
      } finally {
        lineLoading(false);
      }
    };
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-[550px] max-h-[550px] w-full flex flex-col items-center gap-12">
      <button
        className="bg-[#f4f0e1] self-end w-fit mr-2 py-1 px-4 font-medium rounded-md text-black hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300"
        onClick={fetchData}
      >
        Refresh Chart
      </button>
      <ChartContainer config={chartConfig} className="max-h-[375px] w-[75%]">
        <AreaChart
          data={tableData}
          margin={{ left: 0, right: 65, bottom: 0 }}
          className="w-full max-w-[400px] mx-auto"
        >
          <CartesianGrid stroke="#393939" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false}></XAxis>
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
