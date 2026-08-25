import { useState, useEffect } from "react";
import DashboardEmpleado from "./DashboardEmpleado";
import { authStorage } from "../../../../../utils/authStorage";
import { DollarSign, Package, ShoppingBag, TrendingUp, Calendar, RotateCcw, Loader2 } from "lucide-react";
import { getAuthUser } from "../../../../auth/services/authService";
import { StatCard } from "../components/StatCard";
import { currentMonth, toDate, currentYear, MESES, MESES_FULL, parseMoney, DONUT_COLORS } from "../utils/constants";
import { PurchasesChart } from "../components/PurchasesChart";
import { TopProductsChart } from "../components/TopProductsChart";
import { CategorySalesChart } from "../components/CategorySalesChart";
import { TotalSalesChart } from "../components/TotalSalesChart";
import { SalesTypeChart } from "../components/SalesTypeChart";
import { Dropdown } from "../components/Dropdown";

// Servicios importados
import { ServicesShopping } from "../../shopping/services/ServicesShopping";
import { SalesService } from "../../SalesManagement/services/SalesService";
import { ServicesProducts } from "../../products/services/ServicesProducts";
import { ClientsService } from "../../Clients/services/ClientsService";
import { ServicesDevolutions } from "../../devolutions/services/ServicesDevolutions";
import { ServiceProductCategory } from "../../productCategory/services/ServicesProductCategory";


export default function Dashboard() {
    const user = authStorage.getUser();

    if (user?.role !== "Administrador") {
        return <DashboardEmpleado />;
    }

    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);

    const [raw, setRaw] = useState({
        sales: [], compras: [], products: [], clients: [], devolutions: [], categories: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [compras, sales, products, clients, devolutions, categories] = await Promise.all([
                    ServicesShopping.fetchAll().then((r) => r?.data || []).catch(() => []),
                    SalesService.get().catch(() => []),
                    ServicesProducts.get().catch(() => []),
                    ClientsService.get().catch(() => []),
                    ServicesDevolutions.getAll({ page: 1, limit: 1000 }).then((r) => {
                        const groups = Array.isArray(r?.groups) ? r.groups : [];
                        return groups.flatMap((g) => (Array.isArray(g) ? g : [g]));
                    }).catch(() => []),
                    ServiceProductCategory.get().catch(() => []),
                ]);

                if (!mounted) return;

                setRaw({
                    compras,
                    sales,
                    products,
                    clients,
                    devolutions,
                    categories,
                });
            } catch (error) {
                console.error("Error al cargar los datos del dashboard", error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        loadData();
        return () => { mounted = false; };
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
    const delta = (cur, prev) => {
        if (!prev) return null;
        const d = ((cur - prev) / Math.abs(prev)) * 100;
        return Number.isFinite(d) ? d : null;
    };

    // Reembolsos que descuentan del monto de ventas: solo gestiones de reembolso,
    // no anuladas ni rechazadas, con monto mayor a 0 (el monto incluye IVA).
    const esReembolsoValido = (d) =>
        d.estadoResolucion !== "Anulada" &&
        d.estadoResolucion !== "RECHAZADA" &&
        (d.gestion === "REEMBOLSO_TOTAL" || d.gestion === "REEMBOLSO_PARCIAL") &&
        Number(d.montoReembolso) > 0;
    const sumReembolso = (arr) => sum(arr, d => Number(d.montoReembolso || 0));

    const reembolsosNow = raw.devolutions.filter(d => esReembolsoValido(d) && inM(d.creadoEn || d.fecha, year, month));
    const reembolsosPrev = raw.devolutions.filter(d => esReembolsoValido(d) && inM(d.creadoEn || d.fecha, prevYM.y, prevYM.m));

    const totalVentas = sum(salesNow, s => parseMoney(s.total)) - sumReembolso(reembolsosNow);
    const prevVentas = sum(salesPrev, s => parseMoney(s.total)) - sumReembolso(reembolsosPrev);
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
        mes,
        total: sum(raw.sales.filter(s => inM(s.fecha, year, i) && s.estado !== "Anulado"), s => parseMoney(s.total))
            - sumReembolso(raw.devolutions.filter(d => esReembolsoValido(d) && inM(d.creadoEn || d.fecha, year, i))),
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
        const lbl = cat?.name || cat?.nombre || "Sin categoría"; // Se comprueba 'name' por el mapper del frontend
        catMap[lbl] = (catMap[lbl] || 0) + Number(p.cantidad || 0);
    }));
    const donut = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const donutTotal = donut.reduce((a, d) => a + d.value, 0);
    const tipoMap = {};
    salesNow.forEach(s => {
        const t = s.tipoVenta === "Credito" ? "Crédito" : (s.tipoVenta || "Otro");
        tipoMap[t] = (tipoMap[t] || 0) + parseMoney(s.total);
    });

    const tipoDonut = Object.entries(tipoMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const devMes = raw.devolutions.filter(
        d => inM(d.creadoEn || d.fecha, year, month)
    ).length;

    const devMesPrev = raw.devolutions.filter(
        d => inM(d.creadoEn || d.fecha, prevYM.y, prevYM.m)
    ).length;

    const stockBajo = raw.products.filter(
        p => Number(p.stock) <= 5 && Number(p.stock) >= 0 && p.estado !== false
    ).length;
    const yearItems = [currentYear, currentYear - 1, currentYear - 2].map(y => ({ label: `Año ${y}`, value: y }));
    const monthItems = MESES_FULL.map((m, i) => ({ label: m, value: i }));

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center h-full min-h-125">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Cargando datos del dashboard...</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes kpiFadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="bg-white p-6 rounded-2xl flex flex-col gap-6 h-full  overflow-auto">

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

                <div className="relative rounded-3xl overflow-hidden shrink-0 shadow-md bg-gray-100"
                    style={{
                        animation: "kpiFadeUp .5s ease both",
                        animationDelay: "50ms",
                    }}>
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

                    {/* Columna de gráfica y StatCards */}
                    <div className="col-span-1 flex flex-col gap-4" style={{ animation: "kpiFadeUp .6s ease both", animationDelay: "540ms" }}>
                        <SalesTypeChart data={tipoDonut} monthName={MESES_FULL[month]} year={year} />
                        <StatCard icon={RotateCcw} label="Devoluciones este mes" value={devMes} delta={delta(devMes, devMesPrev)} color="#f59e0b" isMoney={false} />
                        <StatCard icon={Package} label="Stock bajo (≤5 uds)" value={stockBajo} color={stockBajo > 0 ? "#ef4444" : "#9ca3af"} isMoney={false} showDelta={false} />
                    </div>
                </div>
            </div >

        </>
    );
}