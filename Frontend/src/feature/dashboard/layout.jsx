import { Navbar } from "./components/navbar"
import { Sidebar } from "./components/sidebar"
import { Outlet } from "react-router-dom"

export default function Layout() {
    return (
        <div className="h-screen flex flex-col overflow-hidden">

            {/* Navbar arriba */}
            <Navbar />

            {/* Sidebar + Contenido */}
            <div className="flex flex-1 overflow-hidden">

                <Sidebar />

                <div className="flex-1 p-3 overflow-auto flex flex-col">
                    <Outlet />
                </div>

            </div>

        </div>
    )
}