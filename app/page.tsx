import FinancialInputs from "./components/financialInputs.tsx";
import LineChart from "./components/Line.tsx";

async function fetchData() {
  const res = await fetch("http://localhost:3000/api/sections", {
    cache: "no-store", // Ensure fresh data on each request
  });
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return await res.json();
}

export default async function Home() {
  const data = await fetchData();
  // console.log(data, 0);
  return (
    <main className=" min-h-screen">
      <div className="z-10 w-full h-[40rem]">
        <FinancialInputs sections={data} />
        <LineChart />
      </div>
    </main>
  );
}
