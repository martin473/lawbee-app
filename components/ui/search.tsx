'use client';
import { useDebouncedCallback } from 'use-debounce';
import { useSearchParams } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input"

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
  bills?: unknown[];
  error?: string;
}

export default function Search(props: { setQuery: (value: SearchResult) => void; state?: string; onSearchTermChange?: (term: string) => void }) { //https://bobbyhadz.com/blog/react-typeerror-is-not-a-function
    const searchParams = useSearchParams();
    const setQueryRef = useRef(props.setQuery);
    const onSearchTermChangeRef = useRef(props.onSearchTermChange);
    
    // Keep refs up to date
    setQueryRef.current = props.setQuery;
    onSearchTermChangeRef.current = props.onSearchTermChange;
    
    // Memoize searchBills to prevent recreation on every render
    // Only fetches the first page - pagination handled separately
    const searchBills = useCallback(async (term: string, state: string = 'RI', page: number = 1) => {
        try {
            // Goes through our server route so the LegiScan key never reaches the browser.
            const pageUrl = `/api/legiscan/search?state=${encodeURIComponent(state)}&query=${encodeURIComponent(term)}${page > 1 ? `&page=${page}` : ''}`;
            const response = await fetch(pageUrl);
            
            // Check if the response is ok
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Check if the API returned an error status
            if (data.status === "ERROR" || data.error) {
                return { 
                    status: "ERROR", 
                    error: data.error || data.message || "Search failed",
                    searchresult: {}
                };
            }
            
            return data;
        } catch (error) {
            console.error("Search API error:", error);
            throw error; // Re-throw to be caught by handleSearch
        }
    }, [props.state]);
    
    //put results into here - use ref to avoid dependency on props.setQuery
    const handleSearch = useDebouncedCallback(async (term) => {
        // Notify parent of search term change
        if (onSearchTermChangeRef.current) {
            onSearchTermChangeRef.current(term);
        }
        
        // Pass the search term and state directly to searchBills (only first page)
        if (term) {
            try {
              const searchResult = await searchBills(term, props.state || 'RI', 1);
              setQueryRef.current(searchResult);
            } catch (error) {
              console.error("Search error:", error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              setQueryRef.current({ status: "ERROR", error: errorMessage });
            }
        } else {
            // If term is empty, set empty result
            setQueryRef.current({ status: "OK", bills: [] });
            if (onSearchTermChangeRef.current) {
                onSearchTermChangeRef.current('');
            }
        }
      }, 500);


 
  return (
    <div className="relative w-80">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-500 left-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <Input 
        type="text"
        placeholder="Search"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
        className="pl-12 pr-4" 
      />
    </div>
  );
}
