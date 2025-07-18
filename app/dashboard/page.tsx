import { auth } from "@/auth";
import { fetchSections, fetchTableData } from "../actions/financial";
import Dashboard from "../components/dashboard";
import { parseNewMonth } from "../utils/monthUtils";
import { redirect } from "next/navigation";

// Add this line to force dynamic rendering
export const dynamic = "force-dynamic";
interface DashboardPageProps {
  searchParams: any;
}
async function DashboardPage({ searchParams }: Readonly<DashboardPageProps>) {
  const session = await auth();
  if (!session) {
    redirect("/landing");
  }

  const params = await searchParams;
  const month = params.month ?? getCurrentMonth();

  const [userData, tableData] = await Promise.all([
    fetchSections(parseNewMonth(month)),
    fetchTableData(),
  ]);

  return (
    <Dashboard
      key={month}
      tableDataInput={tableData}
      sections={userData}
      date={parseNewMonth(month)}
    />
  );
}

function getCurrentMonth() {
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export default DashboardPage;
