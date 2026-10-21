"use client"
import { UserTable } from "@/components/ui/usertable";
import { useState, useEffect } from "react"; 
import GetUserBills from "@/components/functions/getUserBills";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/ui/navbar-unified";
import type { Bill } from "@/components/ui/usertable";

interface UserBillResult {
  bill: Bill;
}

export default function Home() {  
  
    const [query, setQuery] = useState<UserBillResult[] | undefined>(undefined);
    const [bills, setBills] = useState<unknown[] | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    
    useEffect(() => {
  let isMounted = true;
  setLoading(true);

  (async () => {
    try {
      const res = await GetUserBills();
      if (!isMounted) return;
      const list: UserBillResult[] = Array.isArray(res) 
        ? res.map((item: { bill: unknown }) => ({ bill: item.bill as Bill }))
        : [];
      setQuery(list);
      setBills(list.map((item: UserBillResult) => item.bill));
      setError(undefined);
    } catch (e) {
      if (!isMounted) return;
      setError("Failed to load bills");
    } finally {
      if (!isMounted) return;
      setLoading(false);
    }
  })().catch((e) => {
    // Catches any unhandled rejection from the IIFE itself
    if (!isMounted) return;
    setError("Failed to load bills");
    setLoading(false);
  });

  return () => { isMounted = false; };
}, []);


    //theres a renderinissue where things are not rendering on object update
    
    return(
    <>
      <div className="flex flex-col">
        <NavBar />
      <div className="flex justify-center">
        <div className="flex items-center w-full max-w-5xl m-8 gap-2">
          {loading ? (
            <div className="text-center p-8">Loading your bills...</div>
          ) : error ? (
            <div className="text-red-500 text-center p-8">{error}</div>
          ) : (
            <UserTable result={query}></UserTable>
          )}
        </div>
      </div>
      </div>
    </>
    );
}
//<UserTable result={bills}></UserTable>
