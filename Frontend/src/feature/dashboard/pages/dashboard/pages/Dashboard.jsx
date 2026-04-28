import { useState, useEffect } from "react";
import { DollarSign, Package, ShoppingBag, TrendingUp, Calendar, RotateCcw, Users } from "lucide-react";
import { getAuthUser } from "../../../../auth/services/authService";
import { StatCard } from "../components/StatCard";
import { currentMonth, toDate, formatCOP, currentYear, MESES, MESES_FULL, parseMoney, DONUT_COLORS } from "../utils/constants";
import { Empty, Tip } from "../components/Ui";
import { PurchasesChart } from "../components/PurchasesChart";
import { TopProductsChart } from "../components/TopProductsChart";
import { Card } from "../components/Card";
import { CategorySalesChart } from "../components/CategorySalesChart";
import { TotalSalesChart } from "../components/TotalSalesChart";
import { Dropdown } from "../components/Dropdown";

export default function Dashboard() {
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);

    const [raw, setRaw] = useState({
        sales: [], compras: [], products: [], clients: [], devolutions: [], categories: [],
    });

    useEffect(() => {
        setRaw({
            sales: JSON.parse(localStorage.getItem("sales") || "[]"),
            compras: JSON.parse(localStorage.getItem("compras") || "[]"),
            products: JSON.parse(localStorage.getItem("products") || "[]"),
            clients: JSON.parse(localStorage.getItem("clients") || "[]"),
            devolutions: JSON.parse(localStorage.getItem("devolutions") || "[]"),
            categories: JSON.parse(localStorage.getItem("productCategory") || "[]"),
        });
    }, []);

    const [nombre, setNombre] = useState("Usuario");

    useEffect(() => {
        const loadNombre = () => {
            const user = getAuthUser();
            const n = user?.fullName || user?.nombre || user?.name || "";
            if (n) setNombre(n.split(" ")[0]);
        };
        loadNombre();
        window.addEventListener("profile-updated", loadNombre);
        return () => window.removeEventListener("profile-updated", loadNombre);
    }, []);

    // ─── Datos ────────────────────────────────────────────────────────────────
    const inM = (f, y, m) => {
        const d = toDate(f);
        if (!d) return false;
        return d.getFullYear() === y && d.getMonth() === m;
    };
    const prevYM = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };

    const salesNow = raw.sales.filter(s => inM(s.fecha, year, month) && s.estado !== "Anulado");
    const salesPrev = raw.sales.filter(s => inM(s.fecha, prevYM.y, prevYM.m) && s.estado !== "Anulado");

    const sum = (arr, fn) => arr.reduce((a, x) => a + fn(x), 0);
    const delta = (cur, prev) => prev ? ((cur - prev) / Math.abs(prev)) * 100 : 0;

    const totalVentas = sum(salesNow, s => parseMoney(s.total));
    const prevVentas = sum(salesPrev, s => parseMoney(s.total));
    const prodVend = sum(salesNow, s => sum(s.productos || [], p => Number(p.cantidad || 0)));
    const prevProdVend = sum(salesPrev, s => sum(s.productos || [], p => Number(p.cantidad || 0)));

    const comprasNow = raw.compras.filter(c => inM(c.fechaCompra, year, month) && c.estado !== "Anulada");
    const comprasPrev = raw.compras.filter(c => inM(c.fechaCompra, prevYM.y, prevYM.m) && c.estado !== "Anulada");
    const totalCompras = sum(comprasNow, c => parseMoney(c.total));
    const prevCompras = sum(comprasPrev, c => parseMoney(c.total));
    const ganancia = totalVentas - totalCompras;
    const prevGanancia = prevVentas - prevCompras;

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
        const cat = raw.categories.find(c => String(c.id) === String(prod?.categoriaId));
        const lbl = cat?.nombre || "Sin categoría";
        catMap[lbl] = (catMap[lbl] || 0) + Number(p.cantidad || 0);
    }));
    const donut = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const donutTotal = donut.reduce((a, d) => a + d.value, 0);

    const clientesActivos = raw.clients.filter(c => c.estado !== false && c.estado !== "Inactivo").length;
    const devMes = raw.devolutions.filter(d => inM(d.creadoEn || d.fecha, year, month)).length;
    const stockBajo = raw.products.filter(p => Number(p.stock) <= 5 && p.stock > 0 && p.estado !== false).length;

    const yearItems = [currentYear, currentYear - 1, currentYear - 2].map(y => ({ label: `Año ${y}`, value: y }));
    const monthItems = MESES_FULL.map((m, i) => ({ label: m, value: i }));

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
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between shrink-0"
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
                        <Dropdown label={`Año ${year}`} items={yearItems} value={year} onChange={setYear} icon={Calendar} />
                        <Dropdown label={MESES_FULL[month]} items={monthItems} value={month} onChange={setMonth} icon={Calendar} />
                    </div>
                </div>

                <div className="relative rounded-3xl overflow-hidden shrink-0 shadow-md"
                    style={{
                        backgroundImage: 'url("/background-details.jpg")',
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        animation: "kpiFadeUp .5s ease both",
                        animationDelay: "50ms",
                    }}>
                    <div className="absolute inset-0 bg-gray-100 md:bg-transparent rounded-3xl" />
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
                        <StatCard icon={DollarSign} label="Monto de Ventas" value={totalVentas} delta={delta(totalVentas, prevVentas)} color="#FFC107" isMoney delay={0} />
                        <StatCard icon={Package} label="Productos Vendidos" value={prodVend} delta={delta(prodVend, prevProdVend)} color="#6366f1" isMoney={false} delay={80} />
                        <StatCard icon={ShoppingBag} label="Monto de Compras" value={totalCompras} delta={delta(totalCompras, prevCompras)} color="#f59e0b" isMoney delay={160} />
                        <StatCard icon={TrendingUp} label="Compras vs Ventas" value={ganancia} delta={delta(ganancia, prevGanancia)} color={ganancia >= 0 ? "#10b981" : "#ef4444"} isMoney delay={240} />
                    </div>
                </div>

                {/* FILA 2 */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 shrink-0">
                    <div className="col-span-1 md:col-span-3">
                        <PurchasesChart data={serieCompras} year={year} />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <TopProductsChart data={topProductos} monthName={MESES_FULL[month]} />
                    </div>
                </div>

                {/* FILA 3 */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 shrink-0">
                    <div className="col-span-1 md:col-span-1">
                        <CategorySalesChart
                            data={donut}
                            monthName={MESES_FULL[month]}
                            year={year}
                            total={donutTotal}
                        />
                    </div>

                    <div className="col-span-1 md:col-span-3">
                        <TotalSalesChart data={serieVentas} year={year} />
                    </div>

                    {/* Columna de StatCards */}
                    <div className="col-span-1 grid grid-cols-1 gap-4" style={{ animation: "kpiFadeUp .6s ease both", animationDelay: "540ms" }}>
                        <StatCard icon={Users} label="Clientes activos" value={clientesActivos} color="#3b82f6" isMoney={false} />
                        <StatCard icon={RotateCcw} label="Devoluciones este mes" value={devMes} color="#f59e0b" isMoney={false} />
                        <StatCard icon={Package} label="Stock bajo (≤5 uds)" value={stockBajo} color={stockBajo > 0 ? "#ef4444" : "#9ca3af"} isMoney={false} />
                    </div>
                </div>
            </div>

        </>
    );
}