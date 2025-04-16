import type { Metadata } from "next"
import DashboardView from "@/components/dashboard/dashboard-view"

export const metadata: Metadata = {
  title: "Forex Investment Tracker",
  description: "Track your foreign currency investments and calculate profits/losses",
}

export default function DashboardPage() {
  return <DashboardView />
}
