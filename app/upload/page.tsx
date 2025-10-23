import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { UploadForm } from "./UploadForm";
import { TransactionViewer } from "./TransactionViewer";
import { CategoryPieChart } from "./CategoryPieChart";
import { CategorySpendingTable } from "./CategorySpendingTable";
import { LastSixMonths } from "./LastSixMonths";
import { getLastSixMonths } from "./actions";
import { Transaction } from "@prisma/client";
import { DateChange } from "./dateChange";

interface Props {
  readonly searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

function aggregateDataForChart(transactions: Transaction[]) {
  if (!transactions) return [];

  const spendingByCategory = transactions.reduce((acc, transaction) => {
    if (transaction.amount > 0) {
      const category = transaction.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + transaction.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(spendingByCategory)
    .map(([category, amount]) => ({
      category,
      amount: Number.parseFloat(amount.toFixed(2)),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export default async function UploadPage({ searchParams }: Props) {
  const session = await auth();
  const userId = session?.user?.id;

  const today = new Date();
  const params = await searchParams;
  const currentMonth = Number.parseInt(
    params?.month || (today.getUTCMonth() + 1).toString()
  );
  const currentYear = Number.parseInt(
    params?.year || today.getUTCFullYear().toString()
  );

  const statementMonth = `${currentMonth}-${currentYear}`;

  let transactions: Transaction[] = [];
  if (userId) {
    transactions = await prisma.transaction.findMany({
      where: {
        userId,
        statementMonth,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  const chartData = aggregateDataForChart(transactions);

  const lastSix = userId ? await getLastSixMonths(currentMonth, currentYear) : [];

  return (
    <main className="container mx-auto p-4 text-[#f4f0e1]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Upload CSV</h1>
        <div className="flex items-center gap-4">
          <UploadForm statementMonth={statementMonth} />
          <DateChange currentMonth={currentMonth} currentYear={currentYear} />
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Category Spending</h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-[80%]">
              <div className="h-[400px] w-25%">
                <CategoryPieChart data={chartData} />
              </div>
              <div className="h-full w-full flex justify-center">
                <CategorySpendingTable data={chartData} />
              </div>
            </div>
          </div>
        </div>
      )}

  <LastSixMonths initialMonths={lastSix} />

      <div>
        <h2 className="text-xl font-bold mb-4 text-[#f4f0e1]">Transactions</h2>
        <TransactionViewer
          transactions={transactions}
          statementMonth={statementMonth}
        />
      </div>
    </main>
  );
}
