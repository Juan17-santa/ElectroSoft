import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Package, TrendingUp, Calendar } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { TotalSalesChart } from "../components/TotalSalesChart";
import { SalesTypeChart } from "../components/SalesTypeChart";
import { PurchasesChart } from "../components/PurchasesChart";
import { Dropdown } from "../components/Dropdown";
import { authStorage } from "../../../../../utils/authStorage";
import api from "../../../../../utils/api.js";
import { MESES, MESES_FULL } from "../utils/constants";

const MONTHS = MESES_FULL.map((label, i) => ({ label, value: i + 1 }));

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => ({
    label: String(currentYear - i),
    value: currentYear - i,
}));

export default function DashboardEmpleado() {
    const user = authStorage.getUser();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const [ventasStats, setVentasStats] = useState(null);
    const [comprasStats, setComprasStats] = useState(null);
    const [ventasMensuales, setVentasMensuales] = useState([]);
    const [comprasMensuales, setComprasMensuales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, [selectedYear, selectedMonth]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [ventasRes, comprasRes, ventasMensRes, comprasMensRes] = await Promise.all([
                api.get(`/sales/mis-estadisticas?year=${selectedYear}&month=${selectedMonth}`),
                api.get(`/shopping/mis-estadisticas?year=${selectedYear}&month=${selectedMonth}`),
                api.get(`/sales/mis-ventas-mensuales?year=${selectedYear}`),
                api.get(`/shopping/mis-compras-mensuales?year=${selectedYear}`),
            ]);
            setVentasStats(ventasRes.data.data);
            setComprasStats(comprasRes.data.data);
            setVentasMensuales(ventasMensRes.data.data);
            setComprasMensuales(comprasMensRes.data.data);
        } catch (error) {
            console.error("Error cargando estadísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    // Los charts (TotalSalesChart / PurchasesChart) esperan un array de 12
    // objetos { mes, total }, igual que en el dashboard de administrador.
    const formatMonthlySales = () =>
        MESES.map((mes, i) => {
            const found = ventasMensuales.find(v => v._id === i + 1);
            return { mes, total: found ? Number(found.total) || 0 : 0 };
        });

    const formatMonthlyPurchases = () =>
        MESES.map((mes, i) => {
            const found = comprasMensuales.find(c => c._id === i + 1);
            return { mes, total: found ? Number(found.total) || 0 : 0 };
        });

    const salesTypeData = ventasStats ? [
        { name: "Contado", value: Number(ventasStats.ventasPorTipo?.Contado) || 0 },
        { name: "Crédito", value: Number(ventasStats.ventasPorTipo?.Credito) || 0 },
    ] : [];

    const formatCurrency = (value) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency", currency: "COP", minimumFractionDigits: 0
        }).format(value || 0);

    const selectedMonthLabel = MONTHS.find(m => m.value === selectedMonth)?.label || "";

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 h-full overflow-y-auto">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        ¡Bienvenido, <span className="text-yellow-500">{user?.fullName?.split(" ")[0]}</span>!
                    </h1>
                    <p className="text-sm text-gray-500">
                        {selectedMonthLabel} {selectedYear} · Mis estadísticas
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Dropdown
                        label={String(selectedYear)}
                        items={YEARS}
                        value={selectedYear}
                        onChange={setSelectedYear}
                        icon={Calendar}
                    />
                    <Dropdown
                        label={selectedMonthLabel}
                        items={MONTHS}
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        icon={Calendar}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400">Cargando estadísticas...</p>
                </div>
            ) : (
                <>
                    {/* STAT CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Monto de ventas"
                            value={Number(ventasStats?.totalVentas) || 0}
                            icon={DollarSign}
                            color="#FFC107"
                            isMoney
                            showDelta={false}
                        />
                        <StatCard
                            label="Productos vendidos"
                            value={Number(ventasStats?.productosVendidos) || 0}
                            icon={Package}
                            color="#6366f1"
                            isMoney={false}
                            showDelta={false}
                        />
                        <StatCard
                            label="Monto de compras"
                            value={Number(comprasStats?.totalCompras) || 0}
                            icon={ShoppingCart}
                            color="#f59e0b"
                            isMoney
                            showDelta={false}
                        />
                        <StatCard
                            label="Ventas registradas"
                            value={Number(ventasStats?.cantidadVentas) || 0}
                            icon={TrendingUp}
                            color="#10b981"
                            isMoney={false}
                            showDelta={false}
                        />
                    </div>

                    {/* GRÁFICOS MENSUALES */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <TotalSalesChart data={formatMonthlySales()} year={selectedYear} />
                        <PurchasesChart data={formatMonthlyPurchases()} year={selectedYear} />
                    </div>

                    {/* VENTAS POR TIPO Y RESUMEN */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SalesTypeChart
                            data={salesTypeData}
                            monthName={selectedMonthLabel}
                            year={selectedYear}
                        />

                        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4">
                            <div>
                                <p className="font-semibold text-gray-800 mb-1">Resumen del mes</p>
                                <p className="text-xs text-gray-400">{selectedMonthLabel} {selectedYear}</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
                                    <span className="text-sm text-gray-600">Total ventas</span>
                                    <span className="font-bold text-yellow-600">
                                        {formatCurrency(ventasStats?.totalVentas)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                                    <span className="text-sm text-gray-600">Total compras</span>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(comprasStats?.totalCompras)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                                    <span className="text-sm text-gray-600">Diferencia</span>
                                    <span className="font-bold text-blue-600">
                                        {formatCurrency((ventasStats?.totalVentas || 0) - (comprasStats?.totalCompras || 0))}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-600">Compras registradas</span>
                                    <span className="font-bold text-gray-800">
                                        {comprasStats?.cantidadCompras || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}