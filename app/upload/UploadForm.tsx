"use client";

import { useState } from "react";
import { uploadCsv } from "./actions";
import { Button } from "@/components/ui/button";

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
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Button asChild variant="primary">
        <label htmlFor="file-upload">Choose File</label>
      </Button>
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
      <Button
        type="submit"
        variant="primary"
        disabled={!fileName || isUploading}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
}
