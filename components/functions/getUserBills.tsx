import { SelectBills } from "@/app/auth/api/supabaseRestCalls";
//if bill dne in legiscan it returns a CORS error
export default async function GetUserBills () {
  // Runs in the browser (called from the client-side My Bills page), so it goes
  // through our server route; the LegiScan key stays on the server.
  async function getBill(query: string){
      const data = await fetch("/api/legiscan/bill?id=" + encodeURIComponent(query))
      return data.json()
  };

  async function getUBillData(){
    interface BillResult {
      bill: unknown;
    }
    const bills: BillResult[] = []
    const userBills = await SelectBills()
    
    // Properly await all bill fetches in parallel for better performance
    if (Array.isArray(userBills) && userBills.length > 0) {
      const billPromises = userBills.map((billId: string | number) => getBill(String(billId)))
      const billResults = await Promise.all(billPromises)
      
      for (const res of billResults) {
        if (res && res.bill) {
          bills.push({ bill: res.bill })
        }
      }
    }
    
    return bills
  };

  const data = await getUBillData()
  return data;
}
