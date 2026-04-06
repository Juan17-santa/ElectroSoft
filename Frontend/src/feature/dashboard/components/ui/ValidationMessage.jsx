import { AlertCircle, CheckCircle } from "lucide-react";

export default function ValidationMessage({ error, success, successMessage }) {

    if (error) {
        return (
            <p className="flex items-center gap-2 text-red-500 text-xs mt-1">
                <AlertCircle size={14} />
                {error}
            </p>
        );
    }

    if (success) {
        return (
            <p className="flex items-center gap-2 text-green-500 text-xs mt-1">
                <CheckCircle size={14} />
                {successMessage}
            </p>
        );
    }

    return null;
}