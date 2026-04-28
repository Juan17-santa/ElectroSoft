export const DONUT_COLORS = ["#FFC107", "#1f2937", "#F59E0B", "#6b7280", "#D97706", "#374151", "#FBBF24", "#4B5563"];

export const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const MESES_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const now = new Date();
export const currentYear = now.getFullYear();
export const currentMonth = now.getMonth();

export const toDate = (f) => {
    if (!f) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(f)) return new Date(f);
    if (/^\d{2}\/\d{2}\/\d{4}/.test(f)) {
        const [d, m, y] = f.split("/");
        return new Date(`${y}-${m}-${d}`);
    }
    return new Date(f);
};

export const formatCOP = (n) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString("es-CO")}`;
};

export const formatFull = (n) => "$" + Number(n).toLocaleString("es-CO");

export const parseMoney = (v) => {
    if (!v) return 0;
    if (typeof v === "number") return v;
    return Number(String(v).replace(/\$|\./g, "").replace(",", ".")) || 0;
};