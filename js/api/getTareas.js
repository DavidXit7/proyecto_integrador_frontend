export const getTareas = async () => {
  const solicitud = await fetch('http://localhost:3000/tareas');
  const datos = await solicitud.json();
  return datos;
};

export const getTareasById = async (id) => {
  const solicitud = await fetch(`http://localhost:3000/tareas/${id}`);
  if (!solicitud.ok) throw new Error("Status " + solicitud.status + ": No se pudo obtener la tarea (ID: " + id + ")");
  const datos = await solicitud.json();
  return datos;
};

export const getTareasPorUsuario = async (documento) => {
    // Ahora usamos el endpoint eficiente del backend
    const solicitud = await fetch(`http://localhost:3000/tareas/user/${documento}`);
    if (!solicitud.ok) throw new Error("No se pudieron obtener las tareas del usuario");
    const datos = await solicitud.json();
    return datos;
};

export const finalizarTareaParaUsuario = async (idTarea, documentoUsuario) => {
    // Llamamos al nuevo endpoint de estado independiente
    const solicitud = await fetch('http://localhost:3000/tareas/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idTarea,
            documentoUsuario,
            estado: "completada"
        })
    });
    
    if (!solicitud.ok) throw new Error("No se pudo marcar la tarea como completada");
    const datos = await solicitud.json();
    return datos;
};

export const desvincularUsuarioDeTarea = async (idTarea, documentoUsuario) => {
  // Esta funcionalidad ahora solo la tendrá el administrador (opcional para el futuro)
  // Por ahora la mantenemos pero el botón será eliminado de la vista de usuario.
  const tarea = await getTareasById(idTarea);
  
  if (tarea.usuarios_asignados && tarea.usuarios_asignados.length > 1) {
    const usuariosFiltrados = tarea.usuarios_asignados
        .filter(u => u.documento !== documentoUsuario)
        .map(u => u.documento); // Extraemos solo los documentos

    const tareaActualizada = {
      ...tarea,
      usuarios_asignados: usuariosFiltrados
    };
    return await actualizarTarea(idTarea, tareaActualizada);
  } else {
    return await eliminarTarea(idTarea);
  }
};

export const crearTarea = async (tarea) => {
  const solicitud = await fetch('http://localhost:3000/tareas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tarea)
  });
  if (!solicitud.ok) throw new Error("Status " + solicitud.status + ": No se pudo crear la tarea");
  const datos = await solicitud.json();
  return datos;
};

export const actualizarTarea = async (id, tarea) => {
  const solicitud = await fetch(`http://localhost:3000/tareas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...tarea, id: id })
  });
  if (!solicitud.ok) throw new Error("Status " + solicitud.status + ": No se pudo actualizar la tarea (ID: " + id + ")");
  const datos = await solicitud.json();
  return datos;
};

export const eliminarTarea = async (id) => {
  const solicitud = await fetch(`http://localhost:3000/tareas/${id}`, {
    method: 'DELETE'
  });

  if (!solicitud.ok) {
    let mensajeError = "No se pudo eliminar la tarea";
    try {
      const errorData = await solicitud.json();
      mensajeError = errorData.msn || mensajeError;
    } catch (e) {
      // Si no hay JSON, usamos el status
      mensajeError = `Status ${solicitud.status}: ${mensajeError}`;
    }
    throw new Error(mensajeError);
  }

  if (solicitud.status === 204) return { success: true };
  const datos = await solicitud.json();
  return datos;
};