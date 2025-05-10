import { formatDate } from "@/lib/utils"
import type { Transaction } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions = [] }: RecentTransactionsProps) {
  if (!transactions || !transactions.length) {
    return <p className="text-sm text-muted-foreground">No transactions yet</p>
  }

  return (
    <div className="space-y-8">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.type === "BUY" ? "Bought" : "Sold"} ${transaction.amount}
            </p>
            <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
          </div>
          <div className="ml-auto font-medium">
            <Badge variant={transaction.type === "BUY" ? "outline" : transaction?.gain_percent > 0 ? "success" : "destructive"}>
              {transaction.type === "BUY"
                ? `₦${transaction.total.toLocaleString()}`
                : `${transaction?.gain_percent >= 0 ? "+" : ""}₦${transaction?.gain_percent}`}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
