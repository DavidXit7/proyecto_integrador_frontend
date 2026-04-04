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

    // --- MANEJO DE USUARIOS (Solo visible para Admin) ---
    const pUsuarios = document.createElement("p");
    if (!opciones.esVistaUsuario) {
        pUsuarios.classList.add("tareaUsuarios");
        const strongUsuarios = document.createElement("strong");
        strongUsuarios.textContent = "Usuarios: ";
        pUsuarios.append(strongUsuarios);

        if (tarea.usuarios_asignados && Array.isArray(tarea.usuarios_asignados)) {
            tarea.usuarios_asignados.forEach((asignacion, index) => {
                const spanUser = document.createElement("span");
                spanUser.classList.add("userAssignment");

                const isCompletada = asignacion.estado === 'completada';
                spanUser.style.color = isCompletada ? "var(--color-success)" : "var(--color-text-secondary)";
                spanUser.textContent = `${asignacion.nombre} ${isCompletada ? '✓' : '⏳'}`;

                pUsuarios.append(spanUser);
                if (index < tarea.usuarios_asignados.length - 1) pUsuarios.append(", ");
            });
        } else {
            pUsuarios.append("No asignados");
        }
    }

    // --- ESTADO GLOBAL (PARA ADMIN) VS INDIVIDUAL (PARA USUARIO) ---
    let estadoActual = "pendiente";
    if (opciones.esVistaUsuario && tarea.estado) {
        // En vista de usuario, el backend ya filtró la tarea y nos dio SU estado específico
        estadoActual = tarea.estado;
    } else if (!opciones.esVistaUsuario && tarea.usuarios_asignados) {
        // En vista admin, calculamos un estado "resumen" (opcional)
        const total = tarea.usuarios_asignados.length;
        const completadas = tarea.usuarios_asignados.filter(u => u.estado === 'completada').length;
        if (total > 0 && total === completadas) estadoActual = "completada";
    }

    const spanEstado = document.createElement("span");
    spanEstado.classList.add("tareaEstado", "tareaEstado--" + estadoActual.replace(" ", "-"));
    spanEstado.textContent = estadoActual;

    const pEstado = document.createElement("p");
    const strongEstado = document.createElement("strong");
    strongEstado.textContent = "Estado Global: ";
    pEstado.append(strongEstado, spanEstado);

    tareaInfo.append(
        pUsuarios,
        crearParrafo("Título", tarea.titulo, "tareaTitulo"),
        crearParrafo("Descripción", tarea.descripcion, "tareaDescripcion"),
        pEstado
    );

    const tareaAcciones = document.createElement("div");
    tareaAcciones.classList.add("tareaAcciones");

    // Botones según el contexto
    if (opciones.esVistaUsuario && opciones.usuarioActual) {
        if (estadoActual !== "completada") {
            const btnFinalizar = document.createElement("button");
            btnFinalizar.classList.add("btn", "btnSuccess", "btnFinalizarTarea");
            btnFinalizar.setAttribute("data-id", tarea.id);
            btnFinalizar.setAttribute("data-usuario", opciones.usuarioActual);
            btnFinalizar.textContent = "Finalizar";
            tareaAcciones.append(btnFinalizar);
        }
        // SE ELIMINÓ EL BOTÓN DESVINCULAR PARA EL USUARIO
    } else {
        const btnEditar = document.createElement("button");
        btnEditar.classList.add("btn", "btnEditarTarea");
        btnEditar.setAttribute("data-id", tarea.id);
        btnEditar.textContent = "Editar";
        
        // --- SEGURIDAD: Desactivar editar si ya está terminada ---
        if (estadoActual === "completada") {
            btnEditar.disabled = true;
            btnEditar.title = "No se puede editar una tarea finalizada por todos";
            btnEditar.style.opacity = "0.5";
            btnEditar.style.cursor = "not-allowed";
        }

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
// FILTROS Y ESTADO DE LA LISTA
// ============================================
let todasLasTareas = [];
let tareasFiltradasActualmente = [];

export const guardarTareasParaFiltro = (tareas) => {
    todasLasTareas = tareas;
    // Si no hay filtros aplicados, la lista filtrada es la misma que la completa
    if (tareasFiltradasActualmente.length === 0) tareasFiltradasActualmente = tareas;
};

export const obtenerTodasLasTareas = () => todasLasTareas;
export const obtenerTareasFiltradas = () => tareasFiltradasActualmente;

const aplicarFiltros = async (contenedor) => {
    const criterios = {
        estado: document.getElementById("filtroEstado").value,
        usuario: document.getElementById("filtroUsuario").value.trim()
    };

    tareasFiltradasActualmente = filtrarTareas(todasLasTareas, criterios);
    await armarListaTareas(contenedor, tareasFiltradasActualmente);
};

const limpiarFiltros = async (contenedor) => {
    document.getElementById("filtroEstado").value = "";
    document.getElementById("filtroUsuario").value = "";
    tareasFiltradasActualmente = todasLasTareas;
    await armarListaTareas(contenedor, todasLasTareas);
};

export const inicializarFiltros = (contenedor) => {
    const btnAplicar = document.getElementById("btnAplicarFiltros");
    const btnLimpiar = document.getElementById("btnLimpiarFiltros");

    if (btnAplicar) {
        btnAplicar.addEventListener("click", () => aplicarFiltros(contenedor));
    }
    
    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", () => limpiarFiltros(contenedor));
    }
    
    // NOTA: Se eliminaron los listeners de 'change' e 'input' para cumplir 
    // con el requisito de aplicar filtros solo al presionar el botón.
};