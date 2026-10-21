import { NextResponse, type NextRequest } from "next/server";
import { searchBills, LegiScanError } from "@/lib/legiscan";
import { LEGISCAN_STATES } from "@/lib/legiscan-states";

const STATE_CODES = new Set(LEGISCAN_STATES.map((s) => s.code));

// GET /api/legiscan/search?state=RI&query=prison&page=1
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const state = (params.get("state") ?? "RI").toUpperCase();
  const query = (params.get("query") ?? "").trim();
  const page = Number(params.get("page") ?? "1");

  if (!STATE_CODES.has(state)) {
    return NextResponse.json({ status: "ERROR", error: "Unknown state" }, { status: 400 });
  }
  if (!query || query.length > 200) {
    return NextResponse.json({ status: "ERROR", error: "Query must be 1-200 characters" }, { status: 400 });
  }
  if (!Number.isInteger(page) || page < 1 || page > 1000) {
    return NextResponse.json({ status: "ERROR", error: "Invalid page" }, { status: 400 });
  }

  try {
    return NextResponse.json(await searchBills(state, query, page));
  } catch (err) {
    const status = err instanceof LegiScanError ? err.status : 502;
    console.error("LegiScan search failed:", err);
    return NextResponse.json({ status: "ERROR", error: "Search failed" }, { status });
  }
}
