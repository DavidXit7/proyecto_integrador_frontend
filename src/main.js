/**
 * PUNTO DE ENTRADA ÚNICO DE LA APLICACIÓN (SPA)
 * Aquí inicializamos el router y el estado global.
 */
import { router } from "../js/router.js";

// Inicializar el motor de rutas al cargar
document.addEventListener("DOMContentLoaded", () => {
    // El router ya se encarga de escuchar los HashChanges automáticamente.
    // Solo lo invocamos la primera vez para cargar la vista por defecto.
    router();
});