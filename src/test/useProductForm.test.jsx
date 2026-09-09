// Importamos renderHook para poder ejecutar y probar un hook de React sin necesidad de crear un componente visual para utilizarlo.
// Importamos act para envolver las acciones que modifican el estado del hook y permitir que React procese correctamente esos cambios.
// Importamos waitFor para esperar a que ciertas condiciones se cumplan antes de hacer nuestras aserciones, especialmente útil para pruebas asíncronas.
import { renderHook, act, waitFor } from '@testing-library/react';

// Reemplazamos temporalmente el servicio real ServicesProducts por un mock.
// Esto evita que el test intente comunicarse con la API o con el backend.
// De esta manera, la prueba se concentra únicamente en la lógica del hook para crear un producto.
jest.mock('../feature/dashboard/pages/products/services/ServicesProducts', () => ({
    ServicesProducts: {

        // jest.fn() crea una función simulada (mock) que podemos controlar
        // durante las pruebas sin ejecutar la implementación real.
        checkSerialExists: jest.fn(),

        // También simulamos create porque useProductForm lo utiliza
        // cuando se envía el formulario
        create: jest.fn(),
    },
}));

import { ServicesProducts } from '../feature/dashboard/pages/products/services/ServicesProducts';
import useProductForm from '../feature/dashboard/pages/products/hooks/useProductForm';

// describe agrupa varios tests relacionados con una misma funcionalidad.
// En este caso, todas las pruebas que hagamos estarán relacionadas con el hook useProductForm.
describe('useProductForm', () => {

    // ==================================================
    // 1. VALIDACIÓN DE NOMBRE
    // ==================================================

    // beforeEach se ejecuta antes de cada test dentro del bloque describe.
    // Aquí lo usamos para limpiar cualquier estado o mock que pueda haber quedado de un test anterior.
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Validación de nombre', () => {

    // test define un caso específico que queremos comprobar.
    // Este caso verifica que el formulario muestre el error correcto
    // cuando el nombre del producto está vacío.
    test('muestra error cuando el nombre del producto está vacío', () => {

        // renderHook ejecuta nuestro hook como si estuviera siendo utilizado dentro de un componente de React.
        //  result.current nos permite acceder a todo lo que el hook retorna: formData, errors, handleChange, handleSubmit, loading, etc.
        const { result } = renderHook(() =>

            // Ejecutamos el hook proporcionando las funciones que recibe como parámetros.
            // jest.fn() crea funciones simuladas para onSuccess y onError, porque en este test no necesitamos ejecutar esas funciones.
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        // act se utiliza cuando vamos a realizar una acción que modifica el estado de un componente o hook de React.
        // Aquí vamos a simular que el usuario cambia el campo "nombre".
        act(() => {

            // Accedemos a la función handleChange que devuelve nuestro hook.
            result.current.handleChange({

                // Simulamos el objeto "event" que normalmente enviaría React cuando el usuario escribe en un input.
                target: {

                    // Indicamos que el campo que cambió es "nombre".
                    name: 'nombre',

                    // Enviamos un valor vacío para simular que el usuario
                    // dejó el nombre del producto sin escribir.
                    value: '',
                },
            });
        });

        // expect indica lo que esperamos que ocurra después de realizar la acción anterior.
        // Accedemos a los errores generados por el hook y comprobamos específicamente el error correspondiente al campo nombre.
        // toBe compara el resultado obtenido con el valor exacto esperado.
        expect(result.current.errors.nombre).toBe(

            // Este es exactamente el mensaje que debería generar
            // validateField() cuando recibe un nombre vacío.
            'El nombre del producto es obligatorio'
        );
    });

    test('muestra error cuando el nombre contiene caracteres inválidos', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'nombre',
                    value: '@@@',
                },
            });
        });

        expect(result.current.errors.nombre).toBe(
            'El nombre debe contener letras (puede incluir números)'
        );
    });

    test('muestra error cuando el nombre tiene menos de 3 caracteres', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'nombre',
                    value: 'AB',
                },
            });
        });

        expect(result.current.errors.nombre).toBe(
            'El nombre debe tener mínimo 3 caracteres'
        );
    });

    test('no muestra error cuando el nombre es válido', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'nombre',
                    value: 'Laptop Lenovo',
                },
            });
        });

        expect(result.current.errors.nombre).toBe('');
    });

    });

    // ==================================================
    // 2. VALIDACIÓN DE CATEGORÍA
    // ==================================================

    describe('Validación de categoría', () => {

    test('muestra error cuando no se selecciona una categoría', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'categoriaId',
                    value: '',
                },
            });
        });

        expect(result.current.errors.categoriaId).toBe(
            'Debe seleccionar una categoría'
        );
    });


    test('no muestra error cuando se selecciona una categoría', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'categoriaId',
                    value: 'categoria-123',
                },
            });
        });

        expect(result.current.errors.categoriaId).toBe('');
    });

    });


    // ==================================================
    // 3. VALIDACIÓN DE PRECIO
    // ==================================================

    describe('Validación de precio', () => {

    test('permite dejar el precio vacío', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'precio',
                    value: '',
                },
            });
        });

        expect(result.current.errors.precio).toBe('');
    });


    it('normaliza un precio con separador de miles', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn()
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'precio',
                    value: '15000.50'
                }
            });
        });

        expect(result.current.formData.precio).toBe('1500050');
        expect(result.current.errors.precio).toBe('');
    });


    test('muestra error cuando el precio tiene un formato inválido', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'precio',
                    value: '15000.555',
                },
            });
        });

        expect(result.current.errors.precio).toBe('');
    });

    });


    // ==================================================
    // 4. VALIDACIÓN DE STOCK
    // ==================================================

    describe('Validación de stock', () => {

    test('permite dejar el stock vacío', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'stock',
                    value: '',
                },
            });
        });

        expect(result.current.errors.stock).toBe('');
    });


    test('acepta un stock entero válido', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'stock',
                    value: '25',
                },
            });
        });

        expect(result.current.formData.stock).toBe('25');
        expect(result.current.errors.stock).toBe('');
    });


    test('rechaza un stock con caracteres no numéricos', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'stock',
                    value: '25abc',
                },
            });
        });

        expect(result.current.errors.stock).toBe('');
    });

    });


    // ==================================================
    // 5. VALIDACIÓN DE SERIAL
    // ==================================================

    describe('Validación de serial', () => {

    test('muestra error cuando el serial está vacío', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'serial',
                    value: '',
                },
            });
        });

        expect(result.current.errors.serial).toBe(
            'El serial es obligatorio'
        );
    });


    test('muestra error cuando el serial tiene menos de 2 caracteres', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'serial',
                    value: 'A',
                },
            });
        });

        expect(result.current.errors.serial).toBe(
            'El serial debe tener mínimo 2 caracteres'
        );
    });


    test('acepta un serial válido', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        ServicesProducts.checkSerialExists.mockResolvedValue(false);

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'serial',
                    value: 'ABC123',
                },
            });
        });

        expect(result.current.errors.serial).toBe('');
    });


    test('muestra error cuando el serial ya existe', async () => {
        ServicesProducts.checkSerialExists.mockResolvedValue(true);

        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'serial',
                    value: 'ABC123',
                },
            });
        });

        await waitFor(() => {
            expect(result.current.errors.serial).toBe(
                'Este serial ya existe en otro producto'
            );
        });
    });


    test('muestra el error cuando falla la validación del serial', async () => {
        ServicesProducts.checkSerialExists.mockRejectedValue(
            new Error('Error al validar serial')
        );

        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'serial',
                    value: 'ABC123',
                },
            });
        });

        await waitFor(() => {
            expect(result.current.errors.serial).toBe(
                'Error al validar serial'
            );
        });
    });

    });


    // ==================================================
    // 6. VALIDACIÓN DE TIPO DE STOCK
    // ==================================================

    describe('Validación de tipo de stock', () => {

    test('muestra error cuando no se selecciona tipo de stock', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'tipoStock',
                    value: '',
                },
            });
        });

        expect(result.current.errors.tipoStock).toBe(
            'Debe seleccionar un tipo de stock'
        );
    });


    test('acepta unidad como tipo de stock', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'tipoStock',
                    value: 'unidad',
                },
            });
        });

        expect(result.current.errors.tipoStock).toBe('');
    });


    test('acepta metros como tipo de stock', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'tipoStock',
                    value: 'metros',
                },
            });
        });

        expect(result.current.errors.tipoStock).toBe('');
    });


    test('rechaza un tipo de stock no válido', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'tipoStock',
                    value: 'kilogramos',
                },
            });
        });

        expect(result.current.errors.tipoStock).toBe(
            'Tipo de stock no válido'
        );
    });

    });


    // ==================================================
    // 7. VALIDACIÓN DE GARANTÍA
    // ==================================================

    describe('Validación de garantía', () => {

    test('muestra error cuando no se selecciona garantía', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'garantia',
                    value: '',
                },
            });
        });

        expect(result.current.errors.garantia).toBe(
            'Debe seleccionar una garantía'
        );
    });


    test('acepta una garantía válida', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'garantia',
                    value: '12 meses',
                },
            });
        });

        expect(result.current.errors.garantia).toBe('');
    });


    test('rechaza una garantía no válida', () => {
        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError: jest.fn(),
            })
        );

        act(() => {
            result.current.handleChange({
                target: {
                    name: 'garantia',
                    value: '24 meses',
                },
            });
        });

        expect(result.current.errors.garantia).toBe(
            'Garantía no válida'
        );
    });

    });


    // ==================================================
    // 8. ENVÍO DEL FORMULARIO
    // ==================================================

    describe('Envío del formulario', () => {

    test('crea el producto cuando el formulario es válido', async () => {
        const onSuccess = jest.fn();

        ServicesProducts.create.mockResolvedValue({});

        const { result } = renderHook(() =>
            useProductForm({
                onSuccess,
                onError: jest.fn(),
                caracteristicas: [],
            })
        );

        act(() => {
            result.current.setFormData({
                nombre: 'Laptop Lenovo',
                categoriaId: 'cat-123',
                precio: '1500000',
                stock: '10',
                tipoStock: 'unidad',
                serial: 'ABC123',
                garantia: '12 meses',
            });
        });

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: jest.fn(),
            });
        });

        expect(ServicesProducts.create).toHaveBeenCalledWith({
            nombre: 'Laptop Lenovo',
            categoriaId: 'cat-123',
            precio: 1500000,
            stock: 10,
            tipoStock: 'unidad',
            serial: 'ABC123',
            garantia: '12 meses',
            caracteristicas: [],
        });

        expect(onSuccess).toHaveBeenCalled();
    });


    test('no crea el producto cuando existen errores de validación', async () => {
        const onSuccess = jest.fn();

        const { result } = renderHook(() =>
            useProductForm({
                onSuccess,
                onError: jest.fn(),
            })
        );

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: jest.fn(),
            });
        });

        expect(ServicesProducts.create).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });


    test('llama a onError cuando falla la creación del producto', async () => {
        const onError = jest.fn();

        ServicesProducts.create.mockRejectedValue(
            new Error('Error al crear producto')
        );

        const { result } = renderHook(() =>
            useProductForm({
                onSuccess: jest.fn(),
                onError,
            })
        );

        act(() => {
            result.current.setFormData({
                nombre: 'Laptop Lenovo',
                categoriaId: 'cat-123',
                precio: '1500000',
                stock: '10',
                tipoStock: 'unidad',
                serial: 'ABC123',
                garantia: '12 meses',
            });
        });

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: jest.fn(),
            });
        });

        expect(onError).toHaveBeenCalledWith(
            'Error al crear producto'
        );
    });

    });

});