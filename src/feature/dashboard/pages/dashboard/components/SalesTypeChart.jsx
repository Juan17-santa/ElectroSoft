import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from './Card';
import { Empty } from './Ui';
import { formatFull, DONUT_COLORS } from '../utils/constants';

const ACCENT = "#3b82f6";

export const SalesTypeChart = ({ data, monthName, year }) => {
    const total = data.reduce((a, d) => a + d.value, 0);

    return (
        <Card title="Ventas por tipo de pago" subtitle={`${monthName} ${year}`} className="h-full flex-1 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-2xl"
                style={{ background: `linear-gradient(to bottom, ${ACCENT} 0%, ${ACCENT}99 40%, ${ACCENT}33 75%, transparent 100%)` }} />
            {data.length === 0 ? <Empty msg="Sin ventas en este período" /> : (
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                            initialDimension={{ width: 1, height: 1 }}
                        >
                            <PieChart>
                                <Pie data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={72}
                                     paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                                    {data.map((_, i) => (
                                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v, _name, props) => [formatFull(v), props.payload?.name || ""]}
                                         contentStyle={{ fontSize: 12, borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2 shrink-0">
                        {data.slice(0, 4).map((d, i) => (
                            <div key={i} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                                    <span className="text-[11px] text-gray-500 truncate">{d.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[11px] font-semibold text-gray-700 tabular-nums">{formatFull(d.value)}</span>
                                    <span className="text-[10px] text-gray-400 tabular-nums">{total ? Math.round(d.value / total * 100) : 0}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};
