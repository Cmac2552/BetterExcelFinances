import { useRouter } from "next/navigation";

interface ChildComponentProps {
  date: Date;
}
export default function DateInput({ date }: Readonly<ChildComponentProps>) {
  const router = useRouter();
  console.log(date);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    router.push("/dashboard?month=" + e.target.value);
  };

  return (
    <input
      type="month"
      id="month-picker"
      name="month-picker"
      className=" px-4 py-2 bg-[#1E2228] text-[#f4f0e1] border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus-visible:ring-[#f4f0e1]  w-[12rem]"
      value={`${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1
      ).padStart(2, "0")}`}
      onChange={handleChange}
    />
  );
}
