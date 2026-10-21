// Server-only LegiScan client. The API key comes from the LEGISCAN_API_KEY
// environment variable and never reaches the browser: client components call
// the /api/legiscan/* routes, which use this module.
//
// Responses are cached by Next's fetch cache and refreshed hourly, so repeated
// searches and saved-bill lookups don't spend LegiScan query quota.

const LEGISCAN_URL = "https://api.legiscan.com/";
const REVALIDATE_SECONDS = 60 * 60;

export class LegiScanError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

async function call(op: string, params: Record<string, string>) {
  const key = process.env.LEGISCAN_API_KEY;
  if (!key) throw new LegiScanError("LEGISCAN_API_KEY is not set", 500);

  const url = new URL(LEGISCAN_URL);
  url.searchParams.set("key", key);
  url.searchParams.set("op", op);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new LegiScanError(`LegiScan request failed: ${res.status}`);
  return res.json();
}

/** getSearch: bills in one state matching a query, 50 per page. */
export function searchBills(state: string, query: string, page = 1) {
  const params: Record<string, string> = { state, query };
  if (page > 1) params.page = String(page);
  return call("getSearch", params);
}

/** getBill: full detail for one bill by LegiScan bill id. */
export function getBill(id: string) {
  return call("getBill", { id });
}
