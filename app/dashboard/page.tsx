import { fetchSections, fetchTableData } from "../actions/financial";
import Dashboard from "../components/dashboard";
import { parseNewMonth } from "../utils/monthUtils";

interface DashboardPageProps {
  searchParams: any;
}
async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const month = params.month ?? getCurrentMonth();

  const [userData, tableData] = await Promise.all([
    fetchSections(parseNewMonth(month)),
    fetchTableData(),
  ]);

  return (
    <div className="dashboard">
      <Dashboard tableDataInput={tableData} sections={userData} date={month} />
    </div>
  );
}

function getCurrentMonth() {
  const today = new Date();
  const now = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  );

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default DashboardPage;
