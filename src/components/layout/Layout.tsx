import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left sidebar */}
      <aside
        className="flex-shrink-0 border-r border-border"
        style={{ width: "var(--sidebar-width)" }}
      >
        <Sidebar />
      </aside>

      {/* Main content — fills remaining width; pages handle the sources panel internally */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
