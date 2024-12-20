import CurrencyInput from "react-currency-input-field";

export type FinancialSectionData = {
  month: Date;
  title: String;
  values: FinancialSectionItemData[];
  userId: number;
};

type FinancialSectionItemData = {
  label: string;
  value: number;
  sectionId: number;
};

interface FinancialSectionProps {
  section: FinancialSectionData;
}

export default function FinancialSection({ section }: FinancialSectionProps) {
  const sectionValue = section.values.reduce(
    (finalValue: number, currentValue: FinancialSectionItemData) =>
      finalValue + currentValue.value,
    0
  );

  return (
    <div className="my-4">
      <h2 className="text-white text-2xl ">
        {section.title} - ${sectionValue.toLocaleString()}
      </h2>
      <div className="w-1/2 ml-2">
        <form>
          {section.values.map(
            (value: FinancialSectionItemData, index: number) => (
              <div key={index} className="flex items-center">
                <label className="text-white mr-2" key={index + value.label}>
                  {value.label}
                </label>
                <CurrencyInput
                  key={index + value.label + "currentyInput"}
                  id={value.label}
                  name={value.label}
                  placeholder="Please enter a number"
                  defaultValue={value.value}
                  decimalsLimit={2}
                  prefix="$"
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 my-1 min-w-[15rem] mx-4"
                />
              </div>
            )
          )}
        </form>
      </div>
    </div>
  );
}
