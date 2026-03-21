// ============================================
// MENÚ USUARIO - VISUALIZACIÓN DE TAREAS POR USUARIO
// ============================================

import { getUsuarios, getTareasPorUsuario } from "../api/index.js";
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
        mostrarMensajeError("No se pudieron cargar los usuarios");
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
        
        // Mostrar tareas
        await armarListaTareas(listaTareasUsuario, tareasUsuario);
        
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
        mostrarMensajeError("No se pudieron cargar las tareas del usuario");
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
        await armarListaTareas(listaTareasUsuario, tareasUsuario);
    } else {
        const tareasFiltradas = tareasUsuario.filter(tarea => tarea.estado === estadoSeleccionado);
        await armarListaTareas(listaTareasUsuario, tareasFiltradas);
    }
};

// Limpiar filtros
const limpiarFiltros = async () => {
    filtroEstadoUsuario.value = "";
    await armarListaTareas(listaTareasUsuario, tareasUsuario);
};

// Mostrar mensaje de error
const mostrarMensajeError = (mensaje) => {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("msgError");
    errorDiv.textContent = mensaje;
    errorDiv.style.position = "fixed";
    errorDiv.style.top = "20px";
    errorDiv.style.right = "20px";
    errorDiv.style.zIndex = "9999";
    errorDiv.style.padding = "var(--spacing-md)";
    errorDiv.style.backgroundColor = "var(--color-error)";
    errorDiv.style.color = "white";
    errorDiv.style.borderRadius = "var(--radius-md)";
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
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

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarios();
});