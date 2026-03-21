import * as XLSX from "xlsx";

/**
 * Reusable Excel generator for any module
 */
export const generateExcelReport = ({
    title,
    fileName,
    columns,
    data
}) => {
    const ahora = new Date();

    const fechaCreacion = ahora.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const horaCreacion = ahora.toLocaleTimeString('es-CO', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const worksheetData = [
        [title.toUpperCase()],
        [`Fecha de creación: ${fechaCreacion} a las ${horaCreacion}`],
        [],      // Fila vacía para separar
        [],      // Fila vacía para separar
        columns, // Encabezados de la tabla
        ...data  // Filas de datos
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Ajuste de ancho de columnas (mínimo 15)
    const columnWidths = columns.map(col => ({ 
        wch: Math.max(col ? col.toString().length : 0, 15) 
    }));
    worksheet["!cols"] = columnWidths;

    // Crear libro y exportar
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    XLSX.writeFile(workbook, fileName);
};