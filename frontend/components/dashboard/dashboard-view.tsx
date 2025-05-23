"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { TransactionForm } from "@/components/dashboard/transaction-form"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { fetchTransactions, userMetrics, profitSummary } from "@/lib/api"

export default function DashboardView() {
  const [activeTab, setActiveTab] = useState("overview")

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  })

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["metrics"],
    queryFn: userMetrics,
  })

  const { data: profitOverTime, isLoading: profitLoading } = useQuery({
    queryKey: ["profitOvertime"],
    queryFn: profitSummary,
  })

  const safeTransactions = Array.isArray(transactions) ? transactions : []

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Forex Investment Tracker"
        text="Track your foreign currency investments and calculate profits/losses"
      />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="add">Add Transaction</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total USD Bought</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">N{metrics?.total_buy_transaction_amount?.toFixed(2) || "0.00"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total USD Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.total_sell_transaction_amount?.toFixed(2) || "0.00"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Number of USD Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.total_sell_count}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Number of USD Bought</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.total_buy_count}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Gain/Loss</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${(metrics?.netGain || 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  ₦{metrics?.netGain?.toLocaleString() || "0"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics?.remaining_balance?.toFixed(2) || "0.00"}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Profit Over Time</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview data={profitOverTime || []} />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your most recent currency transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions transactions={safeTransactions.slice(0, 5)} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>A complete history of your buy and sell transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable transactions={safeTransactions} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Transaction</CardTitle>
              <CardDescription>Record a new buy or sell transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionForm onSuccess={() => setActiveTab("transactions")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
