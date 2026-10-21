"use client"
import Link from "next/link"
//import search from "./search"
//title, last_action, id, status
//var x = y; //stack overflow suggested accurate way to convert str to int in typescript
//var y: number = +x;
//result in Climate.searchresult >> id = +result.bill_id, name = result.title,  status = 'pending', email = result.last_action
import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  PaginationState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import TrackButton from './trackButton'

 



export type Bill = {
  relevance: number
  state: string
  bill_number: string
  bill_id: number
  change_hash: string
  url?: string
  text_url?: string
  research_url?: string
  last_action_date: string
  last_action: string
  title: string
}

export const columns: ColumnDef<Bill>[] = [
  {
    accessorKey: "track",
    header: "track",
    cell: ({ row }) => (
      <div>
        {/*adding key forces rerender*/}
        <TrackButton key={row.getValue("bill_id")} id={row.getValue("bill_id")} /> 
      </div>
    ),
  },
  {
    accessorKey: "bill_number",
    header: "Bill Number",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("bill_number")}
      </div>
    ),
  },
  {
    accessorKey: "bill_id",
    header: "Bill ID",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("bill_id")}
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title" /*({ column }) => {
      return (
        //asc/desc sort button in header
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown />
        </Button>
      )
    }*/,
    cell: ({ row }) => 
      <div className="lowercase">
        {row.getValue("title")}
      </div>,
  },
  {
    accessorKey: "url",
    header: () => <div className="text-center">Link</div>,
    cell: ({ row }) => {
      const url = row.getValue("url");
      
      //Link to bill button - only show if URL exists and is a valid string
      if (!url || typeof url !== 'string' || url.trim() === '') {
        return <div className="text-right font-medium text-gray-400">No link</div>
      }
      
      return <div className="text-right font-medium">
        <Button variant="outline">
          <Link href={url}>Read Bill</Link>
        </Button>
      </div>
    },
  },
  /*{
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },*/
  
]

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
  bills?: Bill[];
  error?: string;
}

interface DataTableDemoProps {
  bills?: Bill[];
  totalCount?: number;
  onLoadMore?: (page: number) => void;
  fetchedPages?: Set<number>;
  loading?: boolean;
  result?: SearchResult; // Legacy support
}

export function DataTableDemo({ bills, totalCount, onLoadMore, fetchedPages, loading, result }: DataTableDemoProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 50 })
    const prevBillsLengthRef = React.useRef(0)
    const preservedPageIndexRef = React.useRef<number | null>(null)
    const isNavigatingRef = React.useRef(false)
    
    // Process bills - support both new props format and legacy result format
    const data: Bill[] = React.useMemo(() => {
      const billData: Bill[] = []
      
      // New format: bills array passed directly
      if (bills && Array.isArray(bills)) {
        for (const bill of bills) {
          if (bill && typeof bill === 'object' && bill.bill_id && bill.title) {
            billData.push(bill)
          }
        }
        return billData
      }
      
      // Legacy format: extract from result object
      if (result && typeof result === 'object') {
        if (result.status === "ERROR") {
          return billData;
        }
        
        let billsArray: unknown[] = []
        if (result.searchresult && typeof result.searchresult === 'object') {
          billsArray = Object.values(result.searchresult)
        } else if (Array.isArray(result.bills)) {
          billsArray = result.bills
        }
        
        for (const bill of billsArray) {
          if (bill && typeof bill === 'object' && 'bill_id' in bill && 'title' in bill) {
            billData.push(bill as Bill)
          }
        }
      }
      
      return billData
    }, [bills, result])
    
    // Track previous bills to detect new searches vs new pages
    const prevBillsRef = React.useRef(bills)
    const firstBillIdRef = React.useRef<number | null>(null)
    
    // Preserve pagination when new bills are added (don't reset to page 1)
    // SIMPLIFIED: Only reset on new searches, never reset when bills are added
    React.useEffect(() => {
      if (!bills || bills.length === 0) {
        if (bills?.length === 0) {
          // Empty array - reset pagination
          setPagination({ pageIndex: 0, pageSize: 50 })
          prevBillsRef.current = bills
          prevBillsLengthRef.current = 0
          firstBillIdRef.current = null
          preservedPageIndexRef.current = null
          isNavigatingRef.current = false
        }
        return;
      }
      
      // Track first bill ID to detect new searches
      const currentFirstBillId = bills[0]?.bill_id
      
      // CRITICAL: If we have a preserved index OR are navigating, NEVER reset pagination
      // This protects pagination when new API pages are fetched
      if (isNavigatingRef.current || preservedPageIndexRef.current !== null) {
        // Just update refs, don't touch pagination at all
        prevBillsLengthRef.current = bills.length
        prevBillsRef.current = bills
        if (firstBillIdRef.current === null && currentFirstBillId !== null) {
          firstBillIdRef.current = currentFirstBillId
        }
        return
      }
      
      // Only check for new search if we don't have navigation flags set
      const isNewSearch = firstBillIdRef.current !== null && 
        currentFirstBillId !== null &&
        currentFirstBillId !== firstBillIdRef.current
      
      if (isNewSearch) {
        // New search - reset pagination
        setPagination({ pageIndex: 0, pageSize: 20 })
        preservedPageIndexRef.current = null
        isNavigatingRef.current = false
        prevBillsRef.current = bills
        prevBillsLengthRef.current = bills.length
        firstBillIdRef.current = currentFirstBillId
      } else {
        // Bills added or same - NEVER reset pagination, just update refs
        prevBillsLengthRef.current = bills.length
        prevBillsRef.current = bills
        if (firstBillIdRef.current === null && currentFirstBillId !== null) {
          firstBillIdRef.current = currentFirstBillId
        }
      }
    }, [bills])
    
    // Calculate which API page we need based on current pagination
    const currentPageIndex = pagination.pageIndex
    const pageSize = pagination.pageSize
    const billsNeeded = (currentPageIndex + 1) * pageSize
    const apiPageNeeded = Math.ceil(billsNeeded / 50) // API returns 50 per page
    
    // Fetch more data if needed when user navigates to a page that requires more data
    React.useEffect(() => {
      if (onLoadMore && fetchedPages && billsNeeded > data.length && !loading && data.length > 0) {
        // CRITICAL: Always ensure navigation flags are set when we need more data
        // This protects pagination when new API pages are fetched
        if (preservedPageIndexRef.current === null || preservedPageIndexRef.current !== currentPageIndex) {
          isNavigatingRef.current = true
          preservedPageIndexRef.current = currentPageIndex
        }
        
        // Check if we need to fetch the next API page
        for (let page = 1; page <= apiPageNeeded; page++) {
          if (!fetchedPages.has(page)) {
            onLoadMore(page)
            break
          }
        }
      }
    }, [pagination.pageIndex, data.length, onLoadMore, fetchedPages, loading, billsNeeded, apiPageNeeded, currentPageIndex])
    
    // When new data arrives and we have enough for the target page, ensure pagination is set
    // Note: onPaginationChange will handle any resets synchronously, but this ensures
    // pagination is on target when data first becomes available
    React.useEffect(() => {
      if (!loading && preservedPageIndexRef.current !== null && data.length > 0) {
        const targetPageIndex = preservedPageIndexRef.current
        const billsNeededForTargetPage = (targetPageIndex + 1) * pageSize
        
        // If we now have enough data for the target page, ensure pagination is on target
        if (data.length >= billsNeededForTargetPage && pagination.pageIndex !== targetPageIndex) {
          // Set pagination to target - onPaginationChange will allow this since it matches target
          setPagination(prev => ({ ...prev, pageIndex: targetPageIndex }))
        }
      }
    }, [data.length, loading, pageSize])
    
    // Secondary protection: Clear navigation state after pagination is stable
    // The primary guard is onPaginationChange which handles resets synchronously
    // This effect just cleans up the navigation state after everything is stable
    const stablePageCountRef = React.useRef(0)
    React.useEffect(() => {
      if (preservedPageIndexRef.current !== null) {
        const targetIndex = preservedPageIndexRef.current
        
        // If pagination is on target and data is loaded, increment stability counter
        if (pagination.pageIndex === targetIndex && !loading && data.length > 0) {
          const billsNeededForTarget = (targetIndex + 1) * pageSize
          
          // Only count as stable if we have enough data
          if (data.length >= billsNeededForTarget) {
            stablePageCountRef.current += 1
            
            // Clear navigation state after pagination has been stable for several renders
            // This ensures the table has fully settled before we remove protection
            if (stablePageCountRef.current >= 5) {
              isNavigatingRef.current = false
              preservedPageIndexRef.current = null
              stablePageCountRef.current = 0
            }
          } else {
            // Not enough data yet - reset counter
            stablePageCountRef.current = 0
          }
        } else {
          // Pagination not on target or still loading - reset counter
          // Note: onPaginationChange should have already restored it, but reset counter just in case
          stablePageCountRef.current = 0
        }
      } else {
        // No preserved index - reset counter
        stablePageCountRef.current = 0
      }
    }, [pagination.pageIndex, loading, data.length, pageSize])
  
    const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: false, // Client-side pagination
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onPaginationChange: (updater: PaginationState | ((prev: PaginationState) => PaginationState)) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater
      const newPageIndex = newPagination.pageIndex
      const currentPageIndex = pagination.pageIndex
      
      // PRIMARY GUARD: If we have a preserved target index, protect against resets
      if (preservedPageIndexRef.current !== null) {
        const targetIndex = preservedPageIndexRef.current
        
        // Allow going backward (user-initiated navigation to lower pages)
        if (newPageIndex < currentPageIndex && newPageIndex >= 0) {
          // User is going backward - clear navigation state and allow it
          isNavigatingRef.current = false
          preservedPageIndexRef.current = null
          setPagination(newPagination)
          return
        }
        
        // Allow if it matches our preserved index exactly (restoring to target)
        if (newPageIndex === targetIndex) {
          setPagination(newPagination)
          return
        }
        
        // CRITICAL: Only block suspicious resets to page 0 when we're on a higher page
        // Don't block other legitimate changes (like moving forward within available data)
        if (newPageIndex === 0 && currentPageIndex > 0 && targetIndex > 0) {
          // Table tried to reset to page 0 - immediately restore to target synchronously
          setPagination(prev => ({ ...prev, pageIndex: targetIndex }))
          return
        }
        
        // If trying to go forward beyond target but we don't have data yet, block it
        // Otherwise, if we have data for the new page, allow it (user might be navigating)
        if (newPageIndex > targetIndex) {
          const billsNeededForNewPage = (newPageIndex + 1) * pageSize
          if (data.length < billsNeededForNewPage) {
            // Don't have data yet - restore to target
            setPagination(prev => ({ ...prev, pageIndex: targetIndex }))
            return
          }
          // Have data - allow it and update target
          preservedPageIndexRef.current = newPageIndex
          setPagination(newPagination)
          return
        }
        
        // Allow other changes that are within valid range
        if (newPageIndex >= 0 && newPageIndex < targetIndex) {
          setPagination(newPagination)
          return
        }
      }
      
      // Normal case - no preserved target, allow all pagination changes
      setPagination(updater)
    },
  })
  
  // Remove the mismatch warning - it's expected with pagination

  return (
    <div className="w-full">
      {/*
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter titles..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          {totalCount !== undefined ? (
            <>Showing {Math.min((pagination.pageIndex * pagination.pageSize) + 1, data.length)} - {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} of {totalCount} results</>
          ) : (
            <>Showing {table.getRowModel().rows.length} result{table.getRowModel().rows.length !== 1 ? 's' : ''}</>
          )}
          {loading && <span className="ml-2 text-blue-500">(Loading more...)</span>}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!loading) {
                table.previousPage()
              }
            }}
            disabled={!table.getCanPreviousPage() || loading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (loading || isNavigatingRef.current) return;
              
              const nextPageIndex = pagination.pageIndex + 1
              const billsNeededForNextPage = (nextPageIndex + 1) * pagination.pageSize
              
              // Check if we have enough data for the next page
              // We need at least (nextPageIndex + 1) * pageSize items, OR we've reached totalCount
              const hasEnoughData = data.length >= billsNeededForNextPage || 
                                   (totalCount !== undefined && data.length >= totalCount)
              
              // If we have enough data (even if it's a partial last page), advance immediately
              if (hasEnoughData) {
                isNavigatingRef.current = false
                preservedPageIndexRef.current = null
                // Use table.nextPage() when we have data - safe
                table.nextPage()
              } else if (onLoadMore && fetchedPages && 
                  (totalCount === undefined || data.length < totalCount)) {
                // Mark that we're navigating and preserve the target page
                isNavigatingRef.current = true
                preservedPageIndexRef.current = nextPageIndex
                
                // Set pagination directly instead of using table.nextPage()
                // This prevents the table from validating and potentially resetting
                setPagination(prev => ({ ...prev, pageIndex: nextPageIndex }))
                
                // The useEffect will detect the change and fetch data
              }
            }}
            disabled={loading || (totalCount !== undefined && (pagination.pageIndex + 1) * pagination.pageSize >= totalCount) || (totalCount === undefined && !table.getCanNextPage())}
          >
            {loading ? "Loading..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}
