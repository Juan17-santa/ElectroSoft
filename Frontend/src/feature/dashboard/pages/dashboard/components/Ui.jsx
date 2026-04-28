import { AlertCircle } from 'lucide-react';
import { formatFull } from '../utils/constants';

export const Empty = ({ msg }) => (
    <div className="flex flex-col items-center justify-center flex-1 gap-2 text-gray-300 min-h-30">
        <AlertCircle size={26} />
        <p className="text-xs text-gray-400">{msg}</p>
    </div>
);

export const Tip = ({ active, payload, label, isMoney = true }) => {
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