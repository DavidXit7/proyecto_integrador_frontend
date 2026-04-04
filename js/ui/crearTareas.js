// ============================================
// SCRIPT MODULAR PARA TAREAS (SPA)
// ============================================

import { armarListaTareas, armarCardTarea, guardarTareasParaFiltro, inicializarFiltros, obtenerTareasFiltradas } from "./tareas.js";
import { notificarExito, notificarError, notificarInfo, confirmarAccion } from "./notificaciones.js";
import { exportarTareasJSON } from "./exportar.js";
import { getTareas, crearTarea, actualizarTarea, eliminarTarea, getUsuarios, getTareasById } from "../api/index.js";
import { procesarTareasParaExportar, inicializarOrdenamiento } from "../services/index.js";
import { armarSelectorUsuarios } from "./index.js";
import { validar } from "../utils/validarFormulario.js";

let tareaEditandoId = null;

const reglas = {
    tituloTarea: { 
        required: true, 
        min: 5, 
        max: 50,
        mensajeMin: "El título debe tener al menos 5 caracteres",
        mensajeMax: "El título es demasiado largo (máx. 50 caracteres)"
    },
    descripcionTarea: { 
        required: true, 
        min: 10, 
        max: 200,
        mensajeMin: "Añade una descripción más detallada (mín. 10 caracteres)",
        mensajeMax: "La descripción es demasiado larga (máx. 200 caracteres)"
    },
    usuariosAsignados: { 
        required: true, 
        mensaje: "Por favor, asigna al menos un usuario a la tarea" 
    }
};

/**
 * FUNCIÓN DE INICIALIZACIÓN PARA LA VISTA DE TAREAS
 */
export const initTareas = async () => {
    // Referencias DOM
    const formTarea = document.getElementById("formTarea");
    const tituloTarea = document.getElementById("tituloTarea");
    const descripcionTarea = document.getElementById("descripcionTarea");
    const userSelector = document.getElementById("userSelector");
    const btnCrearTarea = document.getElementById("btnCrearTarea");
    const listaTareas = document.getElementById("listaTareas");
    
    const btnExportar = document.getElementById("btnExportar");
    const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");
    const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

    if (!formTarea) return;

    // Funciones auxiliares
    const limpiarErroresTarea = () => {
        tituloTarea.classList.remove("error");
        descripcionTarea.classList.remove("error");
        userSelector.classList.remove("error");
        formTarea.querySelectorAll(".msgError").forEach(msg => msg.remove());
    };

    const mostrarErroresTarea = (errores) => {
        for (const campo in errores) {
            const elemento = formTarea.querySelector(`[name="${campo}"]`) || document.getElementById(campo) || userSelector;
            if (elemento) {
                elemento.classList.add("error");
                const msg = document.createElement("span");
                msg.classList.add("msgError");
                msg.textContent = errores[campo];
                
                if (campo === "usuariosAsignados") {
                    userSelector.parentElement.append(msg);
                } else {
                    elemento.parentElement.append(msg);
                }
            }
        }
    };

    const limpiarFormularioTarea = () => {
        formTarea.reset();
        tareaEditandoId = null;
        btnCrearTarea.textContent = "Crear Tarea";
        limpiarErroresTarea();
    };

    const cargarTareasEnLista = async () => {
        try {
            const tareas = await getTareas();
            guardarTareasParaFiltro(tareas);
            await armarListaTareas(listaTareas, tareas);
            inicializarFiltros(listaTareas);
            await inicializarOrdenamiento(listaTareas, obtenerTareasFiltradas, armarListaTareas);
        } catch (error) {
            notificarError("Error al cargar tareas");
        }
    };

    // --- CARGA INICIAL ---
    try {
        await cargarTareasEnLista();
        const usuarios = await getUsuarios();
        armarSelectorUsuarios(userSelector, usuarios);
    } catch (error) {
        console.error(error);
    }

    // --- EVENTOS ---
    formTarea.addEventListener("submit", async (e) => {
        e.preventDefault();
        limpiarErroresTarea();

        const respuesta = validar(e.target, reglas);
        if (!respuesta.valido) {
            mostrarErroresTarea(respuesta.errores);
            return;
        }

        const checkboxes = document.querySelectorAll('input[name="usuariosAsignados"]:checked');
        const usuariosAsignados = Array.from(checkboxes).map(cb => cb.value);
        
        const datos = {
            titulo: tituloTarea.value.trim(),
            descripcion: descripcionTarea.value.trim(),
            usuarios_asignados: usuariosAsignados
        };

        try {
            if (tareaEditandoId !== null) {
                await actualizarTarea(tareaEditandoId, datos);
                notificarExito("Tarea actualizada");
            } else {
                await crearTarea(datos);
                notificarExito("Tarea creada");
            }
            await cargarTareasEnLista();
            limpiarFormularioTarea();
        } catch (error) {
            notificarError("Error al guardar: " + error.message);
        }
    });

    listaTareas.addEventListener("click", async (e) => {
        const btnEditar = e.target.closest(".btnEditarTarea");
        if (btnEditar) {
            const id = btnEditar.getAttribute("data-id");
            const tareaActual = await getTareasById(id);
            if (tareaActual) {
                tituloTarea.value = tareaActual.titulo;
                descripcionTarea.value = tareaActual.descripcion;
                
                const checkboxes = document.querySelectorAll('input[name="usuariosAsignados"]');
                checkboxes.forEach(cb => {
                    cb.checked = tareaActual.usuarios_asignados && 
                                 tareaActual.usuarios_asignados.some(u => String(u.documento) === String(cb.value));
                });
                
                tareaEditandoId = id;
                btnCrearTarea.textContent = "Actualizar Tarea";
                formTarea.scrollIntoView({ behavior: "smooth" });
            }
        }

        const btnEliminar = e.target.closest(".btnEliminarTarea");
        if (btnEliminar) {
            const idEliminar = btnEliminar.getAttribute("data-id");
            if (await confirmarAccion('¿Eliminar tarea?', 'Se borrará permanentemente')) {
                try {
                    await eliminarTarea(idEliminar);
                    await cargarTareasEnLista();
                    notificarExito("Tarea eliminada");
                } catch (error) {
                    notificarError(error.message);
                }
            }
        }
    });

    if (btnExportar) {
        btnExportar.addEventListener("click", () => {
            const tareas = obtenerTareasFiltradas();
            const procesado = procesarTareasParaExportar(tareas);
            if (exportarTareasJSON(procesado)) {
                notificarExito("Exportado correctamente");
            } else {
                notificarInfo("No hay tareas");
            }
        });
    }
};