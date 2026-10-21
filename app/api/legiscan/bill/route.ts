import { NextResponse, type NextRequest } from "next/server";
import { getBill, LegiScanError } from "@/lib/legiscan";

// GET /api/legiscan/bill?id=1986785
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!/^\d{1,10}$/.test(id)) {
    return NextResponse.json({ status: "ERROR", error: "Invalid bill id" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getBill(id));
  } catch (err) {
    const status = err instanceof LegiScanError ? err.status : 502;
    console.error("LegiScan getBill failed:", err);
    return NextResponse.json({ status: "ERROR", error: "Bill lookup failed" }, { status });
  }
}
