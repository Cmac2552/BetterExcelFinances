"use client";

interface ChartData {
  category: string;
  amount: number;
}

interface Props {
  data: ChartData[];
}

export function CategorySpendingTable({ data }: Props) {
  const totalAmount = data.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[50%] divide-y divide-gray-700">
        <thead className="">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Category
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody className=" divide-y divide-gray-700">
          {data.map(({ category, amount }) => (
            <tr key={category}>
              <td className="px-6 py-1 whitespace-nowrap text-sm font-medium text-white">
                {category}
              </td>
              <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-300">
                ${amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
              Total
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
              ${totalAmount.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
