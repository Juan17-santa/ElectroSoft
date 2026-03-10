import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
    DollarSign, Package, ShoppingBag, TrendingUp,
    Calendar, ChevronDown, ArrowUpRight, ArrowDownRight,
    RotateCcw, Users, AlertCircle, FileText,
} from "lucide-react";
import ConfirmModal from "../../components/ui/ConfirmModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MESES      = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MESES_FULL = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const formatCOP  = (n) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString("es-CO")}`;
};
const formatFull = (n) => "$" + Number(n).toLocaleString("es-CO");
const parseMoney = (v) => {
    if (!v) return 0;
    if (typeof v === "number") return v;
    return Number(String(v).replace(/\$|\./g, "").replace(",", ".")) || 0;
};
const toDate = (f) => {
    if (!f) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(f)) return new Date(f);
    if (/^\d{2}\/\d{2}\/\d{4}/.test(f)) {
        const [d, m, y] = f.split("/");
        return new Date(`${y}-${m}-${d}`);
    }
    return new Date(f);
};

const now          = new Date();
const currentYear  = now.getFullYear();
const currentMonth = now.getMonth();

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target, ms = 900) {
    const [val, setVal] = useState(0);
    const raf = useRef(null);
    useEffect(() => {
        const t0 = performance.now();
        const step = (t) => {
            const p = Math.min((t - t0) / ms, 1);
            setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf.current = requestAnimationFrame(step);
        };
        raf.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf.current);
    }, [target, ms]);
    return val;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, delta, color, isMoney = true, delay = 0 }) {
    const animated  = useCountUp(value);
    const positive  = delta >= 0;
    const displayed = isMoney ? formatFull(animated) : animated.toLocaleString("es-CO");
    return (
        <div
            className="bg-white/85 backdrop-blur-sm rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden shadow-sm"
            style={{ animation: "kpiFadeUp .5s ease both", animationDelay: `${delay}ms` }}
        >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                style={{ background: `linear-gradient(to bottom, ${color} 0%, ${color}99 40%, ${color}33 75%, transparent 100%)` }} />
            <div className="flex items-start justify-between pl-2">
                <div>
                    <p className="text-[11px] text-gray-400 font-semibold tracking-widest uppercase">{label}</p>
                    <p className="text-[1.55rem] font-bold text-gray-900 mt-1 tabular-nums leading-none">{displayed}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: color + "1a" }}>
                    <Icon size={20} style={{ color }} strokeWidth={2} />
                </div>
            </div>
            <div className="flex items-center gap-2 pl-2">
                <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full
                    ${positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                    {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {Math.abs(delta).toFixed(1)}%
                </span>
                <span className="text-[11px] text-gray-400">vs mes anterior</span>
            </div>
        </div>
    );
}

// ─── Chart card wrapper ────────────────────────────────────────────────────────
function Card({ title, subtitle, children, delay = 0, className = "", action }) {
    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col ${className}`}
            style={{ animation: "kpiFadeUp .6s ease both", animationDelay: `${delay}ms` }}>
            <div className="mb-4 flex-shrink-0 flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-800">{title}</p>
                    {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const Tip = ({ active, payload, label, isMoney = true }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-gray-800">
            <p className="font-semibold mb-1 text-gray-300">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || "#FFC107" }}>
                    {p.name}: {isMoney ? formatFull(p.value) : p.value}
                </p>
            ))}
        </div>
    );
};

// ─── Empty ────────────────────────────────────────────────────────────────────
const Empty = ({ msg }) => (
    <div className="flex flex-col items-center justify-center flex-1 gap-2 text-gray-300 min-h-[120px]">
        <AlertCircle size={26} />
        <p className="text-xs text-gray-400">{msg}</p>
    </div>
);

// ─── Dropdown con Portal ──────────────────────────────────────────────────────
function Dropdown({ label, items, value, onChange, icon: Icon }) {
    const [open, setOpen] = useState(false);
    const btnRef          = useRef(null);
    const menuRef         = useRef(null);
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
                style={{ position:"fixed", top: rect.bottom+6, right: window.innerWidth-rect.right, zIndex:99999, maxHeight:260, overflowY:"auto", minWidth:145 }}
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

const DONUT_COLORS = ["#FFC107","#1f2937","#F59E0B","#6b7280","#D97706","#374151","#FBBF24","#4B5563"];

// ══════════════════════════════════════════════════════════════════════════════
// GENERADOR DE PDF — Reporte ejecutivo del Dashboard
// Secciones:
//  1. Portada con cabecera corporativa y resumen de KPIs
//  2. Ventas mensuales del año completo
//  3. Compras mensuales del año completo
//  4. Top 5 productos más vendidos del mes
//  5. Ventas por categoría del mes
//  6. Indicadores operacionales (clientes, devoluciones, stock)
//  7. Pie de página con número de página en cada hoja
// ══════════════════════════════════════════════════════════════════════════════
function generarReportePDF({ year, month, kpis, serieVentas, serieCompras, topProductos, donut, stats }) {
    const doc        = new jsPDF();
    const AMARILLO   = [234, 179, 8];
    const OSCURO     = [31,  41,  55];
    const GRIS_CLARO = [249, 250, 251];
    const mesNombre  = MESES_FULL[month];
    const hoy        = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
    let y = 0;

    // ── CABECERA ─────────────────────────────────────────────────────────────
    doc.setFillColor(...AMARILLO);
    doc.rect(0, 0, 210, 30, "F");

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("ElectroSoft", 14, 13);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("Sistema de Gestión Empresarial", 14, 20);
    doc.text("Reporte Confidencial — Uso Interno", 14, 26);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE EJECUTIVO", 196, 11, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Período: ${mesNombre} ${year}`, 196, 18, { align: "right" });
    doc.text(`Generado: ${hoy}`, 196, 24, { align: "right" });

    y = 38;

    // ── SECCIÓN 1: Resumen financiero del mes ─────────────────────────────────
    doc.setTextColor(...OSCURO);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`1. Resumen Financiero — ${mesNombre} ${year}`, 14, y);
    doc.setDrawColor(...AMARILLO);
    doc.setLineWidth(0.7);
    doc.line(14, y + 2, 196, y + 2);
    y += 8;

    const kpiBoxes = [
        { label: "Monto de Ventas",    value: formatFull(kpis.ventas),               delta: kpis.deltaVentas   },
        { label: "Productos Vendidos", value: Number(kpis.prodVend).toLocaleString(), delta: kpis.deltaProd     },
        { label: "Monto de Compras",   value: formatFull(kpis.compras),              delta: kpis.deltaCompras  },
        { label: "Ganancia Neta",      value: formatFull(Math.max(0, kpis.ganancia)),delta: kpis.deltaGanancia },
    ];

    const BOX_W = 43.5, BOX_H = 22, BOX_GAP = 2;
    kpiBoxes.forEach((k, i) => {
        const x = 14 + i * (BOX_W + BOX_GAP);
        // Fondo
        doc.setFillColor(...GRIS_CLARO);
        doc.roundedRect(x, y, BOX_W, BOX_H, 2, 2, "F");
        // Franja izquierda amarilla
        doc.setFillColor(...AMARILLO);
        doc.rect(x, y, 2, BOX_H, "F");
        // Label
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(k.label.toUpperCase(), x + 5, y + 6.5);
        // Valor
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...OSCURO);
        doc.text(k.value, x + 5, y + 13.5);
        // Delta
        const pos = k.delta >= 0;
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...(pos ? [16, 185, 129] : [239, 68, 68]));
        doc.text(`${pos ? "▲" : "▼"} ${Math.abs(k.delta).toFixed(1)}% vs mes anterior`, x + 5, y + 19.5);
    });
    y += BOX_H + 12;

    // ── SECCIÓN 2: Ventas mensuales año completo ──────────────────────────────
    doc.setTextColor(...OSCURO);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`2. Ventas Mensuales — Año ${year}`, 14, y);
    doc.setDrawColor(...AMARILLO);
    doc.line(14, y + 2, 196, y + 2);
    y += 6;

    const totalVentasAnio = serieVentas.reduce((a, d) => a + d.total, 0);
    autoTable(doc, {
        startY: y,
        head: [["Mes", "Total Ventas", "Mes", "Total Ventas", "Mes", "Total Ventas"]],
        body: [0, 1, 2, 3].map((r) => [
            MESES_FULL[r],     formatFull(serieVentas[r].total),
            MESES_FULL[r + 4], formatFull(serieVentas[r + 4].total),
            MESES_FULL[r + 8], formatFull(serieVentas[r + 8].total),
        ]),
        foot: [["Total anual", { content: formatFull(totalVentasAnio), colSpan: 5, styles: { fontStyle: "bold", halign: "left" } }]],
        styles:          { fontSize: 8, cellPadding: 2.5 },
        headStyles:      { fillColor: AMARILLO, textColor: [0, 0, 0], fontStyle: "bold" },
        footStyles:      { fillColor: GRIS_CLARO, textColor: OSCURO, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        columnStyles:    { 0: { fontStyle: "bold", cellWidth: 26 }, 1: { cellWidth: 38 }, 2: { fontStyle: "bold", cellWidth: 26 }, 3: { cellWidth: 38 }, 4: { fontStyle: "bold", cellWidth: 26 }, 5: { cellWidth: 28 } },
        margin:          { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 10;

    // ── SECCIÓN 3: Compras mensuales año completo ─────────────────────────────
    if (y > 200) { doc.addPage(); y = 20; }
    doc.setTextColor(...OSCURO);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`3. Compras Mensuales — Año ${year}`, 14, y);
    doc.setDrawColor(...AMARILLO);
    doc.line(14, y + 2, 196, y + 2);
    y += 6;

    const totalComprasAnio = serieCompras.reduce((a, d) => a + d.total, 0);
    autoTable(doc, {
        startY: y,
        head: [["Mes", "Total Compras", "Mes", "Total Compras", "Mes", "Total Compras"]],
        body: [0, 1, 2, 3].map((r) => [
            MESES_FULL[r],     formatFull(serieCompras[r].total),
            MESES_FULL[r + 4], formatFull(serieCompras[r + 4].total),
            MESES_FULL[r + 8], formatFull(serieCompras[r + 8].total),
        ]),
        foot: [["Total anual", { content: formatFull(totalComprasAnio), colSpan: 5, styles: { fontStyle: "bold", halign: "left" } }]],
        styles:          { fontSize: 8, cellPadding: 2.5 },
        headStyles:      { fillColor: OSCURO, textColor: [255, 255, 255], fontStyle: "bold" },
        footStyles:      { fillColor: GRIS_CLARO, textColor: OSCURO, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        columnStyles:    { 0: { fontStyle: "bold", cellWidth: 26 }, 1: { cellWidth: 38 }, 2: { fontStyle: "bold", cellWidth: 26 }, 3: { cellWidth: 38 }, 4: { fontStyle: "bold", cellWidth: 26 }, 5: { cellWidth: 28 } },
        margin:          { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 10;

    // ── SECCIÓN 4: Top productos del mes ─────────────────────────────────────
    if (y > 210) { doc.addPage(); y = 20; }
    doc.setTextColor(...OSCURO);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`4. Productos Más Vendidos — ${mesNombre} ${year}`, 14, y);
    doc.setDrawColor(...AMARILLO);
    doc.line(14, y + 2, 196, y + 2);
    y += 6;

    if (topProductos.length === 0) {
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text("Sin ventas registradas en este período.", 14, y + 7);
        y += 18;
    } else {
        autoTable(doc, {
            startY: y,
            head: [["#", "Producto", "Unidades Vendidas"]],
            body: topProductos.map((p, i) => [String(i + 1), p.nombre, String(p.cantidad)]),
            styles:      { fontSize: 9, cellPadding: 3 },
            headStyles:  { fillColor: AMARILLO, textColor: [0, 0, 0], fontStyle: "bold" },
            alternateRowStyles: { fillColor: GRIS_CLARO },
            columnStyles:{ 0: { cellWidth: 12, halign: "center" }, 2: { halign: "center" } },
            margin:      { left: 14, right: 14 },
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    // ── SECCIÓN 5: Ventas por categoría ──────────────────────────────────────
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setTextColor(...OSCURO);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`5. Ventas por Categoría — ${mesNombre} ${year}`, 14, y);
    doc.setDrawColor(...AMARILLO);
    doc.line(14, y + 2, 196, y + 2);
    y += 6;

    if (donut.length === 0) {
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text("Sin datos de categorías en este período.", 14, y + 7);
        y += 18;
    } else {
        const donutTotal = donut.reduce((a, d) => a + d.value, 0);
        autoTable(doc, {
            startY: y,
            head: [["Categoría", "Unidades", "% del Total"]],
            body: donut.map((d) => [
                d.name,
                String(d.value),
                `${donutTotal ? ((d.value / donutTotal) * 100).toFixed(1) : 0}%`,
            ]),
            styles:       { fontSize: 9, cellPadding: 3 },
            headStyles:   { fillColor: OSCURO, textColor: [255, 255, 255], fontStyle: "bold" },
            alternateRowStyles: { fillColor: GRIS_CLARO },
            columnStyles: { 1: { halign: "center" }, 2: { halign: "center" } },
            margin:       { left: 14, right: 14 },
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    // ── SECCIÓN 6: Indicadores operacionales ─────────────────────────────────
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setTextColor(...OSCURO);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("6. Indicadores Operacionales", 14, y);
    doc.setDrawColor(...AMARILLO);
    doc.line(14, y + 2, 196, y + 2);
    y += 6;

    autoTable(doc, {
        startY: y,
        head: [["Indicador", "Valor", "Estado"]],
        body: [
            [
                "Clientes activos en el sistema",
                String(stats.clientesActivos),
                "Operativo",
            ],
            [
                `Devoluciones registradas en ${mesNombre}`,
                String(stats.devMes),
                stats.devMes > 0 ? "Requiere revisión" : "Sin novedades",
            ],
            [
                "Productos con stock crítico (≤ 5 unidades)",
                String(stats.stockBajo),
                stats.stockBajo > 0 ? "⚠ Reabastecer" : "✓ Nivel normal",
            ],
            [
                "Rentabilidad del mes (ventas - compras)",
                formatFull(Math.max(0, kpis.ganancia)),
                kpis.ganancia >= 0 ? "✓ Positiva" : "⚠ Negativa",
            ],
        ],
        styles:       { fontSize: 8.5, cellPadding: 3 },
        headStyles:   { fillColor: AMARILLO, textColor: [0, 0, 0], fontStyle: "bold" },
        alternateRowStyles: { fillColor: GRIS_CLARO },
        columnStyles: { 0: { cellWidth: 95 }, 1: { halign: "center", cellWidth: 28 }, 2: { cellWidth: 55 } },
        margin:       { left: 14, right: 14 },
    });

    // ── PIE DE PÁGINA en cada página ──────────────────────────────────────────
    const totalPags = doc.getNumberOfPages();
    for (let pg = 1; pg <= totalPags; pg++) {
        doc.setPage(pg);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(14, 287, 196, 287);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 160, 160);
        doc.text("ElectroSoft · Documento confidencial · Generado automáticamente", 14, 292);
        doc.text(`Pág. ${pg} / ${totalPags}`, 196, 292, { align: "right" });
    }

    doc.save(`reporte-dashboard-${mesNombre.toLowerCase()}-${year}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
    const [year,  setYear]  = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);
    const [showConfirm, setShowConfirm] = useState(false);

    const [raw, setRaw] = useState({
        sales: [], compras: [], products: [], clients: [], devolutions: [], categories: [],
    });

    useEffect(() => {
        setRaw({
            sales:       JSON.parse(localStorage.getItem("sales")           || "[]"),
            compras:     JSON.parse(localStorage.getItem("compras")         || "[]"),
            products:    JSON.parse(localStorage.getItem("products")        || "[]"),
            clients:     JSON.parse(localStorage.getItem("clients")         || "[]"),
            devolutions: JSON.parse(localStorage.getItem("devolutions")     || "[]"),
            categories:  JSON.parse(localStorage.getItem("productCategory") || "[]"),
        });
    }, []);

    const [nombre, setNombre] = useState("Usuario");
    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem("authUser") || "{}");
            const n = u?.fullName || u?.nombre || u?.name || "";
            if (n) setNombre(n.split(" ")[0]);
        } catch {}
    }, []);

    // ─── Datos ────────────────────────────────────────────────────────────────
    const inM = (f, y, m) => {
        const d = toDate(f);
        if (!d) return false;
        return d.getFullYear() === y && d.getMonth() === m;
    };
    const prevYM = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };

    const salesNow  = raw.sales.filter(s => inM(s.fecha, year, month)        && s.estado !== "Anulado");
    const salesPrev = raw.sales.filter(s => inM(s.fecha, prevYM.y, prevYM.m) && s.estado !== "Anulado");

    const sum   = (arr, fn) => arr.reduce((a, x) => a + fn(x), 0);
    const delta = (cur, prev) => prev ? ((cur - prev) / Math.abs(prev)) * 100 : 0;

    const totalVentas  = sum(salesNow,  s => parseMoney(s.total));
    const prevVentas   = sum(salesPrev, s => parseMoney(s.total));
    const prodVend     = sum(salesNow,  s => sum(s.productos || [], p => Number(p.cantidad || 0)));
    const prevProdVend = sum(salesPrev, s => sum(s.productos || [], p => Number(p.cantidad || 0)));

    const comprasNow   = raw.compras.filter(c => inM(c.fechaCompra, year, month)        && c.estado !== "Anulada");
    const comprasPrev  = raw.compras.filter(c => inM(c.fechaCompra, prevYM.y, prevYM.m) && c.estado !== "Anulada");
    const totalCompras = sum(comprasNow,  c => parseMoney(c.total));
    const prevCompras  = sum(comprasPrev, c => parseMoney(c.total));
    const ganancia     = totalVentas - totalCompras;
    const prevGanancia = prevVentas  - prevCompras;

    const serieCompras = MESES.map((mes, i) => ({
        mes, total: sum(raw.compras.filter(c => inM(c.fechaCompra, year, i) && c.estado !== "Anulada"), c => parseMoney(c.total)),
    }));
    const serieVentas = MESES.map((mes, i) => ({
        mes, total: sum(raw.sales.filter(s => inM(s.fecha, year, i) && s.estado !== "Anulado"), s => parseMoney(s.total)),
    }));

    const prodMap = {};
    salesNow.forEach(s => (s.productos || []).forEach(p => {
        if (p.nombre) prodMap[p.nombre] = (prodMap[p.nombre] || 0) + Number(p.cantidad || 0);
    }));
    const topProductos = Object.entries(prodMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([n, cantidad]) => ({ nombre: n.length > 30 ? n.slice(0, 28) + "…" : n, cantidad }));

    const catMap = {};
    salesNow.forEach(s => (s.productos || []).forEach(p => {
        const prod = raw.products.find(pr => pr.nombre === p.nombre);
        const cat  = raw.categories.find(c => String(c.id) === String(prod?.categoriaId));
        const lbl  = cat?.nombre || "Sin categoría";
        catMap[lbl] = (catMap[lbl] || 0) + Number(p.cantidad || 0);
    }));
    const donut      = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const donutTotal = donut.reduce((a, d) => a + d.value, 0);

    const clientesActivos = raw.clients.filter(c => c.estado !== false && c.estado !== "Inactivo").length;
    const devMes          = raw.devolutions.filter(d => inM(d.creadoEn || d.fecha, year, month)).length;
    const stockBajo       = raw.products.filter(p => Number(p.stock) <= 5 && p.stock > 0 && p.estado !== false).length;

    const yearItems  = [currentYear, currentYear - 1, currentYear - 2].map(y => ({ label: `Año ${y}`, value: y }));
    const monthItems = MESES_FULL.map((m, i) => ({ label: m, value: i }));

    // ─── Handler PDF ─────────────────────────────────────────────────────────
    const handleConfirmPDF = () => {
        generarReportePDF({
            year, month,
            kpis: {
                ventas: totalVentas,  deltaVentas:   delta(totalVentas, prevVentas),
                prodVend,             deltaProd:     delta(prodVend, prevProdVend),
                compras: totalCompras,deltaCompras:  delta(totalCompras, prevCompras),
                ganancia,             deltaGanancia: delta(ganancia, prevGanancia),
            },
            serieVentas, serieCompras, topProductos, donut,
            stats: { clientesActivos, devMes, stockBajo },
        });
        setShowConfirm(false);
    };

    return (
        <>
            <style>{`
                @keyframes kpiFadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-6 h-full shadow-inner overflow-auto">

                {/* HEADER */}
                <div className="flex items-center justify-between flex-shrink-0"
                    style={{ animation: "kpiFadeUp .4s ease both" }}>
                    <div>
                        <h1 className="text-[1.6rem] font-bold text-gray-900 leading-tight">
                            ¡Bienvenido, <span className="text-yellow-500">{nombre}</span>!
                        </h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {MESES_FULL[month]} {year} · Resumen general
                        </p>
                    </div>
                    <div className="flex items-center gap-2">

                        {/* Botón generar reporte */}
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:bg-gray-50 transition duration-300 shadow-sm cursor-pointer"
                        >
                            <FileText size={14} className="text-gray-500" />
                            Generar reporte
                        </button>

                        <Dropdown label={`Año ${year}`}     items={yearItems}  value={year}  onChange={setYear}  icon={Calendar} />
                        <Dropdown label={MESES_FULL[month]} items={monthItems} value={month} onChange={setMonth} icon={Calendar} />
                    </div>
                </div>

                {/* KPIs con imagen de fondo */}
                <div className="relative rounded-3xl overflow-hidden flex-shrink-0 shadow-md"
                    style={{
                        backgroundImage:    'url("/background-shopping-details.jpg")',
                        backgroundSize:     "cover",
                        backgroundPosition: "center",
                        backgroundRepeat:   "no-repeat",
                        animation:          "kpiFadeUp .5s ease both",
                        animationDelay:     "50ms",
                    }}>
                    <div className="absolute inset-0 bg-white/20 rounded-3xl" />
                    <div className="relative z-10 grid grid-cols-4 gap-4 p-6">
                        <KpiCard icon={DollarSign}  label="Monto de Ventas"   value={totalVentas}           delta={delta(totalVentas, prevVentas)}   color="#FFC107" isMoney        delay={0}   />
                        <KpiCard icon={Package}     label="Productos Vendidos" value={prodVend}              delta={delta(prodVend, prevProdVend)}    color="#6366f1" isMoney={false} delay={80}  />
                        <KpiCard icon={ShoppingBag} label="Monto de Compras"  value={totalCompras}          delta={delta(totalCompras, prevCompras)} color="#f59e0b" isMoney        delay={160} />
                        <KpiCard icon={TrendingUp}  label="Ganancia Neta"     value={Math.max(0, ganancia)} delta={delta(ganancia, prevGanancia)}    color="#10b981" isMoney        delay={240} />
                    </div>
                </div>

                {/* FILA 2 */}
                <div className="grid grid-cols-5 gap-4 flex-shrink-0">
                    <div className="col-span-3">
                        <Card title="Evolución mensual de compras" subtitle={`Año ${year}`} delay={300} className="h-full">
                            {serieCompras.every(d => d.total === 0)
                                ? <Empty msg="Sin datos de compras para este año" />
                                : <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={serieCompras} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#FFC107" stopOpacity={.35} />
                                                <stop offset="95%" stopColor="#FFC107" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={formatCOP} width={50} />
                                        <Tooltip content={<Tip isMoney />} />
                                        <Area type="monotone" dataKey="total" name="Compras"
                                            stroke="#FFC107" strokeWidth={2.5} fill="url(#gc)"
                                            dot={false} activeDot={{ r: 5, fill: "#FFC107", stroke: "#fff", strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            }
                        </Card>
                    </div>
                    <div className="col-span-2">
                        <Card title="Productos más vendidos" subtitle={`Top ${Math.min(topProductos.length || 5, 5)} · ${MESES_FULL[month]}`} delay={360} className="h-full">
                            {topProductos.length === 0
                                ? <Empty msg="Sin ventas en este período" />
                                : <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={topProductos} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barCategoryGap="30%">
                                        <defs>
                                            <linearGradient id="gb" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%"   stopColor="#FFC107" />
                                                <stop offset="100%" stopColor="#F59E0B" />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                        <YAxis type="category" dataKey="nombre" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={86} />
                                        <Tooltip content={<Tip isMoney={false} />} />
                                        <Bar dataKey="cantidad" name="Uds." fill="url(#gb)" radius={[0, 6, 6, 0]} maxBarSize={16} />
                                    </BarChart>
                                </ResponsiveContainer>
                            }
                        </Card>
                    </div>
                </div>

                {/* FILA 3 */}
                <div className="grid grid-cols-5 gap-4 flex-shrink-0">

                    <Card title="Ventas por categoría" subtitle={`${MESES_FULL[month]} ${year}`} delay={420}>
                        {donut.length === 0
                            ? <Empty msg="Sin datos de categorías" />
                            : <>
                                <ResponsiveContainer width="100%" height={155}>
                                    <PieChart>
                                        <Pie data={donut} cx="50%" cy="50%"
                                            innerRadius={44} outerRadius={68}
                                            paddingAngle={3} dataKey="value"
                                            startAngle={90} endAngle={-270}>
                                            {donut.map((_, i) => (
                                                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v) => [`${v} uds`, ""]}
                                            contentStyle={{ fontSize: 12, borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-col gap-1.5 mt-2">
                                    {donut.slice(0, 4).map((d, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                                                <span className="text-[11px] text-gray-500 truncate max-w-[100px]">{d.name}</span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-gray-700">
                                                {donutTotal ? Math.round(d.value / donutTotal * 100) : 0}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        }
                    </Card>

                    <div className="col-span-3">
                        <Card title="Monto total de ventas" subtitle={`Año ${year}`} delay={480} className="h-full"
                            action={
                                <span className="flex items-center gap-1 text-[11px] font-medium bg-yellow-50 border border-yellow-200 text-yellow-700 px-2.5 py-1 rounded-lg flex-shrink-0">
                                    <Calendar size={11} />
                                    {year}
                                </span>
                            }>
                            {serieVentas.every(d => d.total === 0)
                                ? <Empty msg="Sin ventas registradas este año" />
                                : <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={serieVentas} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#10b981" stopOpacity={.28} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={formatCOP} width={50} />
                                        <Tooltip content={<Tip isMoney />} />
                                        <Area type="monotone" dataKey="total" name="Ventas"
                                            stroke="#10b981" strokeWidth={2.5} fill="url(#gv)"
                                            dot={false} activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            }
                        </Card>
                    </div>

                    <div className="flex flex-col gap-4"
                        style={{ animation: "kpiFadeUp .6s ease both", animationDelay: "540ms" }}>
                        {[
                            { icon: Users,     color: "#3b82f6", bg: "#eff6ff", val: clientesActivos, label: "Clientes activos",      warn: false },
                            { icon: RotateCcw, color: "#f59e0b", bg: "#fffbeb", val: devMes,          label: "Devoluciones este mes", warn: false },
                            { icon: Package,   color: stockBajo > 0 ? "#ef4444" : "#9ca3af",
                                               bg:    stockBajo > 0 ? "#fef2f2" : "#f9fafb",
                                val: stockBajo, label: "Stock bajo (≤5 uds)", warn: stockBajo > 0 },
                        ].map(({ icon: Icon, color, bg, val, label, warn }, i) => (
                            <div key={i} className={`rounded-2xl p-4 shadow-sm border flex flex-col gap-2 flex-1
                                ${warn ? "border-red-100 bg-red-50" : "border-gray-100 bg-white"}`}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                                    <Icon size={18} style={{ color }} strokeWidth={2} />
                                </div>
                                <p className={`text-2xl font-bold ${warn ? "text-red-600" : "text-gray-800"}`}>
                                    {val.toLocaleString("es-CO")}
                                </p>
                                <p className="text-[11px] text-gray-400 leading-tight">{label}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Modal de confirmación */}
            {showConfirm && (
                <ConfirmModal
                    type="info"
                    title="Generar reporte PDF"
                    message={`Se exportará un reporte ejecutivo de ${MESES_FULL[month]} ${year} con: resumen de KPIs financieros, evolución mensual de ventas y compras del año, top productos del mes, distribución por categorías e indicadores operacionales. ¿Deseas continuar?`}
                    onConfirm={handleConfirmPDF}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </>
    );
}