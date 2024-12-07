"use client";
export default function AddButton() {
  const handleAddSection = async () => {
    console.log("test");
    try {
      const response = await fetch("/api/section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      console.log(response.json());
    } catch (error) {
      console.log("Error", error);
    }
  };
  return (
    <button className="w-11 h-11 bg-white m-4" onClick={handleAddSection}>
      +
    </button>
  );
}
