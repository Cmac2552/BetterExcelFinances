"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadCsv } from "./actions";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, CheckCircle2, AlertCircle, Info } from "lucide-react";

type Props = Readonly<{
  statementMonth: string;
  children?: React.ReactNode;
}>;

interface UploadFeedback {
  type: "success" | "error" | "info";
  message: string;
  details?: Record<string, string>;
}

export function UploadForm({ statementMonth, children }: Props) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<UploadFeedback | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFeedback(null);
    } else {
      setFileName("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);
    setFeedback(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("statementMonth", statementMonth);

    try {
      const res = await uploadCsv(formData);

      if (res.success) {
        let msg = "";
        let feedbackType: "success" | "info" = "success";

        const count = res.count ?? 0;
        if (count === 0) {
          feedbackType = "info";
          msg = `0 transactions imported: All ${res.totalParsed ?? 0} transactions in this CSV already exist in your database from a previous upload.`;
        } else {
          msg = `Successfully imported ${count} transactions into ${statementMonth}.`;
          if (res.newlyCategorized && res.newlyCategorized > 0) {
            msg += ` Auto-categorized ${res.newlyCategorized} with Jev AI.`;
          }
        }

        setFeedback({
          type: feedbackType,
          message: msg,
          details: count > 0 ? res.mappingsApplied : undefined,
        });
        setFileName("");
        form.reset();
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to process statement CSV.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "An unexpected error occurred during upload.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {children}

        <form onSubmit={handleSubmit} className="flex items-center gap-3 flex-wrap ml-auto">
          <Button asChild variant="secondary" className="cursor-pointer">
            <label htmlFor="file-upload" className="flex items-center gap-2 cursor-pointer">
              <UploadCloud className="w-4 h-4 text-[#f4f0e1]" />
              <span>Choose CSV</span>
            </label>
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

          {fileName && (
            <span className="text-sm font-medium text-gray-300 max-w-[200px] truncate" title={fileName}>
              {fileName}
            </span>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={!fileName || isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Categorizing & Uploading...</span>
              </>
            ) : (
              <span>Upload</span>
            )}
          </Button>
        </form>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-2.5 p-3 rounded-lg text-xs font-medium border ${
            feedback.type === "success"
              ? "bg-[#00A896]/10 text-[#00A896] border-[#00A896]/30"
              : feedback.type === "info"
              ? "bg-amber-950/20 text-amber-300 border-amber-900/40"
              : "bg-red-950/30 text-red-300 border-red-900/50"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : feedback.type === "info" ? (
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-semibold">{feedback.message}</div>
            {feedback.details && Object.keys(feedback.details).length > 0 && (
              <div className="mt-1 text-[11px] text-gray-300 leading-relaxed font-normal">
                <span className="font-medium text-gray-400">Mapped:</span>{" "}
                {Object.entries(feedback.details)
                  .map(([from, to]) => `"${from}" → "${to}"`)
                  .join(", ")}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-white ml-2 text-sm leading-none"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
