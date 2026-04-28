import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const Dropdown = ({ label, items, value, onChange, icon: Icon }) => {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const menuRef = useRef(null);
    const [rect, setRect] = useState(null);

    const handleToggle = () => {
        if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
        setOpen((o) => !o);
    };

    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target))
                setOpen(false);
        };
        const id = setTimeout(() => document.addEventListener("mousedown", handleClick), 0);
        return () => { clearTimeout(id); document.removeEventListener("mousedown", handleClick); };
    }, [open]);

    const menu = open && rect
        ? createPortal(
            <div ref={menuRef}
                style={{ position: "fixed", top: rect.bottom + 6, right: window.innerWidth - rect.right, zIndex: 99999, maxHeight: 260, overflowY: "auto", maxWidth: 145 }}
                className="bg-white border border-gray-100 rounded-xl shadow-2xl py-1">
                {items.map((it) => (
                    <button key={it.value}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { onChange(it.value); setOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition hover:bg-yellow-50
                            ${value === it.value ? "font-semibold text-yellow-600 bg-yellow-50/60" : "text-gray-600"}`}>
                        {it.label}
                    </button>
                ))}
            </div>,
            document.body
        ) : null;

    return (
        <>
            <button ref={btnRef} onClick={handleToggle}
                className="flex items-center gap-1.5 text-xs font-medium bg-white/80 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-white transition shadow-sm">
                <Icon size={13} />
                {label}
                <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
            {menu}
        </>
    );
}