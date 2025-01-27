"use client";
import "chart.js/auto";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

type TableData = {
  data: any[];
  labels: string[];
};
export default function LineChart() {
  const [tableData, setTableData] = useState({
    data: [],
    labels: [],
  } as TableData);

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
    <div>
      {/* <button onClick={()=>}>Refresh Table</button> */}
      <Line
        data={{
          labels: tableData.labels,
          datasets: [
            {
              label: "Net Worth",
              data: tableData.data.map((data: any) => data.sectionValue),

              borderWidth: 1,
            },
          ],
        }}
      />
    </div>
  );
}
