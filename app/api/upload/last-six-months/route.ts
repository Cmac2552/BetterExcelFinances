import { NextResponse } from "next/server";
import { getLastSixMonths } from "@/app/upload/actions";
import { auth } from "@/auth";

function getStatementDateRangeUTC(month: number, year: number) {
  // statement ranges from 26 of previous month to 25 of current month
  const startDate = new Date(Date.UTC(year, month - 2, 26, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month - 1, 25, 23, 59, 59, 999));
  return { startDate, endDate };
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const monthParam = url.searchParams.get("month");
    const yearParam = url.searchParams.get("year");

    const today = new Date();
  const currentMonth = monthParam ? Number.parseInt(monthParam, 10) : today.getUTCMonth() + 1;
  const currentYear = yearParam ? Number.parseInt(yearParam, 10) : today.getUTCFullYear();

    const results = await getLastSixMonths(currentMonth, currentYear);
    return NextResponse.json({ months: results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
