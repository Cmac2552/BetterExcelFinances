import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInsightsPageData } from "@/app/actions/insights";
import {
  getCurrentMonthKey,
  parseMonthKey,
} from "@/app/lib/insights/monthKey";
import { InsightsClient } from "./InsightsClient";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Props {
  searchParams?: Promise<{
    month?: string;
  }>;
}

export default async function InsightsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/landing");
  }

  const params = await searchParams;
  const requestedMonth = params?.month;
  const monthKey =
    requestedMonth && parseMonthKey(requestedMonth)
      ? requestedMonth
      : getCurrentMonthKey();

  const data = await getInsightsPageData(monthKey);

  return <InsightsClient key={monthKey} initialData={data} />;
}
