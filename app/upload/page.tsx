import {
  fetchTransactionsForStatementMonth,
  fetchCategorySpendingLastNMonths,
  getCategoriesForMonth,
  meanNMonthSpending,
} from "./actions";
import { UploadForm } from "./UploadForm";
import { CurrentMonthView } from "./CurrentMonthView";
import { CategorySpendingTable } from "./CategorySpendingTable";
import { CategoryModal } from "./CategoryModal";
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
            <UploadForm statementMonth={statementMonth}>
              <div className="flex items-center gap-3">
                <DateChange
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                />
                <CategoryModal />
              </div>
            </UploadForm>
          </div>

          <CurrentMonthView
            transactions={transactions}
            statementMonth={statementMonth}
            categoryOptions={statementMonthCategories ?? []}
            chartData={chartData}
          />
        </TabsContent>
        <TabsContent value="history">
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">
                Last 6 Months — Category Spending
              </h2>
              <p className="text-xs text-gray-400">
                Monthly categorical spend breakdown across your last 6 recorded statement periods
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lastSixMonthly.map((monthInformation) => {
                const spendingAmounts = monthInformation.spendingAmounts || [];
                const monthTotal = spendingAmounts.reduce(
                  (sum, item) => sum + (item.amount > 0 ? item.amount : 0),
                  0
                );

                return (
                  <div
                    key={monthInformation.statementMonth}
                    className="p-5 bg-[#141414] border border-white/10 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#f4f0e1]">
                        {monthInformation.label}
                      </h3>
                      {spendingAmounts.length > 0 && (
                        <span className="text-xs font-semibold text-[#00A896] bg-[#00A896]/10 px-2.5 py-0.5 rounded-full border border-[#00A896]/20 font-mono tabular-nums">
                          ${monthTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    {spendingAmounts.length === 0 ? (
                      <div className="text-sm text-gray-400 py-6 text-center">
                        No spending recorded
                      </div>
                    ) : (
                      <CategorySpendingTable data={spendingAmounts} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="mean">
          <div className="max-w-2xl mx-auto mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-[#f4f0e1]">
                  6 Month Category Average
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Normalized monthly average spending by category across the past 6 statement months
                </p>
              </div>
              <span className="text-xs font-semibold text-[#00A896] bg-[#00A896]/10 px-3 py-1 rounded-full border border-[#00A896]/20 font-mono tabular-nums">
                Avg: ${last6Mean.reduce((sum, item) => sum + (item.amount > 0 ? item.amount : 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
              </span>
            </div>
            <CategorySpendingTable data={last6Mean} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
