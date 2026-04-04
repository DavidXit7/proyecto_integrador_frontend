/**
 * MOTOR DE NAVEGACIÓN SPA - VANILLA JS
 * Gestiona el cambio de vistas sin recargar la página.
 */

// 1. Importar las plantillas HTML como strings (Vite ?raw)
import viewUsuarios from '../src/views/usuarios.html?raw';
import viewTareas from '../src/views/tareas.html?raw';
import viewMenu from '../src/views/menu.html?raw';

// 2. Importar los inicializadores de lógica
import { initUsuarios } from '../src/app.js';
import { initTareas } from './ui/crearTareas.js';
import { initMenu } from './ui/menuUsuario.js';

// 3. Mapeo de rutas
const routes = {
    '/': { html: viewUsuarios, init: initUsuarios },
    '/usuarios': { html: viewUsuarios, init: initUsuarios },
    '/tareas': { html: viewTareas, init: initTareas },
    '/menu': { html: viewMenu, init: initMenu }
};

/**
 * Función principal del Router
 */
export const router = async () => {
    const app = document.getElementById('app');
    
    // Obtener la ruta actual del Hash (ej: #/tareas -> /tareas)
    const url = window.location.hash.slice(1) || '/';
    
    // Buscar la ruta en el mapa o cargar 404 (opcional)
    const route = routes[url] || routes['/'];

    // Inyectar el HTML de la vista de forma segura y eficiente
    app.replaceChildren(); // Limpiar el contenedor primero
    const fragment = document.createRange().createContextualFragment(route.html);
    app.appendChild(fragment);

    // Ejecutar la lógica de JavaScript asociada a esa vista
    if (route.init) {
        await route.init();
    }
};

// Escuchar cambios en la URL y carga inicial
window.addEventListener('hashchange', router);
window.addEventListener('load', router);