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
    // Create worksheet
    const worksheetData = [
        [title], // Optional: Title as the first row
        [],      // Empty row
        columns, // Header row
        ...data  // Data rows
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Basic styling/formatting (optional, xlsx basic version has limited styling)
    // You can adjust column widths if needed
    const columnWidths = columns.map(col => ({ wch: Math.max(col.length, 15) }));
    worksheet["!cols"] = columnWidths;

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    // Generate and download Excel file
    XLSX.writeFile(workbook, fileName);
};
