import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card } from './Card';
import { Empty, Tip } from './Ui';
import { formatCOP } from '../utils/constants';

export const PurchasesChart = ({ data, year }) => {
    const isEmpty = data.every(d => d.total === 0);

    return (
        <Card title="Evolución mensual de compras" subtitle={`Año ${year}`} delay={300} className="h-full">
            {isEmpty ? <Empty msg="Sin datos de compras para este año" /> :
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FFC107" stopOpacity={.35} />
                                <stop offset="95%" stopColor="#FFC107" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={formatCOP} width={50} />
                        <Tooltip content={<Tip isMoney />} />
                        <Area type="monotone" dataKey="total" name="Compras" stroke="#FFC107" strokeWidth={2.5} fill="url(#gc)" dot={false} activeDot={{ r: 5, fill: "#FFC107", stroke: "#fff", strokeWidth: 2 }} />
                    </AreaChart>
                </ResponsiveContainer>
            }
        </Card>
    );
};