import FinancialInputs from "./components/financialInputs.tsx";
import LineChart from "./components/Line.tsx";

export default function Home() {
  return (
    <main className=" min-h-screen bg-black h-full">
      <div className="z-10 w-full h-[40rem] grid-cols-2 grid">
        <FinancialInputs />
        <LineChart />
      </div>
    </main>
  );
}
