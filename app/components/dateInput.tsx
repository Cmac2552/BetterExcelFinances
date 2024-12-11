interface ChildComponentProps {
  onDataChange: (data: string) => void;
}
export default function dateInput({ onDataChange }: ChildComponentProps) {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange(event.target.value);
  };
  return (
    <input
      type="month"
      id="month-picker"
      name="month-picker"
      className=" px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-[12rem]"
      onChange={handleDateChange}
    />
  );
}
