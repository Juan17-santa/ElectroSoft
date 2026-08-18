import { useState } from "react";
import { Navbar } from "./components/navbar"
import { Sidebar } from "./components/sidebar"
import { Outlet } from "react-router-dom"

export default function Layout() {

    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="h-screen flex flex-col overflow-hidden">

            {/* Navbar arriba */}
            <Navbar setIsOpen={setIsOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Sidebar + Contenido */}
            <div className="flex flex-1 overflow-hidden">

                <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} isCollapsed={isCollapsed} />

                <div className="flex-1 p-3 overflow-auto flex flex-col">
                    <Outlet />
                </div>

            </div>

        </div>
    )
}