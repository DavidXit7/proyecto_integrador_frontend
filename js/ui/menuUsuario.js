// ============================================
// MENÚ USUARIO - VISUALIZACIÓN DE TAREAS POR USUARIO (SPA)
// ============================================

import { getUsuarios, getTareasPorUsuario, finalizarTareaParaUsuario } from "../api/index.js";
import { armarListaTareas } from "./tareas.js";
import { notificarExito, notificarError, confirmarAccion } from "./notificaciones.js";

let usuarios = [];
let tareasUsuario = [];
let usuarioSeleccionado = null;

/**
 * FUNCIÓN DE INICIALIZACIÓN PARA LA VISTA DE MENÚ USUARIO
 */
export const initMenu = async () => {
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

    if (!selectorUsuario) return;

    // --- CARGA INICIAL ---
    try {
        usuarios = await getUsuarios();
        selectorUsuario.replaceChildren(); // Limpiar
        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = "Seleccione un usuario...";
        selectorUsuario.appendChild(defaultOpt);
        usuarios.forEach(u => {
            const opt = document.createElement("option");
            opt.value = u.documento;
            opt.textContent = `${u.nombre} (${u.documento})`;
            selectorUsuario.appendChild(opt);
        });
    } catch (e) { console.error(e); }

    // --- FUNCIONES INTERNAS ---
    const actualizarResumen = () => {
        const total = tareasUsuario.length;
        const pendientes = tareasUsuario.filter(t => t.estado === "pendiente").length;
        const completadas = tareasUsuario.filter(t => t.estado === "completada").length;
        
        const elTotal = document.getElementById("totalTareas");
        const elPend = document.getElementById("tareasPendientes");
        const elComp = document.getElementById("tareasCompletadas");

        if (elTotal) elTotal.textContent = total;
        if (elPend) elPend.textContent = pendientes;
        if (elComp) elComp.textContent = completadas;
    };

    const cargarTareas = async () => {
        if (!usuarioSeleccionado) return;
        try {
            tareasUsuario = await getTareasPorUsuario(usuarioSeleccionado.documento);
            seccionFiltros.style.display = "block";
            seccionResumen.style.display = "block";
            seccionTareas.style.display = "block";
            
            actualizarResumen();
            await armarListaTareas(listaTareasUsuario, tareasUsuario, {
                esVistaUsuario: true,
                usuarioActual: usuarioSeleccionado.documento
            });

            const hayTareas = tareasUsuario.length > 0;
            mensajeSinTareas.style.display = hayTareas ? "none" : "block";
            listaTareasUsuario.style.display = hayTareas ? "block" : "none";
        } catch (e) { notificarError("Error al cargar tareas"); }
    };

    // --- EVENTOS ---
    selectorUsuario.addEventListener("change", (e) => {
        const doc = e.target.value;
        btnVerTareas.disabled = !doc;
        usuarioSeleccionado = doc ? usuarios.find(u => u.documento === doc) : null;
        if (!doc) {
            seccionFiltros.style.display = "none";
            seccionResumen.style.display = "none";
            seccionTareas.style.display = "none";
        }
    });

    btnVerTareas.addEventListener("click", cargarTareas);

    filtroEstadoUsuario.addEventListener("change", async () => {
        const est = filtroEstadoUsuario.value;
        const filtradas = est ? tareasUsuario.filter(t => t.estado === est) : tareasUsuario;
        await armarListaTareas(listaTareasUsuario, filtradas, {
            esVistaUsuario: true,
            usuarioActual: usuarioSeleccionado.documento
        });
    });

    btnLimpiarFiltrosUsuario.addEventListener("click", async () => {
        filtroEstadoUsuario.value = "";
        await armarListaTareas(listaTareasUsuario, tareasUsuario, {
            esVistaUsuario: true,
            usuarioActual: usuarioSeleccionado.documento
        });
    });

    listaTareasUsuario.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btnFinalizarTarea");
        if (btn) {
            const id = btn.getAttribute("data-id");
            const doc = btn.getAttribute("data-usuario");
            if (await confirmarAccion('¿Finalizar tarea?', 'Se marcará como completada para ti.')) {
                try {
                    await finalizarTareaParaUsuario(id, doc);
                    notificarExito("¡Completada!");
                    await cargarTareas();
                } catch (e) { notificarError("Error al finalizar"); }
            }
        }
    });
};