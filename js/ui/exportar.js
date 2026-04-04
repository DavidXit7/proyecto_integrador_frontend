// ============================================
// MÓDULO DE EXPORTACIÓN - RF04
// Se encarga únicamente de la descarga del archivo JSON.
// ============================================

/**
 * Recibe un array de objetos (ya procesados) y los descarga como un archivo .json
 * @param {Array} datos - Lista de objetos a exportar
 * @returns {Boolean} - True si se inició la descarga, False si no había datos
 */
export const exportarTareasJSON = (datos) => {
    if (!datos || datos.length === 0) return false;

    // Convertimos el objeto a una cadena JSON con indentación de 2 espacios
    const jsonString = JSON.stringify(datos, null, 2);

    // Creamos un elemento 'a' invisible para disparar la descarga
    const enlace = document.createElement("a");
    
    // Usamos un Blob para manejar correctamente los caracteres especiales y el tamaño
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    enlace.href = url;
    enlace.download = `reporte_tareas_${new Date().getTime()}.json`;
    
    // Disparamos el clic y limpiamos
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);

    return true;
};