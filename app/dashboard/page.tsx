import { auth } from "@/auth";
import { fetchSections, fetchTableData } from "../actions/financial";
import Dashboard from "../components/dashboard";
import { parseNewMonth } from "../utils/monthUtils";
import { redirect } from "next/navigation";

// Add this line to force dynamic rendering
export const dynamic = "force-dynamic";
interface Props {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
}

async function DashboardPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) {
    redirect("/landing");
  }

  const params = await searchParams;
  const month = params?.month ?? getCurrentMonth();

  const [userData, tableData] = await Promise.all([
    fetchSections(parseNewMonth(month)),
    fetchTableData(),
  ]);

  const dashboardDate = parseNewMonth(month);

  return (
    <Dashboard
      key={dashboardDate.toUTCString()}
      tableDataInput={tableData}
      sections={userData}
      date={dashboardDate}
    />
  );
}

function getCurrentMonth() {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export default DashboardPage;
