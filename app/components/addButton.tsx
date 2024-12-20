"use client";
export default function AddButton() {
  const handleAddSection = async () => {
    try {
      fetch("/api/section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
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
