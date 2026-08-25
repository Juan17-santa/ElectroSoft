import { DEFAULT_AVATAR_COLOR, getAvatarBorderColor, getAvatarColor, getAvatarLetter } from "../utils/avatarOptions";

export default function AvatarBadge({ letter, color, size = "md", className = "" }) {
    const sizes = {
        sm: "w-9 h-9 text-base",
        md: "w-16 h-16 text-2xl",
        lg: "w-24 h-24 text-4xl",
    };

    return (
        <div
            className={`${sizes[size] || sizes.md} rounded-full flex items-center justify-center text-white font-bold shadow-md ${className}`}
            style={{
                backgroundColor: getAvatarColor(color) || DEFAULT_AVATAR_COLOR,
                border: `2px solid ${getAvatarBorderColor(color)}`,
            }}
            aria-label={`Avatar ${getAvatarLetter(letter)}`}
        >
            {getAvatarLetter(letter)}
        </div>
    );
}