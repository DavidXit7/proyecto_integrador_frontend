// ============================================
// UI DE TAREAS
// ============================================

import { filtrarTareas } from "../services/tareasService.js";

export const armarCardTarea = async (tarea, opciones = {}) => {
    const card = document.createElement("div");
    card.classList.add("cardTarea");
    card.setAttribute("data-id", tarea.id);

    const tareaInfo = document.createElement("div");
    tareaInfo.classList.add("tareaInfo");

    const crearParrafo = (label, valor, spanClass) => {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = label + ":";
        p.append(strong, " ");

        if (spanClass) {
            const span = document.createElement("span");
            span.classList.add(spanClass);
            span.textContent = valor || "";
            p.append(span);
        } else {
            p.append(valor || "");
        }
        return p;
    };

    const estadoValor = tarea.estado || "pendiente";
    const spanEstado = document.createElement("span");
    spanEstado.classList.add("tareaEstado", "tareaEstado--" + estadoValor.replace(" ", "-"));
    spanEstado.textContent = estadoValor;

    const pEstado = document.createElement("p");
    const strongEstado = document.createElement("strong");
    strongEstado.textContent = "Estado:";
    pEstado.append(strongEstado, " ", spanEstado);

    // Mostrar usuarios asignados (soporta múltiples usuarios y el formato antiguo)
    let usuariosTexto = "No asignados";
    if (tarea.usuarios_asignados && Array.isArray(tarea.usuarios_asignados) && tarea.usuarios_asignados.length > 0) {
        // Formato nuevo: array de documentos
        try {
            const { getUsuarios } = await import("../api/index.js");
            const usuarios = await getUsuarios();
            const usuariosAsignados = usuarios.filter(u => tarea.usuarios_asignados.includes(u.documento));
            usuariosTexto = usuariosAsignados.map(u => `${u.nombre} (${u.documento})`).join(", ");
        } catch (error) {
            console.error("Error al obtener usuarios para mostrar:", error);
            usuariosTexto = tarea.usuarios_asignados.join(", ");
        }
    } else if (tarea.documento_usuario) {
        // Formato antiguo: documento único
        usuariosTexto = tarea.documento_usuario;
    }

    const pUsuarios = document.createElement("p");
    pUsuarios.classList.add("tareaUsuarios");
    const strongUsuarios = document.createElement("strong");
    strongUsuarios.textContent = "Usuarios:";
    pUsuarios.append(strongUsuarios, " ", usuariosTexto);

    // Mostrar información de compartición si aplica
    let infoComparticion = "";
    if (tarea.usuarios_asignados && tarea.usuarios_asignados.length > 1) {
        infoComparticion = `(${tarea.usuarios_asignados.length} usuarios asignados)`;
    } else if (tarea.usuarios_asignados && tarea.usuarios_asignados.length === 1) {
        infoComparticion = "(tarea individual)";
    }

    if (infoComparticion) {
        const pInfoComparticion = document.createElement("p");
        pInfoComparticion.classList.add("tareaComparticion");
        pInfoComparticion.textContent = infoComparticion;
        tareaInfo.append(pInfoComparticion);
    }

    tareaInfo.append(
        pUsuarios,
        crearParrafo("Titulo", tarea.titulo, "tareaTitulo"),
        crearParrafo("Descripcion", tarea.descripcion, "tareaDescripcion"),
        pEstado
    );

    const tareaAcciones = document.createElement("div");
    tareaAcciones.classList.add("tareaAcciones");

    // Botones según el contexto
    if (opciones.esVistaUsuario && opciones.usuarioActual) {
        // Vista de usuario: mostrar botones de finalización y desvinculación
        if (tarea.estado !== "completada") {
            const btnFinalizar = document.createElement("button");
            btnFinalizar.classList.add("btn", "btnSuccess", "btnFinalizarTarea");
            btnFinalizar.setAttribute("data-id", tarea.id);
            btnFinalizar.setAttribute("data-usuario", opciones.usuarioActual);
            btnFinalizar.textContent = "Finalizar";
            tareaAcciones.append(btnFinalizar);
        }

        const btnDesvincular = document.createElement("button");
        btnDesvincular.classList.add("btn", "btnWarning", "btnDesvincularTarea");
        btnDesvincular.setAttribute("data-id", tarea.id);
        btnDesvincular.setAttribute("data-usuario", opciones.usuarioActual);
        btnDesvincular.textContent = tarea.usuarios_asignados && tarea.usuarios_asignados.length > 1 ? "Desvincular" : "Eliminar";
        tareaAcciones.append(btnDesvincular);
    } else {
        // Vista administrativa: mostrar botones de edición y eliminación
        const btnEditar = document.createElement("button");
        btnEditar.classList.add("btn", "btnEditarTarea");
        btnEditar.setAttribute("data-id", tarea.id);
        btnEditar.textContent = "Editar";

        const btnEliminar = document.createElement("button");
        btnEliminar.classList.add("btn", "btnEliminarTarea");
        btnEliminar.setAttribute("data-id", tarea.id);
        btnEliminar.textContent = "Eliminar";

        tareaAcciones.append(btnEditar, btnEliminar);
    }

    card.append(tareaInfo, tareaAcciones);

    return card;
};

export const armarListaTareas = async (contenedor, tareas, opciones = {}) => {
    contenedor.replaceChildren();

    if (tareas.length === 0) {
        const msg = document.createElement("p");
        msg.classList.add("msgNoTareas");
        msg.textContent = "No hay tareas para mostrar.";
        contenedor.append(msg);
        return;
    }

    const fragmento = document.createDocumentFragment();
    for (const tarea of tareas) {
        const card = await armarCardTarea(tarea, opciones);
        fragmento.append(card);
    }
    contenedor.append(fragmento);
};

// ============================================
// FILTROS - RF01
// Filtrar por: estado, usuario, combinados
// ============================================

let todasLasTareas = [];

export const guardarTareasParaFiltro = (tareas) => {
    todasLasTareas = tareas;
};

export const obtenerTodasLasTareas = () => todasLasTareas;

const aplicarFiltros = async (contenedor) => {
    const criterios = {
        estado: document.getElementById("filtroEstado").value,
        usuario: document.getElementById("filtroUsuario").value.trim().toLowerCase()
    };

    const tareasFiltradas = filtrarTareas(todasLasTareas, criterios);
    await armarListaTareas(contenedor, tareasFiltradas);
};

const limpiarFiltros = async (contenedor) => {
    document.getElementById("filtroEstado").value = "";
    document.getElementById("filtroUsuario").value = "";
    await armarListaTareas(contenedor, todasLasTareas);
};

export const inicializarFiltros = (contenedor) => {
    const btnAplicar = document.getElementById("btnAplicarFiltros");
    const btnLimpiar = document.getElementById("btnLimpiarFiltros");
    const selectEstado = document.getElementById("filtroEstado");
    const inputUsuario = document.getElementById("filtroUsuario");

    btnAplicar.addEventListener("click", () => aplicarFiltros(contenedor));
    btnLimpiar.addEventListener("click", () => limpiarFiltros(contenedor));
    selectEstado.addEventListener("change", () => aplicarFiltros(contenedor));
    inputUsuario.addEventListener("input", () => aplicarFiltros(contenedor));
};