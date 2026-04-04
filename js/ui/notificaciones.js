import Swal from 'sweetalert2';

// Configuración global para notificaciones tipo Toast (pequeñas, arriba a la derecha)
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

/**
 * Notifica un mensaje de éxito usando SweetAlert2 (Toast)
 * @param {string} mensaje 
 */
export const notificarExito = (mensaje) => {
    Toast.fire({
        icon: 'success',
        title: mensaje
    });
};

/**
 * Notifica un mensaje de error usando SweetAlert2 (Toast)
 * @param {string} mensaje 
 */
export const notificarError = (mensaje) => {
    Toast.fire({
        icon: 'error',
        title: mensaje
    });
};

/**
 * Notifica un mensaje de información usando SweetAlert2 (Toast)
 * @param {string} mensaje 
 */
export const notificarInfo = (mensaje) => {
    Toast.fire({
        icon: 'info',
        title: mensaje
    });
};

/**
 * Muestra un modal de confirmación interactivo
 * @param {string} titulo 
 * @param {string} texto 
 * @returns {Promise<boolean>} Resolves to true if confirmed
 */
export const confirmarAccion = async (titulo, texto) => {
    const result = await Swal.fire({
        title: titulo || '¿Estás seguro?',
        text: texto || "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
};