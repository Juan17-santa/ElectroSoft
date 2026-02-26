export default function PrimaryButton({
    children,
    onClick,
    icon: Icon,
    type = "button",
    disabled = false,
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
        flex items-center justify-center gap-2
        px-6 py-2 text-sm rounded-lg shadow-md font-medium transition
        ${disabled
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-linear-to-r from-white to-yellow-300 hover:shadow-lg cursor-pointer"
                }
      `}
        >
            {Icon && <Icon size={18} />}
            {children}
        </button>
    );
}