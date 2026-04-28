import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card } from './Card';
import { Empty, Tip } from './Ui';
import { Calendar } from 'lucide-react';
import { formatCOP } from '../utils/constants';

export const TotalSalesChart = ({ data, year }) => {
    return (
        <Card title="Monto total de ventas" subtitle={`Año ${year}`} delay={480} className="h-full"
            action={
                <span className="flex items-center gap-1 text-[11px] font-medium bg-yellow-50 border border-yellow-200 text-yellow-700 px-2.5 py-1 rounded-lg shrink-0">
                    <Calendar size={11} /> {year}
                </span>
            }>
            {data.every(d => d.total === 0) ? <Empty msg="Sin ventas registradas este año" /> :
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={.28} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={formatCOP} width={50} />
                        <Tooltip content={<Tip isMoney />} />
                        <Area type="monotone" dataKey="total" name="Ventas" stroke="#10b981" strokeWidth={2.5} fill="url(#gv)" dot={false} activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
                    </AreaChart>
                </ResponsiveContainer>
            }
        </Card>
    );
};