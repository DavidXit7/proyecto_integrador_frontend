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
  const todasLasTareas = await getTareas();
  return todasLasTareas.filter(tarea => 
    tarea.usuarios_asignados && tarea.usuarios_asignados.includes(documento)
  );
};

export const finalizarTareaParaUsuario = async (idTarea, documentoUsuario) => {
  // Obtener la tarea actual
  const tarea = await getTareasById(idTarea);
  
  // Siempre cambiar el estado a completada, sin importar si es individual o compartida
  const tareaActualizada = {
    ...tarea,
    estado: "completada"
  };
  return await actualizarTarea(idTarea, tareaActualizada);
};

export const desvincularUsuarioDeTarea = async (idTarea, documentoUsuario) => {
  // Obtener la tarea actual
  const tarea = await getTareasById(idTarea);
  
  // Si la tarea está asignada a múltiples usuarios, desvincular solo a este usuario
  // Si está asignada a un solo usuario, eliminar la tarea
  if (tarea.usuarios_asignados && tarea.usuarios_asignados.length > 1) {
    // Tarea compartida: desvincular usuario
    const usuariosActualizados = tarea.usuarios_asignados.filter(doc => doc !== documentoUsuario);
    const tareaActualizada = {
      ...tarea,
      usuarios_asignados: usuariosActualizados
    };
    return await actualizarTarea(idTarea, tareaActualizada);
  } else {
    // Tarea individual: eliminarla
    return await eliminarTarea(idTarea);
  }
};

export const crearTarea = async (tarea) => {
  // Obtenemos todas las tareas para calcular el siguiente ID numerico
  const todas = await getTareas();
  const maxId = todas.reduce((max, t) => {
    const idNum = parseInt(t.id);
    return isNaN(idNum) ? max : Math.max(max, idNum);
  }, 0);

  tarea.id = (maxId + 1).toString();

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
  if (!solicitud.ok) throw new Error("Status " + solicitud.status + ": No se pudo eliminar la tarea (ID: " + id + ")");

  // Dependiendo de si la API devuelve contenido o no en DELETE:
  if (solicitud.status === 204) return { success: true };
  const datos = await solicitud.json();
  return datos;
};
