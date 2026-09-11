import { renderHook, act, waitFor } from "@testing-library/react";
import { useClientForm } from "../feature/dashboard/pages/Clients/hooks/useClientForm";
import api from "../utils/api.js";

jest.mock("../utils/api.js", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
    },
}));

const validClient = {
    tipoDocumento: "1",
    documento: "12345678",
    nombres: "Mateo",
    apellidos: "Dirgua",
    email: "mateo@gmail.com",
    telefono: "3001234567",
};

const clientToEdit = {
    id: "client-123",
    tipoDocumento: "1",
    documento: "12345678",
    nombres: "Mateo",
    apellidos: "Dirgua",
    email: "mateo@gmail.com",
    telefono: "3001234567",
    totalCompras: 250000,
    estado: true,
};

const changeField = (result, name, value) => {
    act(() => {
        result.current.handleChange({
            target: { name, value },
        });
    });
};

beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { exists: false } });
    jest.useFakeTimers();
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

describe("useClientForm", () => {
    describe("Estado inicial", () => {
        test("inicia el formulario con los valores predeterminados", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            expect(result.current.formData).toEqual({
                id: "",
                tipoDocumento: "",
                documento: "",
                nombres: "",
                apellidos: "",
                email: "",
                telefono: "",
                totalCompras: 0,
                estado: true,
            });
            expect(result.current.errors).toEqual({
                tipoDocumento: null,
                documento: null,
                nombres: null,
                apellidos: null,
                email: null,
                telefono: null,
            });
            expect(result.current.loading).toBe(false);
        });
    });

    describe("Carga de cliente para editar", () => {
        test("carga correctamente los datos iniciales del cliente", async () => {
            const { result } = renderHook(() =>
                useClientForm({
                    initialData: clientToEdit,
                    onSubmit: jest.fn(),
                })
            );

            await waitFor(() => {
                expect(result.current.formData).toEqual(clientToEdit);
            });

            expect(result.current.tocado).toEqual({
                tipoDocumento: true,
                documento: true,
                nombres: true,
                apellidos: true,
                email: true,
                telefono: true,
            });
        });
    });

    describe("Validación de tipo de documento", () => {
        test("muestra error cuando no se selecciona un tipo de documento", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            act(() => {
                result.current.handleSelectChange("tipoDocumento", "");
            });

            expect(result.current.errors.tipoDocumento).toBe("Seleccione un tipo de documento.");
        });

        test("acepta un tipo de documento válido", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            act(() => {
                result.current.handleSelectChange("tipoDocumento", "1");
            });

            expect(result.current.formData.tipoDocumento).toBe("1");
            expect(result.current.errors.tipoDocumento).toBeNull();
        });
    });

    describe("Validación de documento", () => {
        test("muestra error cuando el documento está vacío", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "documento", "");

            expect(result.current.errors.documento).toBe("El documento es requerido.");
        });

        test("muestra error cuando tiene menos de 8 dígitos", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "documento", "1234567");

            expect(result.current.errors.documento).toBe("Debe tener entre 8 y 12 dígitos.");
        });

        test("acepta un documento entre 8 y 12 dígitos", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "documento", "12345678");

            expect(result.current.formData.documento).toBe("12345678");
            expect(result.current.errors.documento).toBeNull();
        });

        test("limita el documento a 15 caracteres y conserva el error si supera 12 dígitos", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "documento", "123456789012345678");

            expect(result.current.formData.documento).toBe("123456789012345");
            expect(result.current.errors.documento).toBe("Debe tener entre 8 y 12 dígitos.");
        });

        test("elimina caracteres no numéricos del documento", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "documento", "123abc45678");

            expect(result.current.formData.documento).toBe("12345678");
            expect(result.current.errors.documento).toBeNull();
        });

        test("detecta cuando el documento ya está registrado", async () => {
            api.get.mockResolvedValueOnce({ data: { exists: true } });
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "documento", "12345678");

            await act(async () => {
                jest.advanceTimersByTime(600);
                await Promise.resolve();
            });

            await waitFor(() => {
                expect(result.current.errors.documento).toBe(
                    "Este documento ya está registrado"
                );
            }, { timeout: 1500 });

            expect(api.get).toHaveBeenCalledWith(
                "/clients/check-document",
                { params: { document: "12345678" } }
            );
        });
    });

    describe("Validación de nombres y apellidos", () => {
        test("muestra error cuando los nombres están vacíos", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "nombres", "");

            expect(result.current.errors.nombres).toBe("Este campo es requerido.");
        });

        test("muestra error cuando los nombres tienen menos de 3 caracteres", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "nombres", "AB");

            expect(result.current.errors.nombres).toBe("Mínimo 3 caracteres.");
        });

        test("elimina números y acepta nombres válidos", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "nombres", "Mateo123");

            expect(result.current.formData.nombres).toBe("Mateo");
            expect(result.current.errors.nombres).toBeNull();
        });

        test("muestra error cuando los apellidos tienen espacios dobles", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "apellidos", "Dirgua  Perez");

            expect(result.current.errors.apellidos).toBe("No se permiten espacios dobles.");
        });

        test("limita nombres y apellidos a 40 caracteres", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "nombres", "A".repeat(45));

            expect(result.current.formData.nombres).toHaveLength(40);
            expect(result.current.errors.nombres).toBeNull();
        });
    });

    describe("Validación de email", () => {
        test("muestra error cuando el email está vacío", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "email", "");

            expect(result.current.errors.email).toBe("El email es requerido.");
        });

        test("muestra error cuando el formato del email es inválido", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "email", "correo-invalido");

            expect(result.current.errors.email).toBe("Formato de email inválido.");
        });

        test("acepta un email válido", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "email", validClient.email);

            expect(result.current.formData.email).toBe(validClient.email);
            expect(result.current.errors.email).toBeNull();
        });

        test("detecta cuando el email ya está registrado", async () => {
            api.get.mockResolvedValueOnce({ data: { exists: true } });
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "email", "otro@gmail.com");

            await act(async () => {
                jest.advanceTimersByTime(600);
                await Promise.resolve();
            });

            await waitFor(() => {
                expect(result.current.errors.email).toBe(
                    "Este email ya está registrado"
                );
            }, { timeout: 1500 });

            expect(api.get).toHaveBeenCalledWith(
                "/clients/check-email",
                { params: { email: "otro@gmail.com" } }
            );
        });
    });

    describe("Validación de teléfono", () => {
        test("muestra error cuando el teléfono está vacío", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "telefono", "");

            expect(result.current.errors.telefono).toBe("El teléfono es requerido.");
        });

        test("muestra error cuando tiene menos de 8 dígitos", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "telefono", "1234567");

            expect(result.current.errors.telefono).toBe("Debe tener entre 8 y 14 dígitos.");
        });

        test("acepta un teléfono válido", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "telefono", validClient.telefono);

            expect(result.current.formData.telefono).toBe(validClient.telefono);
            expect(result.current.errors.telefono).toBeNull();
        });

        test("elimina caracteres no numéricos del teléfono", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "telefono", "300-123-4567");

            expect(result.current.formData.telefono).toBe("3001234567");
            expect(result.current.errors.telefono).toBeNull();
        });

        test("rechaza un teléfono compuesto por dígitos repetidos", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "telefono", "11111111");

            expect(result.current.errors.telefono).toBe("Número no válido (dígitos repetidos).");
        });
    });

    describe("handleForm", () => {
        test("rechaza el formulario cuando faltan campos", async () => {
            const onSubmit = jest.fn();
            const { result } = renderHook(() => useClientForm({ onSubmit }));

            await act(async () => {
                await result.current.handleForm({
                    preventDefault: jest.fn(),
                });
            });

            expect(onSubmit).not.toHaveBeenCalled();
            expect(result.current.errors).toEqual({
                tipoDocumento: "Seleccione un tipo de documento.",
                documento: "El documento es requerido.",
                nombres: "Este campo es requerido.",
                apellidos: "Este campo es requerido.",
                email: "El email es requerido.",
                telefono: "El teléfono es requerido.",
            });
        });

        test("envía el formulario cuando todos los campos son válidos", async () => {
            const onSubmit = jest.fn().mockResolvedValue(undefined);
            const { result } = renderHook(() => useClientForm({ onSubmit }));

            act(() => {
                result.current.handleSelectChange("tipoDocumento", validClient.tipoDocumento);
                result.current.handleChange({ target: { name: "documento", value: validClient.documento } });
                result.current.handleChange({ target: { name: "nombres", value: validClient.nombres } });
                result.current.handleChange({ target: { name: "apellidos", value: validClient.apellidos } });
                result.current.handleChange({ target: { name: "email", value: validClient.email } });
                result.current.handleChange({ target: { name: "telefono", value: validClient.telefono } });
            });

            await act(async () => {
                await result.current.handleForm({ preventDefault: jest.fn() });
            });

            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining(validClient)
            );
            expect(result.current.loading).toBe(false);
        });
    });

    describe("handleBlur", () => {
        test("valida el campo cuando pierde el foco", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            act(() => {
                result.current.handleBlur({
                    target: { name: "nombres", value: "AB" },
                });
            });

            expect(result.current.errors.nombres).toBe("Mínimo 3 caracteres.");
            expect(result.current.tocado.nombres).toBe(true);
        });
    });

    describe("resetForm", () => {
        test("restablece el formulario y sus estados", () => {
            const { result } = renderHook(() =>
                useClientForm({ onSubmit: jest.fn() })
            );

            changeField(result, "nombres", "Mateo");

            act(() => {
                result.current.resetForm();
            });

            expect(result.current.formData).toEqual({
                id: "",
                tipoDocumento: "",
                documento: "",
                nombres: "",
                apellidos: "",
                email: "",
                telefono: "",
                totalCompras: 0,
                estado: true,
            });
            expect(result.current.errors).toEqual({
                tipoDocumento: null,
                documento: null,
                nombres: null,
                apellidos: null,
                email: null,
                telefono: null,
            });
            expect(result.current.tocado).toEqual({
                tipoDocumento: false,
                documento: false,
                nombres: false,
                apellidos: false,
                email: false,
                telefono: false,
            });
        });
    });
});