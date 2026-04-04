# Integrantes del proyecto: David Rueda - Alejandro Peña - Karen Michelle

# Propósito del Proyecto
Aplicación web construida con HTML, CSS y JavaScript vanilla para gestionar usuarios y tareas de manera colaborativa. La interfaz de usuario consume una API REST personalizada para permitir una experiencia dinámica y fluida (SPA).

*   Visualizar y gestionar usuarios del sistema.
*   Crear, asignar y gestionar tareas con estados independientes.
*   Consultar tareas por usuario y actualizar su progreso.
*   Proveer una experiencia de usuario intuitiva, moderna y sin recargas de página.

# Tecnologías Utilizadas
*   **HTML5** — Estructura semántica de la aplicación.
*   **CSS3** — Estilos modernos, responsivos y con variables de diseño.
*   **JavaScript Vanilla** — Lógica del cliente, manipulación segura del DOM y enrutamiento SPA.
*   **Vite** — Servidor de desarrollo y herramienta de empaquetado (build).
*   **Fetch API** — Comunicación asíncrona con el backend REST.
*   **SweetAlert2** — Notificaciones y diálogos de confirmación premium.

# Estructura del Proyecto
```text
proyecto_integrador_frontend/
├── index.html                    # Carcasa principal (Shell) de la SPA
├── package.json                  # Dependencias y scripts del proyecto
├── css/                          # Hojas de estilos globales y componentes
│   └── styles.css                # Estilos generales y diseño responsive
├── js/
│   ├── api/                      # Configuración y conexión con la API
│   │   ├── index.js              # Exportación central de servicios API
│   │   ├── getTareas.js          # Peticiones para tareas
│   │   ├── getUsuarios.js        # Peticiones para usuarios
│   │   └── getCiudades.js / getGeneros.js # Datos paramétricos
│   ├── router.js                 # Motor de rutas SPA (Hash-based)
│   ├── services/                 # Lógica de negocio avanzada
│   │   ├── index.js              # Exportación de servicios
│   │   └── tareasService.js      # Cálculo de estados y filtros complejos
│   ├── ui/                       # Componentes de interfaz de usuario
│   │   ├── usuarios.js / tareas.js # Renderizado de cards
│   │   ├── crearTareas.js        # Formulario de creación
│   │   ├── menuUsuario.js        # Panel personal
│   │   ├── notificaciones.js     # Alertas (SweetAlert2)
│   │   └── exportar.js           # Exportación a JSON
│   └── utils/                    # Funciones de utilidad
│       └── validarFormulario.js  # Motor de validación con Regex
├── src/
│   ├── main.js                   # Punto de entrada inicial de Vite
│   └── views/                    # Plantillas HTML modulares (Snippets)
│       ├── usuarios.html         # Vista de administración de usuarios
│       ├── tareas.html           # Vista de gestión de tareas
│       └── menu.html             # Vista de tareas por usuario
└── public/                       # Activos estáticos
```

# Requisitos Previos
Antes de ejecutar el proyecto es necesario tener instalado:
*   Node.js versión 18 o superior.
*   El backend del proyecto debe estar corriendo en `http://localhost:3000`.

# Configuración de la API
La aplicación se conecta automáticamente al backend que debe estar corriendo en:
`http://localhost:3000`

Asegúrate de que el backend esté configurado (archivo `.env`) y funcionando antes de iniciar el frontend.

# Cómo ejecutar el proyecto
### Paso 1 — Instalar dependencias
```bash
npm install
```
### Paso 2 — Iniciar el servidor de desarrollo
```bash
npm run dev
```
### Paso 3 — Acceder a la aplicación
Abre tu navegador y navega a la URL proporcionada por Vite (usualmente):
`http://localhost:5173`

# Características de la aplicación

### Panel de Administración
*   **Gestión de Usuarios**: Crear, consultar, actualizar y eliminar (Soft Delete) usuarios.
*   **Gestión de Tareas**: Crear, asignar a múltiples usuarios y administrar tareas.
*   **Filtros Avanzados**: Búsqueda por documento/nombre y estado global calculado.

### Vista de Usuario
*   **Mis Tareas**: Consultar las tareas asignadas específicamente al usuario seleccionado.
*   **Actualización de Estado**: Cada usuario puede marcar su tarea como "Completada" de forma independiente.
*   **Resumen**: Contador en tiempo real de tareas pendientes y terminadas.

# Componentes Principales

### 1. Sistema SPA (Single Page Application)
*   Utiliza navegación por **Hashes** (`#/usuarios`, `#/tareas`, `#/menu`).
*   Carga dinámica de plantillas desde `src/views/` sin parpadeos.

### 2. Panel de Administración (`src/views/usuarios.html` y `tareas.html`)
*   Formularios validados con expresiones regulares (Email y Documento).
*   Tablas e hilos de tarjetas interactivas con opciones CRUD.
*   Bloqueo de edición para tareas 100% finalizadas.

### 3. Vista de Usuario (`src/views/menu.html`)
*   Interfaz simplificada centrada en el cumplimiento de tareas.
*   Botones de acción que actualizan solo la asignación del usuario actual.

# Estilos y Diseño
*   **Diseño Responsive**: Adaptable a móviles, tablets y escritorio.
*   **Interfaz Limpia**: Uso intensivo de Flexbox y CSS Variables.
*   **Sin innerHTML**: Manipulación del DOM mediante métodos seguros y eficientes.

# Integración con Backend
La aplicación consume los siguientes endpoints:
*   **Usuarios**: `GET /usuarios`, `POST /usuarios`, `PUT /usuarios/:id`, `DELETE /usuarios/:id`.
*   **Tareas**: `GET /tareas`, `POST /tareas`, `PUT /tareas/:id`, `DELETE /tareas/:id`.
*   **Asignaciones**: `GET /tareas/usuario/:doc`, `PUT /tareas/finalizar`.

# Manejo de Errores
*   Validación de campos obligatorios y formatos (Regex).
*   Manejo de errores de conexión con SweetAlert2.
*   Confirmación interactiva antes de eliminar o finalizar acciones críticas.

# Scripts Disponibles
*   `npm run dev`: Inicia servidor de desarrollo.
*   `npm run build`: Construye versión de producción en carpeta `dist`.
*   `npm run preview`: Previsualiza la versión construida.

# Notas Importantes
*   Asegúrate que el backend esté corriendo antes de iniciar la navegación.
*   Todos los cambios se reflejan en tiempo real gracias a la conexión con la base de datos SQL.
*   Diseño optimizado para Chrome, Edge y Firefox.