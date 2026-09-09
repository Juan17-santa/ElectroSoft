// Importamos herramientas de React Testing Library para probar el hook.
// - renderHook: permite ejecutar el hook sin crear un componente visual.
// - act: permite realizar acciones que modifican el estado de React.
// - waitFor: permite esperar resultados de operaciones asíncronas.
import { act, renderHook, waitFor } from "@testing-library/react";

import useProductCategoryModal from "../feature/dashboard/pages/productCategory/hooks/UseProductCategoryModal";
import { ServiceProductCategory } from "../feature/dashboard/pages/productCategory/services/ServicesProductCategory";


// SIMULACIÓN DEL SERVICIO
// Reemplazamos temporalmente el servicio real por funciones simuladas.
// De esta forma, las pruebas NO llaman al backend ni a la API real.
jest.mock("../feature/dashboard/pages/productCategory/services/ServicesProductCategory", () => ({
    ServiceProductCategory: {

        // jest.fn() crea funciones simuladas que podemos controlar y comprobar si fueron llamadas.
        get: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));


// FUNCIÓN AUXILIAR PARA PREPARAR EL HOOK
// Creamos una función reutilizable para evitar repetir la misma
// configuración en cada prueba.
const renderCategoryHook = async (options = {}) => {

    // renderHook ejecuta directamente el hook que queremos probar.
    // También simulamos los callbacks que recibe el hook.
    const hook = renderHook(() =>
        useProductCategoryModal({
            mode: "create",
            onSuccess: jest.fn(),
            onClose: jest.fn(),
            ...options,
        })
    );

    // Esperamos hasta comprobar que el hook realizó la llamada
    // inicial al servicio para obtener las categorías.
    await waitFor(() => {
        expect(ServiceProductCategory.get).toHaveBeenCalled();
    });

    // Esperamos a que termine la promesa devuelta por el servicio simulado.
    await act(async () => {
        await ServiceProductCategory.get.mock.results[0].value;
    });

    // Devolvemos el resultado del hook para poder utilizarlo en los tests.
    return hook;
};


// PREPARACIÓN ANTES DE CADA PRUEBA
beforeEach(() => {

    // Limpiamos el historial de llamadas de todos los mocks.
    // Así una prueba no afecta a la siguiente.
    jest.clearAllMocks();

    // Simulamos una respuesta exitosa al consultar las categorías.
    ServiceProductCategory.get.mockResolvedValue([]);

    // Simulamos una respuesta exitosa al crear una categoría.
    ServiceProductCategory.create.mockResolvedValue({
        id: "category-123",
        name: "Tecnologia",
    });
});


// AGRUPACIÓN GENERAL DE LAS PRUEBAS
// describe permite organizar pruebas relacionadas
// bajo un mismo bloque.
describe("useProductCategoryModal", () => {

    // GRUPO: ESTADO INICIAL
    describe("Estado inicial", () => {

        // test define un caso de prueba individual.
        test("inicia el formulario vacío", async () => {

            const { result } = await renderCategoryHook();

            // expect indica qué resultado esperamos.
            // toEqual compara objetos completos.
            expect(result.current.formData).toEqual({
                name: "",
                description: "",
                status: true,
            });

            expect(result.current.errors).toEqual({});
        });
    });


    // GRUPO: VALIDACIÓN DEL NOMBRE
    describe("Validación del nombre", () => {

        // CASO 1: CAMPO VACÍO
        test("muestra error cuando el nombre está vacío", async () => {
            const { result } = await renderCategoryHook();

            act(() => {
                result.current.handleChange({
                    target: { name: "name", value: "" },
                });
            });

            // Comprobamos que aparezca exactamente el mensaje esperado.
            expect(result.current.errors.name).toBe(
                "El nombre es obligatorio"
            );
        });


        // CASO 2: NÚMEROS EN EL NOMBRE
        test("muestra error cuando el nombre contiene números", async () => {
            const { result } = await renderCategoryHook();

            act(() => {
                result.current.handleChange({
                    target: { name: "name", value: "Tecnologia123" },
                });
            });

            expect(result.current.errors.name).toBe(
                "El nombre no puede contener números"
            );
        });


        // CASO 3: MENOS DE 5 CARACTERES
        test("muestra error cuando el nombre tiene menos de 5 caracteres", async () => {
            const { result } = await renderCategoryHook();

            act(() => {
                result.current.handleChange({
                    target: { name: "name", value: "TV" },
                });
            });

            expect(result.current.errors.name).toBe(
                "El nombre debe tener mínimo 5 caracteres"
            );
        });


        // CASO 4: NOMBRE VÁLIDO
        test("acepta un nombre válido", async () => {
            const { result } = await renderCategoryHook();

            act(() => {
                result.current.handleChange({
                    target: { name: "name", value: "Tecnologia" },
                });
            });

            // Comprobamos que el dato sí fue guardado.
            expect(result.current.formData.name).toBe("Tecnologia");
            expect(result.current.errors.name).toBe("");
        });


        // CASO 5: CATEGORÍA REPETIDA
        test("muestra error cuando la categoría ya existe", async () => {

            // En esta prueba cambiamos la respuesta del servicio simulado.
            // Ahora simulamos que ya existe una categoría llamada Tecnologia.
            ServiceProductCategory.get.mockResolvedValue([
                { id: "category-1", name: "Tecnologia" },
            ]);

            const { result } = await renderCategoryHook();

            act(() => {
                result.current.handleChange({
                    target: { name: "name", value: "tecnologia" },
                });
            });

            // Como la comprobación es asíncrona, esperamos hasta que
            // el hook actualice el mensaje de error.
            await waitFor(() => {
                expect(result.current.errors.name).toBe(
                    "Esta categoría ya se encuentra registrada"
                );
            });
        });
    });
});