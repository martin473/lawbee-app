"use client"
import { Suspense, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Search from "@/components/ui/search";
import { DataTableDemo } from "@/components/ui/datatabledemo";
import { NavBar } from "@/components/ui/navbar-unified";
import { StateSelector } from "@/components/ui/state-selector";

interface SearchResult {
  status: string;
  searchresult?: {
    summary?: {
      count: number;
      page_total: number;
      page_current: number;
    };
    [key: string]: unknown;
  };
  error?: string;
}

import type { Bill } from "@/components/ui/datatabledemo";

export default function Home() {  
    const [allBills, setAllBills] = useState<Bill[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentSearchTerm, setCurrentSearchTerm] = useState<string>('');
    const [currentState, setCurrentState] = useState<string>('RI');
    const [fetchedPages, setFetchedPages] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Function to fetch a specific page from the API
    const fetchPage = useCallback(async (term: string, state: string, page: number) => {
        // Goes through our server route so the LegiScan key never reaches the browser.
        const pageUrl = `/api/legiscan/search?state=${encodeURIComponent(state)}&query=${encodeURIComponent(term)}${page > 1 ? `&page=${page}` : ''}`;

        const response = await fetch(pageUrl);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.status === "ERROR" || data.error) {
            throw new Error(data.error || data.message || "Search failed");
        }
        
        return data;
    }, []);
    
    // Handle new search - reset and fetch first page
    const handleSearchResult = useCallback((result: SearchResult) => {
        if (result.status === "ERROR") {
            setError(result.error || "Search failed");
            setAllBills([]);
            setTotalCount(0);
            setFetchedPages(new Set());
            return;
        }
        
        setError(null);
        const bills: Bill[] = [];
        const summary = result.searchresult?.summary;
        
        // Extract bills from first page
        if (result.searchresult) {
            Object.keys(result.searchresult).forEach(key => {
                if (key !== 'summary' && !isNaN(Number(key))) {
                    const bill = result.searchresult![key];
                    // Only add valid bills
                    if (bill && typeof bill === 'object' && 'bill_id' in bill && 'title' in bill) {
                        bills.push(bill as Bill);
                    }
                }
            });
        }
        
        // Reset everything for new search
        setAllBills(bills);
        setTotalCount(summary?.count || bills.length);
        setFetchedPages(new Set([1]));
    }, []);
    
    // Fetch additional page when needed
    const fetchAdditionalPage = useCallback(async (page: number) => {
        if (fetchedPages.has(page) || !currentSearchTerm || loading) {
            return;
        }
        
        setLoading(true);
        try {
            const pageData = await fetchPage(currentSearchTerm, currentState, page);
            const newBills: Bill[] = [];
            
            if (pageData.searchresult) {
                Object.keys(pageData.searchresult).forEach(key => {
                    if (key !== 'summary' && !isNaN(Number(key))) {
                        const bill = pageData.searchresult[key];
                        if (bill && typeof bill === 'object' && 'bill_id' in bill && 'title' in bill) {
                            newBills.push(bill as Bill);
                        }
                    }
                });
            }
            
            setAllBills(prev => [...prev, ...newBills]);
            setFetchedPages(prev => new Set([...prev, page]));
        } catch (err) {
            console.error("Error fetching page:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch page");
        } finally {
            setLoading(false);
        }
    }, [currentSearchTerm, currentState, fetchedPages, loading, fetchPage]);
    
    // Update search term and state when search happens
    const handleQueryUpdate = useCallback((result: SearchResult) => {
        handleSearchResult(result);
    }, [handleSearchResult]);
    return(
    <>
      <div className="flex flex-col">
        <NavBar />
      <div className="flex justify-center">
        <div className="flex items-center w-full max-w-sm m-8 gap-2">
        <StateSelector selectedState={currentState} onStateChange={(state) => {
            setCurrentState(state);
            setAllBills([]);
            setFetchedPages(new Set());
            setTotalCount(0);
        }} />
        <Suspense fallback={<div>Loading...</div>}>
        <Search 
            setQuery={(result: SearchResult) => {
                handleQueryUpdate(result);
            }} 
            state={currentState}
            onSearchTermChange={(term) => {
                // Only update search term, don't reset here
                // Reset will happen when actual search result comes back
                setCurrentSearchTerm(term);
            }}
        ></Search></Suspense>
        <Button variant="default">Search</Button>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col items-center w-full max-w-5xl m-8 gap-2">
        {error ? (
          <div className="text-red-500 text-center p-4 bg-red-50 rounded-md">
            Search error: {error}
          </div>
        ) : (
          <DataTableDemo 
            bills={allBills}
            totalCount={totalCount}
            onLoadMore={fetchAdditionalPage}
            fetchedPages={fetchedPages}
            loading={loading}
          ></DataTableDemo>
        )}
        </div>
      </div>
      </div>
    </>
    );
}
