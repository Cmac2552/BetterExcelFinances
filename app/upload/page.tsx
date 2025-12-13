import {
  fetchTransactionsForStatementMonth,
  fetchCategorySpendingLastNMonths,
  getCategoriesForMonth,
  meanNMonthSpending,
} from "./actions";
import { UploadForm } from "./UploadForm";
import { TransactionViewer } from "./TransactionViewer";
import { CategoryPieChart } from "./CategoryPieChart";
import { CategorySpendingTable } from "./CategorySpendingTable";
import { Transaction } from "@prisma/client";
import { DateChange } from "./dateChange";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const today = new Date();
  const params = await searchParams;
  const currentMonth = Number.parseInt(
    params?.month || (today.getUTCMonth() + 1).toString()
  );
  const currentYear = Number.parseInt(
    params?.year || today.getUTCFullYear().toString()
  );

  const statementMonth = `${currentMonth}-${currentYear}`;

  const [transactions, lastSixMonthly, statementMonthCategories, last6Mean] =
    await Promise.all([
      fetchTransactionsForStatementMonth(statementMonth),
      fetchCategorySpendingLastNMonths(6, currentMonth, currentYear),
      getCategoriesForMonth(statementMonth),
      meanNMonthSpending(6, currentMonth, currentYear),
    ]);

  const chartData = aggregateDataForChart(transactions);

  return (
    <main className="container mx-auto p-4 text-[#f4f0e1]">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="bg-[#1E2228] border border-gray-800 mb-6 px-2 py-6">
          <TabsTrigger
            value="current"
            className="data-[state=active]:bg-[#f4f0e1] px-2 py-2 text-[#f4f0e1]"
          >
            Current Month
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-[#f4f0e1] px-2 py-2 text-[#f4f0e1]"
          >
            6 Month History
          </TabsTrigger>
          <TabsTrigger
            value="mean"
            className="data-[state=active]:bg-[#f4f0e1] px-2 py-2 text-[#f4f0e1]"
          >
            6 Month Average
          </TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">Upload CSV</h1>
            <div className="flex items-center gap-4">
              <UploadForm statementMonth={statementMonth} />
              <DateChange
                currentMonth={currentMonth}
                currentYear={currentYear}
              />
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

          <div>
            <h2 className="text-xl font-bold mb-4 text-[#f4f0e1]">
              Transactions
            </h2>
            <TransactionViewer
              transactions={transactions}
              statementMonth={statementMonth}
              categoryOptions={statementMonthCategories ?? []}
            />
          </div>
        </TabsContent>
        <TabsContent value="history">
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">
              Last 6 Months — Category Spending
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lastSixMonthly.map((m) => {
                const data = m.data || [];
                return (
                  <div
                    key={m.statementMonth}
                    className="p-4 bg-[#121212] rounded"
                  >
                    <h3 className="font-semibold mb-2">{m.label}</h3>
                    {data.length === 0 ? (
                      <div className="text-sm text-gray-400">
                        No spending recorded
                      </div>
                    ) : (
                      <CategorySpendingTable data={data} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="mean">
          <div className="w-full flex justify-center">
            <div className="w-1/2">
              <h2> Last 6 Month Average</h2>
              <CategorySpendingTable data={last6Mean}></CategorySpendingTable>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
