"use client";

import { useState } from "react";
import { uploadCsv } from "./actions";

export function UploadForm() {
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);
    const formData = new FormData(event.currentTarget);
    await uploadCsv(formData);
    setFileName("");
    setIsUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4">
      <label
        htmlFor="file-upload"
        className="bg-[#f4f0e1] text-black px-4 py-2 rounded-lg font-medium border border-transparent hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 cursor-pointer"
      >
        Choose File
      </label>
      <input
        id="file-upload"
        name="file"
        type="file"
        accept=".csv"
        required
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {fileName && <span className="text-white">{fileName}</span>}
      <button
        type="submit"
        className="bg-[#f4f0e1] text-black px-4 py-2 rounded-lg font-medium border border-transparent hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 disabled:opacity-50"
        disabled={!fileName || isUploading}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
