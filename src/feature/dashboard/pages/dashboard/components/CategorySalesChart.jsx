import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from './Card';
import { Empty } from './ui';
import { DONUT_COLORS } from '../utils/constants';

export const CategorySalesChart = ({ data, monthName, year, total }) => {
    return (
        <Card title="Ventas por categoría" subtitle={`${monthName} ${year}`} delay={420} className="h-full">
            {data.length === 0 ? <Empty msg="Sin datos de categorías" /> : (
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={68} 
                                     paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                                    {data.map((_, i) => (
                                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v, _name, props) => [`${v} uds`, props.payload?.name || ""]}
                                         contentStyle={{ fontSize: 12, borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2 shrink-0">
                        {data.slice(0, 5).map((d, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                                    <span className="text-[11px] text-gray-500 truncate max-w-25">{d.name}</span>
                                </div>
                                <span className="text-[11px] font-semibold text-gray-700">
                                    {total ? Math.round(d.value / total * 100) : 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};