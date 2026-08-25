export const AVATAR_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const AVATAR_COLORS = [
    { id: "blue", value: "#273bf1", label: "Azul" },
    { id: "red", value: "#f02d2d", label: "Rojo" },
    { id: "teal", value: "#14b8a6", label: "Turquesa" },
    { id: "green", value: "#1bd43a", label: "Verde" },
    { id: "orange", value: "#e98c13", label: "Naranja" },
    { id: "yellow", value: "#facc15", label: "Amarillo" },
    { id: "pink", value: "#ec4899", label: "Rosa" },
    { id: "purple", value: "#a523e0", label: "Morado" },
];

export const DEFAULT_AVATAR_LETTER = "A";
export const DEFAULT_AVATAR_COLOR = AVATAR_COLORS[0].value;

export function getAvatarColor(color) {
    return AVATAR_COLORS.find(option => option.value === color)?.value || DEFAULT_AVATAR_COLOR;
}

export function getAvatarBorderColor(color) {
    const hex = getAvatarColor(color).replace("#", "");
    const channels = [0, 2, 4].map(index => Math.max(0, parseInt(hex.slice(index, index + 2), 16) - 45));
    return `#${channels.map(channel => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function getAvatarLetter(letter, fallback = "A") {
    const normalized = String(letter || fallback).toUpperCase();
    return AVATAR_LETTERS.includes(normalized) ? normalized : fallback;
}