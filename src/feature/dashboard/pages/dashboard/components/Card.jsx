export const Card = ({ title, subtitle, children, delay = 0, className = "", action }) => {
    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col ${className}`}
            style={{ animation: "kpiFadeUp .6s ease both", animationDelay: `${delay}ms` }}>
            <div className="mb-4 shrink-0 flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-800">{title}</p>
                    {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}