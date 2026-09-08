import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserForm } from "../feature/dashboard/pages/users/hooks/useUserForm";
import { usersService } from "../feature/dashboard/pages/users/services/usersService";
import api from "../utils/api.js";

// ======================================================
// MOCKS
// ======================================================

jest.mock("../feature/dashboard/pages/users/services/usersService", () => ({
    usersService: {
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock("../utils/api.js", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
    },
}));

const mockShowToast = jest.fn();

jest.mock("../context/ToastContext", () => ({
    useToast: () => ({
        showToast: mockShowToast,
    }),
}));

// ======================================================
// DATOS DE PRUEBA
// ======================================================

const validUser = {
    tipoDoc: "1",
    documento: "12345678",
    nombre: "Deivis",
    email: "deivis@gmail.com",
    telefono: "3001234567",
    rol: "2",
    estado: true,
};

const userToEdit = {
    id: "user-123",
    tipoDoc: 1,
    documento: "12345678",
    nombre: "Deivis",
    email: "deivis@gmail.com",
    telefono: "3001234567",
    rol: 2,
    estado: true,
};

// ======================================================
// LIMPIEZA
// ======================================================

beforeEach(() => {
    jest.clearAllMocks();

    api.get.mockResolvedValue({
        data: {
            exists: false,
        },
    });

    usersService.create.mockResolvedValue({
        id: "new-user",
    });

    usersService.update.mockResolvedValue({
        id: "user-123",
    });

    jest.useFakeTimers();
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

// ======================================================
// TESTS
// ======================================================

describe("useUserForm", () => {

    // ==================================================
    // 1. ESTADO INICIAL
    // ==================================================

    describe("Estado inicial", () => {
        test("inicia el formulario vacío", () => {
            const { result } = renderHook(() =>
                useUserForm({ userToEdit: undefined })
            );

            expect(result.current.formData).toEqual({
                tipoDoc: "",
                documento: "",
                nombre: "",
                email: "",
                telefono: "",
                rol: "",
                estado: true,
            });

            expect(result.current.errors).toEqual({});
            expect(result.current.loading).toBe(false);
        });
    });

    // ==================================================
    // 2. CARGA DE USUARIO PARA EDITAR
    // ==================================================

    describe("Carga de usuario para editar", () => {
        test("carga correctamente los datos del usuario", async () => {
            const { result } = renderHook(() =>
                useUserForm({ userToEdit })
            );

            await waitFor(() => {
                expect(result.current.formData).toEqual({
                    id: "user-123",
                    tipoDoc: "1",
                    documento: "12345678",
                    nombre: "Deivis",
                    email: "deivis@gmail.com",
                    telefono: "3001234567",
                    rol: "2",
                    estado: true,
                });
            });
        });
    });

    // ==================================================
    // 3. TIPO DE DOCUMENTO
    // ==================================================

    describe("Validación de tipo de documento", () => {
        test("muestra error cuando no se selecciona tipo de documento", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "tipoDoc",
                        value: "",
                    },
                });
            });

            expect(result.current.errors.tipoDoc).toBe(
                "Seleccione un tipo de documento"
            );
        });

        test("acepta un tipo de documento válido", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "tipoDoc",
                        value: "1",
                    },
                });
            });

            expect(result.current.formData.tipoDoc).toBe("1");
            expect(result.current.errors.tipoDoc).toBe("");
        });
    });

    // ==================================================
    // 4. DOCUMENTO
    // ==================================================

    describe("Validación de documento", () => {
        test("muestra error cuando el documento está vacío", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "documento",
                        value: "",
                    },
                });
            });

            expect(result.current.errors.documento).toBe(
                "El documento es obligatorio"
            );
        });

        test("muestra error cuando el documento tiene menos de 8 dígitos", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "documento",
                        value: "1234567",
                    },
                });
            });

            expect(result.current.errors.documento).toBe(
                "Mínimo 8 dígitos"
            );
        });

        test("acepta un documento de 8 dígitos", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "documento",
                        value: "12345678",
                    },
                });
            });

            expect(result.current.formData.documento).toBe("12345678");
            expect(result.current.errors.documento).toBe("");
        });

        test("acepta un documento de hasta 12 dígitos", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "documento",
                        value: "123456789012",
                    },
                });
            });

            expect(result.current.formData.documento).toBe("123456789012");
            expect(result.current.errors.documento).toBe("");
        });

        test("limita el documento a máximo 12 caracteres", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "documento",
                        value: "123456789012345",
                    },
                });
            });

            expect(result.current.formData.documento).toBe("123456789012");
        });

        test("elimina caracteres no numéricos del documento", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "documento",
                        value: "123abc45678",
                    },
                });
            });

            expect(result.current.formData.documento).toBe("12345678");
            expect(result.current.errors.documento).toBe("");
        });

        test("detecta cuando el documento ya está registrado", async () => {
            api.get.mockResolvedValueOnce({
                data: {
                    exists: true,
                },
            });

            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "documento",
                        value: "12345678",
                    },
                });
            });

            await act(async () => {
                jest.advanceTimersByTime(600);
            });

            await waitFor(() => {
                expect(result.current.errors.documento).toBe(
                    "Este documento ya está registrado"
                );
            });

            expect(api.get).toHaveBeenCalledWith(
                "/users/check-document",
                {
                    params: {
                        document: "12345678",
                    },
                }
            );
        });

        test("permite el documento cuando no está registrado", async () => {
            api.get.mockResolvedValueOnce({
                data: {
                    exists: false,
                },
            });

            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "documento",
                        value: "12345678",
                    },
                });
            });

            await waitFor(
                () => {
                    expect(result.current.errors.documento).toBe("");
                },
                {
                    timeout: 1500,
                }
            );
        });

        test("si falla la consulta del documento, no muestra error de duplicado", async () => {
            api.get.mockRejectedValueOnce(
                new Error("Error de conexión")
            );

            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "documento",
                        value: "12345678",
                    },
                });
            });

            await waitFor(
                () => {
                    expect(result.current.errors.documento).toBe("");
                },
                {
                    timeout: 1500,
                }
            );
        });

    });

    // ==================================================
    // 5. NOMBRE
    // ==================================================

    describe("Validación de nombre", () => {
        test("muestra error cuando el nombre está vacío", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "nombre",
                        value: "",
                    },
                });
            });

            expect(result.current.errors.nombre).toBe(
                "El nombre es obligatorio"
            );
        });

        test("acepta un nombre válido", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "nombre",
                        value: "Deivis",
                    },
                });
            });

            expect(result.current.formData.nombre).toBe("Deivis");
            expect(result.current.errors.nombre).toBe("");
        });

        test("detecta caracteres no permitidos en el nombre", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "nombre",
                        value: "Deivis123",
                    },
                });
            });

            expect(result.current.errors.nombre).toBe("Solo letras permitidas");
        });

    });

    // ==================================================
    // 6. EMAIL
    // ==================================================

    describe("Validación de email", () => {
        test("muestra error cuando el email está vacío", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "email",
                        value: "",
                    },
                });
            });

            expect(result.current.errors.email).toBe("El email es obligatorio");
        });

        test("muestra error cuando el formato del email es inválido", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "email",
                        value: "correo-invalido",
                    },
                });
            });

            expect(result.current.errors.email).toBe("Formato inválido");
        });

        test("acepta un email válido", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "email",
                        value: "deivis@gmail.com",
                    },
                });
            });

            expect(result.current.formData.email).toBe("deivis@gmail.com");
            expect(result.current.errors.email).toBe("");
        });

        test("detecta cuando el email ya está registrado", async () => {
            api.get.mockResolvedValueOnce({
                data: {
                    exists: true,
                },
            });

            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "email",
                        value: "juan@gmail.com",
                    },
                });
            });

            await act(async () => {
                jest.advanceTimersByTime(600);
            });

            await waitFor(() => {
                expect(result.current.errors.email).toBe(
                    "Este email ya está registrado"
                );
            });

            expect(api.get).toHaveBeenCalledWith(
                "/users/check-email",
                {
                    params: {
                        email: "juan@gmail.com",
                    },
                }
            );
        });

        test("permite el email cuando no está registrado", async () => {
            api.get.mockResolvedValueOnce({
                data: {
                    exists: false,
                },
            });

            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "email",
                        value: "nuevo@gmail.com",
                    },
                });
            });

            await waitFor(
                () => {
                    expect(result.current.errors.email).toBe("");
                },
                {
                    timeout: 1500,
                }
            );
        });

        test("si falla la consulta del email, no muestra error de duplicado", async () => {
            api.get.mockRejectedValueOnce(
                new Error("Error de conexión")
            );

            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "email",
                        value: "deivis@gmail.com",
                    },
                });
            });

            await waitFor(
                () => {
                    expect(result.current.errors.email).toBe("");
                },
                {
                    timeout: 1500,
                }
            );
        });

    });

    // ==================================================
    // 7. TELÉFONO
    // ==================================================

    describe("Validación de teléfono", () => {
        test("muestra error cuando el teléfono está vacío", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "telefono",
                        value: "",
                    },
                });
            });

            expect(result.current.errors.telefono).toBe("El teléfono es obligatorio");
        });

        test("muestra error cuando el teléfono tiene menos de 7 dígitos", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "telefono",
                        value: "123456",
                    },
                });
            });

            expect(result.current.errors.telefono).toBe("Mínimo 7 dígitos");
        });

        test("acepta un teléfono válido", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "telefono",
                        value: "3001234567",
                    },
                });
            });

            expect(result.current.formData.telefono).toBe("3001234567");
            expect(result.current.errors.telefono).toBe("");
        });

        test("limita el teléfono a máximo 14 dígitos", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "telefono",
                        value: "123456789012345678",
                    },
                });
            });

            expect(result.current.formData.telefono).toBe("12345678901234");
        });

        test("elimina caracteres no numéricos del teléfono", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "telefono",
                        value: "300-123-4567",
                    },
                });
            });

            expect(result.current.formData.telefono).toBe("3001234567");
            expect(result.current.errors.telefono).toBe("");
        });

    });

    // ==================================================
    // 8. ROL
    // ==================================================

    describe("Validación de rol", () => {
        test("muestra error cuando no se selecciona un rol", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "rol",
                        value: "",
                    },
                });
            });

            expect(result.current.errors.rol).toBe("Seleccione un rol");
        });

        test("acepta un rol válido", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "rol",
                        value: "2",
                    },
                });
            });

            expect(result.current.formData.rol).toBe("2");
            expect(result.current.errors.rol).toBe("");
        });

    });

    // ==================================================
    // 9. VALIDACIÓN COMPLETA DEL FORMULARIO
    // ==================================================

    describe("validateForm", () => {
        test("rechaza el formulario cuando faltan campos", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            let isValid;

            act(() => {
                isValid = result.current.validateForm();
            });

            expect(isValid).toBe(false);

            expect(result.current.errors).toEqual({
                tipoDoc: "Seleccione un tipo de documento",
                documento: "El documento es obligatorio",
                nombre: "El nombre es obligatorio",
                email: "El email es obligatorio",
                telefono: "El teléfono es obligatorio",
                rol: "Seleccione un rol",
            });
        });

        test("acepta el formulario cuando todos los campos son válidos", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "tipoDoc",
                        value: validUser.tipoDoc,
                    },
                });

                result.current.handleChange({
                    target: {
                        name: "documento",
                        value: validUser.documento,
                    },
                });

                result.current.handleChange({
                    target: {
                        name: "nombre",
                        value: validUser.nombre,
                    },
                });

                result.current.handleChange({
                    target: {
                        name: "email",
                        value: validUser.email,
                    },
                });

                result.current.handleChange({
                    target: {
                        name: "telefono",
                        value: validUser.telefono,
                    },
                });

                result.current.handleChange({
                    target: {
                        name: "rol",
                        value: validUser.rol,
                    },
                });
            });

            let isValid;

            act(() => {
                isValid = result.current.validateForm();
            });

            expect(isValid).toBe(true);
            expect(result.current.errors).toEqual({});
        });

    });

    // ==================================================
    // 10. CREAR USUARIO
    // ==================================================

    describe("createUser", () => {
        test("crea correctamente un usuario", async () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            // Primero llenamos el formulario
            act(() => {
                result.current.handleChange({
                    target: {
                        name: "tipoDoc",
                        value: validUser.tipoDoc,
                    },
                });

                result.current.handleChange({
                    target: {
                        name: "documento",
                        value: validUser.documento,
                    },
                });

                result.current.handleChange({
                    target: {
                        name: "nombre",
                        value: validUser.nombre,
                    },
                });

                result.current.handleChange({
                    target: {
                        name: "email",
                        value: validUser.email,
                    },
                });

                result.current.handleChange({
                    target: {
                        name: "telefono",
                        value: validUser.telefono,
                    },
                });

                result.current.handleChange({
                    target: {
                        name: "rol",
                        value: validUser.rol,
                    },
                });
            });

            let success;

            await act(async () => {
                success = await result.current.createUser();
            });

            expect(success).toBe(true);

            expect(usersService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    tipoDoc: "1",
                    documento: "12345678",
                    nombre: "Deivis",
                    email: "deivis@gmail.com",
                    telefono: "3001234567",
                    rol: "2",
                })
            );

            expect(mockShowToast).toHaveBeenCalledWith(
                "success",
                "Usuario creado correctamente"
            );

            expect(result.current.loading).toBe(false);
        });

        test("maneja correctamente un error al crear usuario", async () => {
            usersService.create.mockRejectedValueOnce({
                response: {
                    data: {
                        message: "El email ya está registrado",
                    },
                },
            });

            const { result } = renderHook(() =>
                useUserForm({})
            );

            let success;

            await act(async () => {
                success = await result.current.createUser();
            });

            expect(success).toBe(false);

            expect(mockShowToast).toHaveBeenCalledWith(
                "error",
                "El email ya está registrado"
            );

            expect(result.current.loading).toBe(false);
        });

        test("usa mensaje genérico cuando crear usuario falla sin mensaje del servidor", async () => {
            usersService.create.mockRejectedValueOnce(
                new Error("Error desconocido")
            );

            const { result } = renderHook(() =>
                useUserForm({})
            );

            let success;

            await act(async () => {
                success = await result.current.createUser();
            });

            expect(success).toBe(false);

            expect(mockShowToast).toHaveBeenCalledWith(
                "error",
                "Error al crear usuario"
            );

            expect(result.current.loading).toBe(false);
        });

    });

    // ==================================================
    // 11. ACTUALIZAR USUARIO
    // ==================================================

    describe("updateUser", () => {
        test("actualiza correctamente un usuario", async () => {
            const { result } = renderHook(() =>
                useUserForm({ userToEdit })
            );

            await waitFor(() => {
                expect(result.current.formData.id).toBe(
                    "user-123"
                );
            });

            let success;

            await act(async () => {
                success = await result.current.updateUser();
            });

            expect(success).toBe(true);

            expect(usersService.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "user-123",
                    tipoDoc: "1",
                    documento: "12345678",
                    nombre: "Deivis",
                    email: "deivis@gmail.com",
                    telefono: "3001234567",
                    rol: "2",
                })
            );

            expect(mockShowToast).toHaveBeenCalledWith(
                "success",
                "Usuario actualizado correctamente"
            );

            expect(result.current.loading).toBe(false);
        });

        test("maneja correctamente un error al actualizar usuario", async () => {
            usersService.update.mockRejectedValueOnce({
                response: {
                    data: {
                        message: "No se pudo actualizar el usuario",
                    },
                },
            });

            const { result } = renderHook(() =>
                useUserForm({ userToEdit })
            );

            await waitFor(() => {
                expect(result.current.formData.id).toBe(
                    "user-123"
                );
            });

            let success;

            await act(async () => {
                success = await result.current.updateUser();
            });

            expect(success).toBe(false);

            expect(mockShowToast).toHaveBeenCalledWith(
                "error",
                "No se pudo actualizar el usuario"
            );

            expect(result.current.loading).toBe(false);
        });

        test("usa mensaje genérico cuando actualizar usuario falla sin mensaje del servidor", async () => {
            usersService.update.mockRejectedValueOnce(
                new Error("Error desconocido")
            );

            const { result } = renderHook(() =>
                useUserForm({ userToEdit })
            );

            await waitFor(() => {
                expect(result.current.formData.id).toBe(
                    "user-123"
                );
            });

            let success;

            await act(async () => {
                success = await result.current.updateUser();
            });

            expect(success).toBe(false);

            expect(mockShowToast).toHaveBeenCalledWith(
                "error",
                "Error al actualizar usuario"
            );

            expect(result.current.loading).toBe(false);
        });

    });

    // ==================================================
    // 12. RESET
    // ==================================================

    describe("resetForm", () => {
        test("restablece el formulario a sus valores iniciales", () => {
            const { result } = renderHook(() =>
                useUserForm({})
            );

            act(() => {
                result.current.handleChange({
                    target: {
                        name: "nombre",
                        value: "Deivis",
                    },
                });

                result.current.handleChange({
                    target: {
                        name: "email",
                        value: "deivis@gmail.com",
                    },
                });
            });

            expect(result.current.formData.nombre).toBe(
                "Deivis"
            );

            act(() => {
                result.current.resetForm();
            });

            expect(result.current.formData).toEqual({
                tipoDoc: "",
                documento: "",
                nombre: "",
                email: "",
                telefono: "",
                rol: "",
                estado: true,
            });

            expect(result.current.errors).toEqual({});
        });
    });
});