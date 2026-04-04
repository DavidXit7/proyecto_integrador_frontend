export const validar = (form, reglas) => {
  const errores = {}
  let formValido = true;

  for (const name in reglas) {
    // Obtenemos el elemento del formulario por el nombre o ID
    const campo = form.elements[name];
    const regla = reglas[name];

    if (!campo) continue;

    // Validación para NodeList (Radios, Checkboxes compartidos)
    if (campo instanceof NodeList || (campo.length > 0 && campo[0].type === "radio")) {
      let { esValido, mensaje } = validarGrupo(campo, regla)
      if (!esValido) {
        formValido = false;
        errores[name] = mensaje;
      }
    } else {
      // Validación para elementos individuales (input, select, textarea)
      let { esValido, mensaje } = validarCampoIndividual(campo, regla);
      if (!esValido) {
        formValido = false;
        errores[name] = mensaje;
      }
    }
  }

  return { valido: formValido, errores };
}

/**
 * Valida grupos de elementos (Radios o Checkboxes)
 */
const validarGrupo = (nodos, regla) => {
  if (!regla.required) return { esValido: true };
  
  let checked = false;
  for (const nodo of nodos) {
    if (nodo.checked) {
      checked = true;
      break;
    }
  }

  return {
    esValido: checked,
    mensaje: regla.mensaje || "Debes seleccionar al menos una opción"
  }
}

/**
 * Valida un campo individual (input, select, textarea)
 */
const validarCampoIndividual = (elemento, regla) => {
  const valor = elemento.value ? elemento.value.trim() : "";

  // 1. Regla de Obligatoriedad
  if (regla.required && valor === "") {
    return {
      esValido: false,
      mensaje: regla.mensaje || "Este campo es obligatorio"
    }
  }

  // Si el campo está vacío y no es obligatorio, no aplicamos el resto de reglas (Regex, min, max)
  if (valor === "") return { esValido: true };

  // 2. Regla de Mínimo
  if (regla.min && valor.length < regla.min) {
    return {
      esValido: false,
      mensaje: regla.mensajeMin || `Debe tener al menos ${regla.min} caracteres`
    }
  }

  // 3. Regla de Máximo
  if (regla.max && valor.length > regla.max) {
    return {
      esValido: false,
      mensaje: regla.mensajeMax || `Debe tener máximo ${regla.max} caracteres`
    }
  }

  // 4. Regla de Patrón (Expresión Regular)
  if (regla.pattern && !regla.pattern.test(valor)) {
    return {
      esValido: false,
      mensaje: regla.mensajePattern || "Formato de texto no válido"
    }
  }

  return { esValido: true };
}