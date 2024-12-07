import Input from "./input";

export default function FinancialSection() {
  async function handleData(data: number) {
    "use server";
    console.log(data);
  }
  return (
    <div className="my-4">
      <h2 className="text-white text-2xl ">Section Title - $4000</h2>
      <div className="w-1/2 ml-2">
        <form>
          <Input label="401k" sendData={handleData} />
          <Input label="Brokerage" sendData={handleData} />
        </form>
      </div>
    </div>
  );
}
