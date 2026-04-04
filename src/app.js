// Importaciones específicas para usuarios
import { armarCiudades, armarGenero, armarListaUsuarios } from "../js/ui/index.js";
import { validar } from "../js/utils/validarFormulario.js";
import { ciudades, generos, getUsuarios, getUsuarioPorDocumento, crearUsuario, actualizarUsuario, eliminarUsuario } from "../js/api/index.js";
import Swal from 'sweetalert2';

let datosCiudades = [];
let datosGeneros = [];
let usuarioEditandoId = null;

const reglas = {
    documento: { 
        required: true, 
        pattern: /^[0-9]{7,10}$/, 
        mensajePattern: "Solo números (entre 7 y 10 dígitos)" 
    },
    nombre: { 
        required: true, 
        min: 3, 
        max: 30,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        mensajeMin: "Mínimo 3 caracteres",
        mensajeMax: "Máximo 30 caracteres",
        mensajePattern: "Solo se permiten letras y espacios"
    },
    genero: { 
        required: true, 
        mensaje: "Por favor, seleccione su género" 
    },
    ciudad: { 
        required: true 
    },
    correo: { 
        required: true, 
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
        mensajePattern: "Formato de correo no válido (ej: usuario@dominio.com)" 
    }
};

/**
 * FUNCIÓN DE INICIALIZACIÓN PARA LA VISTA DE USUARIOS
 */
export const initUsuarios = async () => {
    // Referencias DOM (se obtienen cada vez que se carga la vista)
    const formulario = document.querySelector("#formUsuario");
    const documentoInput = document.querySelector("#documento");
    const nombreInput = document.querySelector("#nombre");
    const correoInput = document.querySelector("#correo");
    const divGeneros = document.getElementById("generos");
    const ciudadIdSelect = document.querySelector("#ciudadId");
    const btnEnviar = document.querySelector("#btnEnviar");
    const listaUsuarios = document.querySelector("#listaUsuarios");
    const btnBuscar = document.querySelector("#btnBuscar");
    const buscarDocumentoInput = document.querySelector("#buscarDocumento");
    const resultadoBusqueda = document.querySelector("#resultadoBusqueda");

    // Si por alguna razón no está el formulario, salimos
    if (!formulario) return;

    // Funciones locales que dependen del DOM actual
    const limpiarErrores = () => {
        documentoInput.classList.remove("error");
        nombreInput.classList.remove("error");
        correoInput.classList.remove("error");
        formulario.querySelectorAll(".msgError").forEach(msg => msg.remove());
    };

    const mostrarErrores = (errores) => {
        for (const campo in errores) {
            const elemento = formulario.querySelector(`[name="${campo}"]`) || document.getElementById(campo);
            if (elemento) {
                elemento.classList.add("error");
                const msg = document.createElement("span");
                msg.classList.add("msgError", `msg${campo.charAt(0).toUpperCase() + campo.slice(1)}`);
                msg.textContent = errores[campo];
                elemento.parentElement.append(msg);
            }
        }
    };

    const limpiarFormularioUsuario = () => {
        formulario.reset();
        usuarioEditandoId = null;
        btnEnviar.textContent = "Enviar";
        limpiarErrores();
    };

    const cargarUsuariosEnLista = async () => {
        const usuarios = await getUsuarios();
        armarListaUsuarios(listaUsuarios, usuarios, datosCiudades, datosGeneros);
    };

    const cargarFormularioConUsuario = (usuario) => {
        documentoInput.value = usuario.documento;
        nombreInput.value = usuario.nombre;
        correoInput.value = usuario.correo;
        ciudadIdSelect.value = usuario.ciudad_id;

        const radios = document.querySelectorAll("input[name='genero']");
        radios.forEach((radio) => {
            if (Number(radio.value) === usuario.genero_id) {
                radio.checked = true;
            }
        });

        usuarioEditandoId = usuario.id;
        btnEnviar.textContent = "Actualizar";
    };

    // --- CARGA INICIAL DE DATOS ---
    try {
        datosCiudades = await ciudades();
        datosGeneros = await generos();
        
        armarGenero(divGeneros, datosGeneros);
        armarCiudades(ciudadIdSelect, datosCiudades);
        await cargarUsuariosEnLista();
    } catch (error) {
        console.error("Error al inicializar usuarios:", error);
    }

    // --- MANEJO DE EVENTOS ---
    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        limpiarErrores();
        
        const respuesta = validar(e.target, reglas);
        if (!respuesta.valido) {
            mostrarErrores(respuesta.errores);
            return;
        }

        const generoSeleccionado = document.querySelector("input[name='genero']:checked");
        if (!generoSeleccionado) {
            Swal.fire({ icon: 'warning', title: 'Género requerido', text: 'Selecciona un género.' });
            return;
        }

        const datosUsuario = {
            documento: documentoInput.value.trim(),
            nombre: nombreInput.value.trim(),
            genero_id: Number(generoSeleccionado.value),
            ciudad_id: Number(ciudadIdSelect.value),
            correo: correoInput.value.trim()
        };

        try {
            if (usuarioEditandoId !== null) {
                await actualizarUsuario(usuarioEditandoId, datosUsuario);
                await cargarUsuariosEnLista(); // Actualización simple para SPA
            } else {
                await crearUsuario(datosUsuario);
                await cargarUsuariosEnLista();
            }
            
            Swal.fire({ icon: 'success', title: 'Guardado', text: 'Operación exitosa', timer: 1500, showConfirmButton: false });
            limpiarFormularioUsuario();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        }
    });

    listaUsuarios.addEventListener("click", async (e) => {
        const btnEditar = e.target.closest(".btnEditarUsuario");
        if (btnEditar) {
            const id = btnEditar.getAttribute("data-id");
            const usuarios = await getUsuarios();
            const usuario = usuarios.find(u => String(u.id) === String(id));
            if (usuario) {
                cargarFormularioConUsuario(usuario);
                formulario.scrollIntoView({ behavior: "smooth" });
            }
        }

        const btnEliminar = e.target.closest(".btnEliminarUsuario");
        if (btnEliminar) {
            const idEliminar = btnEliminar.getAttribute("data-id");
            const result = await Swal.fire({
                title: '¿Eliminar usuario?',
                text: "No se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, borrar'
            });

            if (result.isConfirmed) {
                try {
                    await eliminarUsuario(idEliminar);
                    await cargarUsuariosEnLista();
                    Swal.fire('Eliminado', 'Usuario borrado', 'success');
                } catch (error) {
                    Swal.fire('Error', error.message, 'error');
                }
            }
        }
    });

    btnBuscar.addEventListener("click", async () => {
        const docValor = buscarDocumentoInput.value.trim();
        resultadoBusqueda.replaceChildren();

        if (docValor === "") {
            const p = document.createElement("p");
            p.classList.add("msgError");
            p.textContent = "Ingrese un documento";
            resultadoBusqueda.append(p);
            return;
        }

        const resultados = await getUsuarioPorDocumento(docValor);
        if (resultados.length > 0) {
            const u = resultados[0];
            const p = document.createElement("p");
            p.classList.add("msgEncontrado");
            p.textContent = `Encontrado: `;
            const strong = document.createElement("strong");
            strong.textContent = u.nombre;
            p.append(strong, ` (${u.documento})`);
            resultadoBusqueda.append(p);
        } else {
            const p = document.createElement("p");
            p.classList.add("msgNoEncontrado");
            p.textContent = "No se encontró el usuario";
            resultadoBusqueda.append(p);
        }
    });
};