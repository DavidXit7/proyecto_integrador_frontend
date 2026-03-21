// ============================================
// MENÚ USUARIO - VISUALIZACIÓN DE TAREAS POR USUARIO
// ============================================

import { getUsuarios, getTareasPorUsuario, finalizarTareaParaUsuario, desvincularUsuarioDeTarea } from "../api/index.js";
import { armarCardTarea, armarListaTareas } from "./tareas.js";

// Variables globales
let usuarios = [];
let tareasUsuario = [];
let usuarioSeleccionado = null;

// Referencias DOM
const selectorUsuario = document.getElementById("selectorUsuario");
const btnVerTareas = document.getElementById("btnVerTareas");
const seccionFiltros = document.getElementById("seccionFiltros");
const seccionResumen = document.getElementById("seccionResumen");
const seccionTareas = document.getElementById("seccionTareas");
const listaTareasUsuario = document.getElementById("listaTareasUsuario");
const mensajeSinTareas = document.getElementById("mensajeSinTareas");
const filtroEstadoUsuario = document.getElementById("filtroEstadoUsuario");
const btnLimpiarFiltrosUsuario = document.getElementById("btnLimpiarFiltrosUsuario");

// Cargar usuarios en el selector
const cargarUsuarios = async () => {
    try {
        usuarios = await getUsuarios();
        selectorUsuario.innerHTML = '<option value="">Seleccione un usuario...</option>';
        
        usuarios.forEach(usuario => {
            const option = document.createElement("option");
            option.value = usuario.documento;
            option.textContent = `${usuario.nombre} (${usuario.documento})`;
            selectorUsuario.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
    }
};

// Mostrar tareas del usuario seleccionado
const mostrarTareasUsuario = async () => {
    if (!usuarioSeleccionado) return;

    try {
        // Obtener tareas del usuario
        tareasUsuario = await getTareasPorUsuario(usuarioSeleccionado.documento);
        
        // Mostrar secciones relevantes
        seccionFiltros.style.display = "block";
        seccionResumen.style.display = "block";
        seccionTareas.style.display = "block";
        
        // Actualizar resumen
        actualizarResumen();
        
        // Mostrar tareas con opciones de usuario
        await armarListaTareas(listaTareasUsuario, tareasUsuario, {
            esVistaUsuario: true,
            usuarioActual: usuarioSeleccionado.documento
        });
        
        // Mostrar mensaje si no hay tareas
        if (tareasUsuario.length === 0) {
            mensajeSinTareas.style.display = "block";
            listaTareasUsuario.style.display = "none";
        } else {
            mensajeSinTareas.style.display = "none";
            listaTareasUsuario.style.display = "block";
        }
        
    } catch (error) {
        console.error("Error al cargar tareas del usuario:", error);
    }
};

// Actualizar resumen de tareas
const actualizarResumen = () => {
    const total = tareasUsuario.length;
    const pendientes = tareasUsuario.filter(t => t.estado === "pendiente").length;
    const enProceso = tareasUsuario.filter(t => t.estado === "en proceso").length;
    const completadas = tareasUsuario.filter(t => t.estado === "completada").length;
    
    document.getElementById("totalTareas").textContent = total;
    document.getElementById("tareasPendientes").textContent = pendientes;
    document.getElementById("tareasEnProceso").textContent = enProceso;
    document.getElementById("tareasCompletadas").textContent = completadas;
};

// Filtrar tareas por estado
const filtrarTareasPorEstado = async () => {
    const estadoSeleccionado = filtroEstadoUsuario.value;
    
    if (!estadoSeleccionado) {
        await armarListaTareas(listaTareasUsuario, tareasUsuario, {
            esVistaUsuario: true,
            usuarioActual: usuarioSeleccionado.documento
        });
    } else {
        const tareasFiltradas = tareasUsuario.filter(tarea => tarea.estado === estadoSeleccionado);
        await armarListaTareas(listaTareasUsuario, tareasFiltradas, {
            esVistaUsuario: true,
            usuarioActual: usuarioSeleccionado.documento
        });
    }
};

// Limpiar filtros
const limpiarFiltros = async () => {
    filtroEstadoUsuario.value = "";
    await armarListaTareas(listaTareasUsuario, tareasUsuario, {
        esVistaUsuario: true,
        usuarioActual: usuarioSeleccionado.documento
    });
};

// Finalizar tarea para el usuario
const finalizarTarea = async (idTarea, documentoUsuario) => {
    try {
        await finalizarTareaParaUsuario(idTarea, documentoUsuario);
        await mostrarTareasUsuario(); // Recargar tareas
    } catch (error) {
        console.error("Error al finalizar tarea:", error);
    }
};

// Desvincular usuario de la tarea
const desvincularTarea = async (idTarea, documentoUsuario) => {
    try {
        await desvincularUsuarioDeTarea(idTarea, documentoUsuario);
        await mostrarTareasUsuario(); // Recargar tareas
    } catch (error) {
        console.error("Error al desvincular tarea:", error);
    }
};

// Event Listeners
selectorUsuario.addEventListener("change", (e) => {
    const documentoSeleccionado = e.target.value;
    btnVerTareas.disabled = !documentoSeleccionado;
    
    if (documentoSeleccionado) {
        usuarioSeleccionado = usuarios.find(u => u.documento === documentoSeleccionado);
    } else {
        usuarioSeleccionado = null;
        // Ocultar secciones
        seccionFiltros.style.display = "none";
        seccionResumen.style.display = "none";
        seccionTareas.style.display = "none";
        mensajeSinTareas.style.display = "none";
    }
});

btnVerTareas.addEventListener("click", mostrarTareasUsuario);
filtroEstadoUsuario.addEventListener("change", filtrarTareasPorEstado);
btnLimpiarFiltrosUsuario.addEventListener("click", limpiarFiltros);

// Event delegation para botones de tareas
listaTareasUsuario.addEventListener("click", (e) => {
    e.preventDefault();

    const btnFinalizar = e.target.closest(".btnFinalizarTarea");
    if (btnFinalizar) {
        const idTarea = btnFinalizar.getAttribute("data-id");
        const documentoUsuario = btnFinalizar.getAttribute("data-usuario");
        
        if (confirm("¿Está seguro de finalizar esta tarea?")) {
            finalizarTarea(idTarea, documentoUsuario);
        }
    }
    
    const btnDesvincular = e.target.closest(".btnDesvincularTarea");
    if (btnDesvincular) {
        const idTarea = btnDesvincular.getAttribute("data-id");
        const documentoUsuario = btnDesvincular.getAttribute("data-usuario");
        const esTareaCompartida = btnDesvincular.textContent === "Desvincular";
        
        const mensaje = esTareaCompartida 
            ? "¿Está seguro de desvincularse de esta tarea? La tarea continuará asignada a otros usuarios."
            : "¿Está seguro de eliminar esta tarea?";
            
        if (confirm(mensaje)) {
            desvincularTarea(idTarea, documentoUsuario);
        }
    }
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarios();
});