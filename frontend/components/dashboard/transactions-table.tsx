"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Transaction, MatchedBuy } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface TransactionsTableProps {
  transactions: Transaction[]
  isLoading?: boolean
}

export function TransactionsTable({ transactions = [], isLoading = false }: TransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return <Badge variant={type === "BUY" ? "outline" : "secondary"}>{type}</Badge>
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            USD Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("amount"))
        return `$${amount.toFixed(2)}`
      },
    },
    {
      accessorKey: "rate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Rate
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const rate = Number.parseFloat(row.getValue("rate"))
        return `₦${rate.toLocaleString()}`
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Total ₦
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const total = Number.parseFloat(row.getValue("total"))
        return `₦${total.toLocaleString()}`
      },
    },
    {
      accessorKey: "gain",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Gain ₦
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        if (type === "BUY") return "-"

        const gain = Number.parseFloat(row.getValue("gain"))
        return (
          <span className={gain >= 0 ? "text-green-500" : "text-red-500"}>
            {gain >= 0 ? "+" : ""}₦{gain.toLocaleString()}
          </span>
        )
      },
    },
    {
      accessorKey: "gainPercentage",
      header: "Gain %",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        if (type === "BUY") return "-"

        const gainPercentage = Number.parseFloat(row.getValue("gainPercentage"))
        return (
          <span className={gainPercentage >= 0 ? "text-green-500" : "text-red-500"}>
            {gainPercentage >= 0 ? "+" : ""}
            {gainPercentage.toFixed(2)}%
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original
        const isExpanded = expandedRows[transaction.id] || false

        if (transaction.type === "BUY" || !transaction.matchedBuys?.length) {
          return null
        }

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setExpandedRows({
                ...expandedRows,
                [transaction.id]: !isExpanded,
              })
            }}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )
      },
    },
  ]

  const table = useReactTable({
    data: transactions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  if (isLoading) {
    return <div className="text-center py-4">Loading transactions...</div>
  }

  if (!transactions.length) {
    return <div className="text-center py-4">No transactions recorded yet.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter transactions..."
          value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("type")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const transaction = row.original
                const isExpanded = expandedRows[transaction.id] || false

                return (
                  <>
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={
                        transaction.type === "SELL" ? (transaction.gain >= 0 ? "bg-green-50" : "bg-red-50") : ""
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>

                    {transaction.type === "SELL" && isExpanded && transaction.matchedBuys && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={columns.length}>
                          <div className="p-2">
                            <h4 className="font-medium mb-2">Matched Buy Transactions</h4>
                            <div className="space-y-2">
                              {transaction.matchedBuys.map((matchedBuy: MatchedBuy, index: number) => (
                                <div key={index} className="grid grid-cols-5 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Date: </span>
                                    {formatDate(matchedBuy.date)}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Amount: </span>$
                                    {matchedBuy.amount.toFixed(2)}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Buy Rate: </span>₦
                                    {matchedBuy.rate.toLocaleString()}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Profit: </span>
                                    <span className={matchedBuy.profit >= 0 ? "text-green-500" : "text-red-500"}>
                                      {matchedBuy.profit >= 0 ? "+" : ""}₦{matchedBuy.profit.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {transactions.length} transaction(s)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
