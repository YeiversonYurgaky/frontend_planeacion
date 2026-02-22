import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left sidebar — animates between full and mini width */}
      <aside
        className="flex-shrink-0 border-r border-border overflow-hidden transition-[width] duration-300 ease-in-out"
        style={{ width: collapsed ? "56px" : "var(--sidebar-width)" }}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
