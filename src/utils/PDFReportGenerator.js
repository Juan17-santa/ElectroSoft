import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logoBase64 } from "./logoBase64";

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
    headColor = [240, 240, 240],
    emptyMessage = "No hay registros disponibles"
}) => {

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- BANNER INSTITUCIONAL ---
    // Fondo claro para ahorrar tinta en impresión
    doc.setFillColor(245, 245, 245); 
    doc.rect(0, 0, pageWidth, 26, "F");

    // Logo (bombillo)
    try {
        doc.addImage(logoBase64, "PNG", 12, 3, 20, 20);
    } catch(e) {}

    // Nombre de Empresa
    doc.setTextColor(50, 50, 50); // Gris oscuro
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("ElectroSoft", 35, 18);

    // Título del Reporte (alineado a la derecha)
    doc.setTextColor(80, 80, 80); // Gris oscuro
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), pageWidth - 14, 17, { align: "right" });

    // --- INFORMACIÓN DEL REPORTE ---
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Fecha de generación alineada a la derecha
    doc.text(
        `Fecha de emisión: ${new Date().toLocaleDateString()}`, 
        pageWidth - 14, 
        35, 
        { align: "right" }
    );

    // INFO EXTRA
    let currentY = 35;
    extraInfo.forEach(info => {
        doc.text(info, 14, currentY);
        currentY += 6;
    });

    // Línea separadora sutil
    currentY += 2;
    doc.setDrawColor(220, 220, 220);
    doc.line(14, currentY, pageWidth - 14, currentY);
    currentY += 5;

    // Tabla principal
    const tableBody = data.length > 0 ? data : [
        [{ content: emptyMessage, colSpan: columns.length, styles: { halign: 'center', fontStyle: 'italic', textColor: [150, 150, 150] } }]
    ];

    autoTable(doc, {
        startY: currentY + 4,
        head: [columns],
        body: tableBody,
        theme: "striped", // Diseño cebra
        styles: { 
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: { 
            fillColor: headColor, // Amarillo institucional
            textColor: [30, 30, 30], // Gris oscuro/Negro para contraste
            fontStyle: "bold"
        },
        alternateRowStyles: {
            fillColor: [248, 248, 248] // Gris súper claro
        },
        didParseCell: function (data) {
            // Alineación inteligente basada en el contenido de la primera fila de datos
            const firstRowData = data.table.body[0] ? String(data.table.body[0].raw[data.column.index] || "").trim() : "";
            
            let align = 'left';
            if (firstRowData.startsWith('$')) {
                align = 'right';
            } else if (!isNaN(firstRowData) && firstRowData !== '') {
                align = 'center';
            }

            data.cell.styles.halign = align;
        }
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
