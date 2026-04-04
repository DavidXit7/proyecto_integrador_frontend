// ============================================
// MÓDULO DE SERVICIOS PARA TAREAS
// ============================================

/**
 * Procesa las tareas para exportación a JSON, convirtiendo los datos brutos
 * en una estructura amigable con estados calculados y nombres legibles.
 */
export const procesarTareasParaExportar = (tareas) => {
    return tareas.map(tarea => {
        // Calcular el estado global para el reporte
        let estadoGlobal = "pendiente";
        if (tarea.usuarios_asignados && tarea.usuarios_asignados.length > 0) {
            const completadas = tarea.usuarios_asignados.filter(u => u.estado === 'completada').length;
            if (completadas === tarea.usuarios_asignados.length) estadoGlobal = "completada";
        }

        // Convertir array de usuarios en string legible
        const nombresUsuarios = tarea.usuarios_asignados 
            ? tarea.usuarios_asignados.map(u => `${u.nombre} (${u.documento})`).join(", ")
            : "Sin asignar";

        return {
            id: tarea.id,
            titulo: tarea.titulo,
            descripcion: tarea.descripcion,
            estado_global: estadoGlobal,
            usuarios: nombresUsuarios,
            fecha_exportacion: new Date().toLocaleString()
        };
    });
};

/**
 * Ordena las tareas según el criterio seleccionado.
 */
export const ordenarTareas = (tareas, criterio) => {
    const copia = [...tareas];

    if (criterio === "nombre") {
        copia.sort((a, b) => a.titulo.toLowerCase().localeCompare(b.titulo.toLowerCase()));
    }

    if (criterio === "estado") {
        const orden = { "pendiente": 0, "completada": 1 };
        copia.sort((a, b) => {
            const getEstado = (t) => {
                const total = t.usuarios_asignados ? t.usuarios_asignados.length : 0;
                const done = t.usuarios_asignados ? t.usuarios_asignados.filter(u => u.estado === 'completada').length : 0;
                return (total > 0 && total === done) ? "completada" : "pendiente";
            };
            return orden[getEstado(a)] - orden[getEstado(b)];
        });
    }

    if (criterio === "fecha") {
        copia.sort((a, b) => new Date(b.id) - new Date(a.id)); // Usamos ID (insertId) como proxy si no hay created_at
    }

    return copia;
};

/**
 * Filtra las tareas basándose en el estado global (calculado) y la búsqueda de usuario.
 */
export const filtrarTareas = (tareas, criterios) => {
    const { estado, usuario } = criterios;
    
    return tareas.filter(tarea => {
        // 1. Calcular estado global para filtrado
        let estadoCalculado = "pendiente";
        if (tarea.usuarios_asignados && tarea.usuarios_asignados.length > 0) {
            const total = tarea.usuarios_asignados.length;
            const completas = tarea.usuarios_asignados.filter(u => u.estado === 'completada').length;
            if (total === completas) estadoCalculado = "completada";
        } else if (tarea.usuarios_asignados && tarea.usuarios_asignados.length === 0) {
            // Tarea sin usuarios se considera pendiente por defecto
            estadoCalculado = "pendiente";
        }

        const cumpleEstado = !estado || estadoCalculado === estado;
        
        // 2. Filtrar por usuario (nombre o documento en el array de asignaciones)
        const cumpleUsuario = !usuario || (tarea.usuarios_asignados && 
            tarea.usuarios_asignados.some(u => 
                u.nombre.toLowerCase().includes(usuario.toLowerCase()) || 
                u.documento.toLowerCase().includes(usuario.toLowerCase())
            ));
            
        return cumpleEstado && cumpleUsuario;
    });
};

/**
 * Inicializa la lógica de ordenamiento en la UI.
 */
export const inicializarOrdenamiento = async (contenedor, obtenerTareas, renderizar) => {
    const selectOrden = document.getElementById("selectOrden");
    if (!selectOrden) return;

    selectOrden.addEventListener("change", async () => {
        const criterio = selectOrden.value;
        const tareas = await obtenerTareas();
        const tareasOrdenadas = criterio ? ordenarTareas(tareas, criterio) : tareas;
        await renderizar(contenedor, tareasOrdenadas);
    });
};