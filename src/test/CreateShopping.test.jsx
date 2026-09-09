import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CreateShopping from "../feature/dashboard/pages/shopping/CreateShopping";
import { useShopping } from "../feature/dashboard/pages/shopping/hooks/useShopping";
import { ServicesShopping } from "../feature/dashboard/pages/shopping/services/ServicesShopping";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

jest.mock("../feature/dashboard/pages/shopping/hooks/useShopping", () => ({
    useShopping: jest.fn(),
}));

jest.mock("../feature/dashboard/pages/shopping/services/ServicesShopping", () => ({
    ServicesShopping: {
        fetchProviders: jest.fn(),
        checkInvoiceExists: jest.fn(),
    },
}));

jest.mock("../context/ToastContext", () => ({
    useToast: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

jest.mock("../feature/dashboard/components/ui/CustomSelect", () => ({
    __esModule: true,
    default: ({ label, options, value, onChange }) => (
        <label>
            {label}
            <select
                aria-label={label}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                <option value="">No seleccionado</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    ),
}));

jest.mock("../feature/dashboard/components/ui/Calendar", () => ({
    __esModule: true,
    default: ({ fechaISO, onFechaChange, label }) => (
        <label>
            {label}
            <input
                aria-label={label}
                type="date"
                value={fechaISO}
                onChange={(event) => onFechaChange(event.target.value)}
            />
        </label>
    ),
    formatearFecha: (iso) => {
        if (!iso) return "";
        const [year, month, day] = iso.split("-");
        return `${day}/${month}/${year}`;
    },
}));

jest.mock("../feature/dashboard/components/ui/PrimaryButton", () => ({
    __esModule: true,
    default: ({ children, onClick, disabled }) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock("../feature/dashboard/components/ui/Pagination", () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock("../feature/dashboard/components/ui/ConfirmModal", () => ({
    __esModule: true,
    default: ({ title, message, onConfirm, onCancel }) => (
        <div role="dialog" aria-label={title}>
            <h2>{title}</h2>
            <p>{message}</p>
            <button onClick={onConfirm}>Confirmar</button>
            <button onClick={onCancel}>Cancelar</button>
        </div>
    ),
}));

jest.mock("../feature/dashboard/pages/shopping/components/AddProductModal", () => ({
    __esModule: true,
    default: ({ onCargarCompra, onClose }) => (
        <div role="dialog" aria-label="Añadir producto">
            <button
                onClick={() => onCargarCompra([{
                    id: "product-123",
                    nombre: "Laptop Lenovo",
                    cantidad: 2,
                    precio: 1200000,
                    costeProducto: 75000,
                    precioVenta: 150000,
                    precioVentaOriginal: 150000,
                    subtotal: 150000,
                    usarPrecioSugerido: false,
                    sobreescribirConSugerido: false,
                }])}
            >
                Cargar producto de prueba
            </button>
            <button onClick={onClose}>Cerrar productos</button>
        </div>
    ),
}));

jest.mock("../feature/dashboard/pages/shopping/components/CreateProductModal", () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock("../feature/dashboard/pages/shopping/components/CreateProviderModal", () => ({
    __esModule: true,
    default: () => null,
}));

const provider = {
    id: "provider-123",
    nombreProveedor: "Proveedor Central",
    estado: true,
};

const todayISO = new Date().toISOString().split("T")[0];
const todayAsDisplayed = todayISO.split("-").reverse().join("/");

const fillRequiredFields = async () => {
    await waitFor(() => {
        expect(screen.getByRole("option", { name: provider.nombreProveedor })).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText("Proveedor *"), {
        target: { value: provider.id },
    });
    fireEvent.change(screen.getByLabelText("Fecha Factura"), {
        target: { value: todayISO },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej: 12345"), {
        target: { value: "12345" },
    });
};

const openProductLoader = () => {
    fireEvent.click(screen.getByRole("button", { name: "Añadir producto" }));
    fireEvent.click(screen.getByRole("button", { name: "Cargar producto de prueba" }));
};

beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(jest.fn());
    useToast.mockReturnValue({ showToast: jest.fn() });
    useShopping.mockReturnValue({
        guardarCompra: jest.fn().mockResolvedValue({ id: "shopping-123" }),
        saving: false,
    });
    ServicesShopping.fetchProviders.mockResolvedValue([provider]);
    ServicesShopping.checkInvoiceExists.mockResolvedValue(false);
});

describe("CreateShopping", () => {
    describe("Estado inicial del formulario", () => {
        test("inicia vacío y sin productos", async () => {
            render(<CreateShopping />);

            await waitFor(() => {
                expect(screen.getByRole("option", { name: provider.nombreProveedor })).toBeInTheDocument();
            });

            expect(screen.getByLabelText("Proveedor *")).toHaveValue("");
            expect(screen.getByLabelText("Fecha Factura")).toHaveValue("");
            expect(screen.getByPlaceholderText("Ej: 12345")).toHaveValue("");
            expect(screen.getByText("Añade productos a la compra.")).toBeInTheDocument();
        });
    });

    describe("Validación de proveedor", () => {
        test("muestra error cuando no se selecciona un proveedor", async () => {
            render(<CreateShopping />);

            await waitFor(() => {
                expect(screen.getByRole("option", { name: provider.nombreProveedor })).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole("button", { name: "Crear Compra" }));

            expect(await screen.findByText("Debes seleccionar un proveedor.")).toBeInTheDocument();
        });

        test("acepta un proveedor válido", async () => {
            render(<CreateShopping />);

            await waitFor(() => {
                expect(screen.getByRole("option", { name: provider.nombreProveedor })).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText("Proveedor *"), {
                target: { value: provider.id },
            });

            expect(screen.getByLabelText("Proveedor *")).toHaveValue(provider.id);
            expect(screen.getByText("Listo")).toBeInTheDocument();
        });
    });

    describe("Validación de fecha", () => {
        test("muestra error cuando no se selecciona una fecha", async () => {
            render(<CreateShopping />);

            fireEvent.click(screen.getByRole("button", { name: "Crear Compra" }));

            expect(await screen.findByText("Debes seleccionar una fecha.")).toBeInTheDocument();
        });

        test("no permite seleccionar una fecha futura", async () => {
            render(<CreateShopping />);

            await waitFor(() => {
                expect(screen.getByRole("option", { name: provider.nombreProveedor })).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText("Proveedor *"), {
                target: { value: provider.id },
            });
            fireEvent.change(screen.getByLabelText("Fecha Factura"), {
                target: { value: "2999-12-31" },
            });

            fireEvent.click(screen.getByRole("button", { name: "Crear Compra" }));

            expect(await screen.findByText("Debes seleccionar una fecha.")).toBeInTheDocument();
        });

        test("acepta una fecha válida", async () => {
            render(<CreateShopping />);

            await waitFor(() => {
                expect(screen.getByRole("option", { name: provider.nombreProveedor })).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText("Proveedor *"), {
                target: { value: provider.id },
            });
            fireEvent.change(screen.getByLabelText("Fecha Factura"), {
                target: { value: todayISO },
            });

            expect(screen.getByLabelText("Fecha Factura")).toHaveValue(todayISO);
            expect(screen.getAllByText("Listo").length).toBeGreaterThan(0);
        });
    });

    describe("Validación de número de factura", () => {
        test("muestra error cuando no se ingresa un número de factura", async () => {
            render(<CreateShopping />);

            fireEvent.click(screen.getByRole("button", { name: "Crear Compra" }));

            expect(await screen.findByText("Debes ingresar un número de factura.")).toBeInTheDocument();
        });

        test("elimina caracteres no numéricos del número de factura", async () => {
            render(<CreateShopping />);

            await waitFor(() => {
                expect(screen.getByRole("option", { name: provider.nombreProveedor })).toBeInTheDocument();
            });

            const invoiceInput = screen.getByPlaceholderText("Ej: 12345");
            fireEvent.change(invoiceInput, { target: { value: "FAC-12A3" } });

            expect(invoiceInput).toHaveValue("123");
        });

        test("rechaza un número de factura repetido para el mismo proveedor", async () => {
            ServicesShopping.checkInvoiceExists.mockResolvedValue(true);
            render(<CreateShopping />);

            await fillRequiredFields();
            fireEvent.click(screen.getByRole("button", { name: "Crear Compra" }));

            expect(await screen.findByText("Este numero de factura ya esta en uso.")).toBeInTheDocument();
            expect(ServicesShopping.checkInvoiceExists).toHaveBeenCalledWith("12345", provider.id);
            expect(useShopping.mock.results[0].value.guardarCompra).not.toHaveBeenCalled();
        });

        test("acepta un número de factura disponible", async () => {
            render(<CreateShopping />);

            await fillRequiredFields();
            expect(screen.getByPlaceholderText("Ej: 12345")).toHaveValue("12345");
            expect(ServicesShopping.checkInvoiceExists).not.toHaveBeenCalled();
        });
    });

    describe("Validación de productos", () => {
        test("muestra error cuando no se agregan productos", async () => {
            render(<CreateShopping />);

            await fillRequiredFields();
            fireEvent.click(screen.getByRole("button", { name: "Crear Compra" }));

            expect(await screen.findByRole("heading", { name: "Sin productos" })).toBeInTheDocument();
            expect(screen.getByText("Debes añadir al menos un producto activo a la compra.")).toBeInTheDocument();
            expect(useShopping.mock.results[0].value.guardarCompra).not.toHaveBeenCalled();
        });

        test("acepta productos agregados a la compra", async () => {
            render(<CreateShopping />);

            await fillRequiredFields();
            openProductLoader();

            expect(screen.getByText("Laptop Lenovo")).toBeInTheDocument();
            expect(screen.queryByText("Añade productos a la compra.")).not.toBeInTheDocument();
        });
    });

    describe("Creación de la compra", () => {
        test("rechaza la compra cuando faltan datos obligatorios", async () => {
            render(<CreateShopping />);

            fireEvent.click(screen.getByRole("button", { name: "Crear Compra" }));

            expect(await screen.findByText("Debes seleccionar un proveedor.")).toBeInTheDocument();
            expect(screen.getByText("Debes seleccionar una fecha.")).toBeInTheDocument();
            expect(screen.getByText("Debes ingresar un número de factura.")).toBeInTheDocument();
            expect(useShopping.mock.results[0].value.guardarCompra).not.toHaveBeenCalled();
        });

        test("solicita confirmación antes de guardar una compra válida", async () => {
            render(<CreateShopping />);

            await fillRequiredFields();
            openProductLoader();
            fireEvent.click(screen.getByRole("button", { name: "Crear Compra" }));

            expect(await screen.findByRole("heading", { name: "Confirmar compra" })).toBeInTheDocument();
            expect(screen.getByText(/¿Confirmar la compra de 1 producto/)).toBeInTheDocument();
            expect(useShopping.mock.results[0].value.guardarCompra).not.toHaveBeenCalled();
        });

        test("acepta y guarda la compra cuando todo es válido", async () => {
            const guardarCompra = jest.fn().mockResolvedValue({ id: "shopping-123" });
            useShopping.mockReturnValue({ guardarCompra, saving: false });
            render(<CreateShopping />);

            await fillRequiredFields();
            openProductLoader();
            fireEvent.click(screen.getByRole("button", { name: "Crear Compra" }));
            fireEvent.click(await screen.findByRole("button", { name: "Confirmar" }));

            await waitFor(() => {
                expect(guardarCompra).toHaveBeenCalledWith({
                    numeroFactura: "12345",
                    fechaFactura: todayAsDisplayed,
                    proveedor: provider.nombreProveedor,
                    proveedorId: provider.id,
                    total: 150000,
                    productos: [{
                        id: "product-123",
                        nombre: "Laptop Lenovo",
                        cantidad: 2,
                        precio: 1200000,
                        costeProducto: 75000,
                        precioVenta: 150000,
                        precioVentaOriginal: 150000,
                        subtotal: 150000,
                        sobreescribirConSugerido: false,
                        usarPrecioSugerido: false,
                    }],
                });
            });
        });
    });
});
