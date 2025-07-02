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
    <div className="dashboard">
      <Dashboard
        tableDataInput={tableData}
        sections={userData}
        date={parseNewMonth(month)}
      />
    </div>
  );
}

function getCurrentMonth() {
  const today = new Date();
  const now = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1)
  );
  console.log(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default DashboardPage;
