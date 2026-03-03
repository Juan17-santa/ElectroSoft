import { useState, useEffect } from "react";
import { ServicesProviders } from "../services/ServicesProviders";

export function useProviders() {
    const [proveedores, setProveedores] = useState([]);

    useEffect(() => {
        const data = ServicesProviders.get();
        setProveedores(data);
    }, []);

    return { proveedores };
}
