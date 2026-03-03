import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generador PDF reutilizable para cualquier módulo
 */
export const generatePDFReport = ({
    title,
    fileName,
    columns,
    data,
    headColor = [234, 179, 8]
}) => {

    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 22);

    // Fecha
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
        `Fecha de generación: ${new Date().toLocaleDateString()}`,
        14,
        30
    );

    // Tabla
    autoTable(doc, {
        startY: 38,
        head: [columns],
        body: data,
        styles: { fontSize: 9 },
        headStyles: { fillColor: headColor }
    });

    doc.save(fileName);
};
