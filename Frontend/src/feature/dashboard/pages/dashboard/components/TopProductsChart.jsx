import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card } from './Card';
import { Empty, Tip } from './Ui';

export const TopProductsChart = ({ data, monthName }) => {
    return (
        <Card title="Productos más vendidos" subtitle={`Top ${Math.min(data.length || 5, 5)} · ${monthName}`} delay={360} className="h-full">
            {data.length === 0 ? <Empty msg="Sin ventas en este período" /> :
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barCategoryGap="30%">
                        <defs>
                            <linearGradient id="gb" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#FFC107" />
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
    );
};