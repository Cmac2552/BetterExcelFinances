import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";
import { UploadForm } from "./UploadForm";
import { TransactionViewer } from "./TransactionViewer";
import { CategoryPieChart } from "./CategoryPieChart";
import { Transaction } from "@prisma/client";

interface Props {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

function getStatementDateRange(month: number, year: number) {
  const startDate = new Date(Date.UTC(year, month - 2, 26));
  const endDate = new Date(Date.UTC(year, month - 1, 25, 23, 59, 59, 999));
  return { startDate, endDate };
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
      amount: parseFloat(amount.toFixed(2)),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export default async function UploadPage({ searchParams }: Props) {
  const session = await auth();
  const userId = session?.user?.id;

  const today = new Date();
  const params = await searchParams;
  const currentMonth = parseInt(
    params?.month || (today.getUTCMonth() + 1).toString()
  );
  const currentYear = parseInt(
    params?.year || today.getUTCFullYear().toString()
  );

  const { startDate, endDate } = getStatementDateRange(
    currentMonth,
    currentYear
  );

  let transactions: Transaction[] = [];
  if (userId) {
    transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  const chartData = aggregateDataForChart(transactions);

  return (
    <main className="container mx-auto p-4 text-[#f4f0e1]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Upload CSV</h1>
        <UploadForm />
      </div>

      {chartData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Category Spending</h2>
          <CategoryPieChart data={chartData} />
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4 text-[#f4f0e1]">Transactions</h2>
        <TransactionViewer
          transactions={transactions}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      </div>
    </main>
  );
}
