import { Search } from "lucide-react";

export default function SearchInput({
    value,
    onChange,
    placeholder,
    className = ""
}) {
    return (
        <div className={`flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2 ${className}`}>
            <Search size={20} className="text-gray-400" />
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full outline-none text-md placeholder-gray-400 bg-transparent"
            />
        </div>
    );
}