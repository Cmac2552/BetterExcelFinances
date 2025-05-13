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

  const gradientOffset = () => {
    if (tableData.length === 0) {
      return 0;
    }
    const dataMax = Math.max(...tableData.map((i) => i.value));
    const dataMin = Math.min(...tableData.map((i) => i.value));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

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
    <div className="min-h-[550px] max-h-[550px] w-full flex flex-col items-center">
      <button
        className="bg-[#f4f0e1] self-end w-fit mr-2 py-1 px-4 font-medium rounded-md text-black hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300"
        onClick={fetchData}
      >
        Refresh Chart
      </button>
      <ChartContainer config={chartConfig} className="max-h-[500px] w-full">
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
            interval={0}
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
              <stop offset={off} stopColor="#00A896" stopOpacity={0.6} />
              <stop offset={off} stopColor="#7B0323" stopOpacity={0.6} />
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
