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
    extraInfo = [],
    totals = [],
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

    // INFO EXTRA
    let currentY = 36;

    extraInfo.forEach(info => {
        doc.text(info, 14, currentY);
        currentY += 6;
    });

    // Tabla
    autoTable(doc, {
        startY: currentY + 4,
        head: [columns],
        body: data,
        styles: { fontSize: 9 },
        headStyles: { fillColor: headColor }
    });

    if (totals.length > 0) {

        const finalY = doc.lastAutoTable.finalY;

        // Línea separadora
        doc.setDrawColor(180);
        doc.line(120, finalY + 5, 196, finalY + 5);

        // Tabla de totales
        autoTable(doc, {
            startY: finalY + 8,
            body: totals.map((t, i) => {
                const [label, value] = t.split(":");

                return [
                    {
                        content: label,
                        styles: {
                            halign: "right",
                            fontStyle: "bold",
                            textColor: [80, 80, 80]
                        }
                    },
                    {
                        content: value,
                        styles: {
                            halign: "right",
                            fontStyle: i === totals.length - 1 ? "bold" : "normal",
                            fillColor: i === totals.length - 1 ? [245, 245, 245] : null
                        }
                    }
                ];
            }),

            theme: "plain",

            styles: {
                fontSize: 11,
                cellPadding: 2
            },

            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 36 }
            },

            margin: { left: 120 }
        });

    }

    doc.save(fileName);
};
