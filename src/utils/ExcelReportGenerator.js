import * as XLSX from "xlsx-js-style";

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
        ["💡 ElectroSoft"],
        [title.toUpperCase()],
        [`Fecha de emisión: ${fechaCreacion} a las ${horaCreacion}`],
        []
    ];
    if (columns && columns.length > 0) {
        worksheetData.push(columns);
    }
    worksheetData.push(...data);

    // Encontrar el ancho máximo real de la tabla
    let maxCols = 5;
    worksheetData.forEach(row => {
        if (row && row.length > maxCols) maxCols = row.length;
    });
    const colsCount = maxCols > 0 ? maxCols - 1 : 5;

    // Aplicar transformaciones para reportes complejos (donde columns es vacío)
    if (!columns || columns.length === 0) {
        let inAnalysisTable = false;
        worksheetData.forEach((row, R) => {
            if (R > 3) {
                if (row.length === 1 && typeof row[0] === 'string' && row[0].trim() === "ANÁLISIS POR PROVEEDOR") {
                    inAnalysisTable = true;
                }

                if (inAnalysisTable && row.length === 4) {
                    // Es la tabla de análisis: Combinaremos A y B para el proveedor
                    row[4] = row[3];
                    row[3] = row[2];
                    row[2] = row[1];
                    row[1] = "";
                }
                else if (!inAnalysisTable && row.length === 2) {
                    // Si es un KPI normal
                    row[2] = row[1];
                    row[1] = "";
                }
            }
        });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: colsCount } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: colsCount } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: colsCount } }
    ];

    if (!columns || columns.length === 0) {
        worksheetData.forEach((row, R) => {
            if (R > 3) {
                if (row.length === 1 && typeof row[0] === 'string' && row[0].trim() !== "") {
                    worksheet["!merges"].push({ s: { r: R, c: 0 }, e: { r: R, c: colsCount } });
                } 
                else if ((row.length === 3 || row.length === 4) && row[1] === "") {
                    worksheet["!merges"].push({ s: { r: R, c: 0 }, e: { r: R, c: 1 } });
                }
                else if (row.length === 5 && row[4] === "_FOOTER_") {
                    worksheet["!merges"].push({ s: { r: R, c: 0 }, e: { r: R, c: 2 } });
                }
                else if (row.length === 5 && row[1] === "") {
                    // Tabla de análisis modificada: Combinar A y B
                    worksheet["!merges"].push({ s: { r: R, c: 0 }, e: { r: R, c: 1 } });
                }
            }
        });
    }

    // Aplicar estilos profesionales
    const R_LOGO = 0;
    const R_TITLE = 1;
    const R_DATE = 2;

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        const rowData = worksheetData[R] || [];
        
        // Detectores de tipo de fila
        const isClassicHeader = (columns && columns.length > 0 && R === 4);
        const prevRow = worksheetData[R-1] || [];
        const isSubTitle = (columns && columns.length === 0 && rowData.length === 1 && typeof rowData[0] === 'string' && rowData[0].trim() !== "");
        const isKPI = (columns && columns.length === 0 && (rowData.length === 3 || rowData.length === 4) && rowData[1] === "");
        
        const isManualHeader = (
            columns && columns.length === 0 && 
            rowData.length >= 3 && 
            R > 3 && 
            prevRow.length <= 1 &&
            typeof rowData[0] === 'string' && 
            isNaN(rowData[0]) && 
            rowData[0].trim() !== "" &&
            !isKPI // <-- Evita que los KPIs se pinten de negro, pero permite la cabecera de Análisis (que tiene length 5)
        );

        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
            
            // Recortar tablas pequeñas: No aplicar estilos a columnas vacías fuera del alcance de esta fila
            if (R > R_DATE && rowData.length > 0 && C >= rowData.length) {
                if (worksheet[cell_ref] && worksheet[cell_ref].v === '') {
                    delete worksheet[cell_ref];
                }
                continue;
            }

            // Si la celda no existe, la creamos vacía para poder darle estilo
            if (!worksheet[cell_ref]) {
                worksheet[cell_ref] = { t: 's', v: '' };
            }

            if (R === R_LOGO) {
                worksheet[cell_ref].s = {
                    font: { bold: true, color: { rgb: "FFEAB308" }, sz: 20 },
                    fill: { fgColor: { rgb: "FF1E1E1E" } },
                    alignment: { vertical: "center", horizontal: "center" }
                };
            } else if (R === R_TITLE) {
                worksheet[cell_ref].s = {
                    font: { bold: true, color: { rgb: "FF1E1E1E" }, sz: 14 },
                    fill: { fgColor: { rgb: "FFEAB308" } },
                    alignment: { vertical: "center", horizontal: "center" }
                };
            } else if (R === R_DATE) {
                worksheet[cell_ref].s = {
                    font: { italic: true, color: { rgb: "FF555555" }, sz: 10 },
                    alignment: { vertical: "center", horizontal: "right" }
                };
            } else if (isClassicHeader || isManualHeader) {
                worksheet[cell_ref].s = {
                    font: { bold: true, color: { rgb: "FFFFFFFF" }, sz: 11 },
                    fill: { fgColor: { rgb: "FF333333" } },
                    alignment: { vertical: "center", horizontal: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "FF999999" } },
                        bottom: { style: "thin", color: { rgb: "FF999999" } },
                        left: { style: "thin", color: { rgb: "FF555555" } },
                        right: { style: "thin", color: { rgb: "FF555555" } }
                    }
                };
            } else if (isSubTitle) {
                worksheet[cell_ref].s = {
                    font: { bold: true, color: { rgb: "FF1E1E1E" }, sz: 12 },
                    fill: { fgColor: { rgb: "FFF2F2F2" } },
                    alignment: { vertical: "center" }
                };
            } else if (isKPI) {
                worksheet[cell_ref].s = {
                    font: { sz: 11 },
                    alignment: { vertical: "center" }
                    // Sin bordes de cuadrícula
                };
            } else if (R > R_DATE) {
                // Verificamos si tiene la marca de _FOOTER_
                const isFooter = rowData.length === 5 && rowData[4] === "_FOOTER_";
                
                // Si es un footer, quitamos la marca temporal para que no se imprima
                if (isFooter && worksheet[cell_ref].v === "_FOOTER_") {
                    worksheet[cell_ref].v = "";
                }

                if (isFooter) {
                    worksheet[cell_ref].s = {
                        font: { sz: 11, bold: true },
                        alignment: { vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "FF999999" } },
                            bottom: { style: "thin", color: { rgb: "FF999999" } },
                            left: { style: "thin", color: { rgb: "FF999999" } },
                            right: { style: "thin", color: { rgb: "FF999999" } }
                        }
                    };
                } else if (rowData.length === 0) {
                    // Fila separadora (vacía)
                    worksheet[cell_ref].s = {
                        fill: { fgColor: { rgb: "FFEEEEEE" } },
                        border: {
                            top: { style: "thin", color: { rgb: "FFCCCCCC" } },
                            bottom: { style: "thin", color: { rgb: "FFCCCCCC" } }
                        }
                    };
                } else {
                    // Filas de datos
                    worksheet[cell_ref].s = {
                        font: { sz: 11 },
                        alignment: { vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "FF999999" } },
                            bottom: { style: "thin", color: { rgb: "FF999999" } },
                            left: { style: "thin", color: { rgb: "FF999999" } },
                            right: { style: "thin", color: { rgb: "FF999999" } }
                        }
                    };
                }
            }
        }
    }

    // Ajuste de ancho de columnas (auto-fit profesional dinámico)
    const columnWidths = [];
    for (let c = 0; c < maxCols; c++) {
        let maxLen = 8; // Ancho mínimo reducido para IDs
        
        worksheetData.forEach(row => {
            if (row && row[c] !== undefined && row[c] !== null) {
                // Ignorar filas cortas (como los KPIs de resumen o títulos) para que no estiren la columna ID.
                if (row.length <= 3) return;

                const cellText = row[c].toString();
                if (cellText === "💡 ElectroSoft" || cellText === title.toUpperCase()) return;
                
                if (cellText.length > maxLen) {
                    maxLen = cellText.length;
                }
            }
        });
        
        // Damos más padding (5) para que los textos respiren y el filtro no tape la cabecera
        columnWidths.push({ wch: Math.min(maxLen + 5, 80) });
    }
    worksheet["!cols"] = columnWidths;

    // Crear libro y exportar
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    XLSX.writeFile(workbook, fileName);
};