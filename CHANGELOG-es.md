# **Registro de cambios**

## [0.1.0] - 2022-08-13
- Se puede personalizar los colores de la activityBar de vscode con la finalidad de identificar rápidamente el espacio de trabajo.

## [0.0.9] - 2022-08-10
- Hay usuarios de GitLab que solo pueden generar snippets internos y públicos, por esta razón no pueden crear llaveros privados, por eso se agrego la opción para que en el caso de que no permita generar los snippets privados intente inmediatamente con nivel interno.
- En caso de que un snippets sea eliminado directamente desde gitlab, se implemento la opción de quitarlo de la lista cuando se intente abrir y no exista y devuelva un error 404.


## [0.0.8] - 2022-08-09
- Validación para que solo se pueda enviar imágenes archivos adjuntos en los comentarios.
- El idioma de la extension se ajusto a los estándares i18n y package.nls y se cambia cuando se elige el idioma de vscode, aunque existe la posibilidad de ejecutar el comando: ctr+shit+P "anemona.task: Language: Spanish" o  "anemona.task: Language: English"  este se restaura al abrir nuevamente el VSC con idioma predeterminado de este.
- Se incorporo una utilizada para los desarrolladores en general un llavero de contraseñas donde se usa criptografía para almacenarla en documentos de gitlab en snippets, se usa AES de 256 bits para el cifrado con una llave que se calcula con los metadatos únicos al momento de crear el llavero.
- Llaveros. No hay un limite para agregar los llaveros, se pueden editar, eliminar y proteger
- Al abrir los llaveros se podrán definir algunos campos opcionales que complementan a la contraseña para tener mejor organizado la información de los accesos.
- Al asignar una contraseña personalizada al llavero hay que tener cuidado de recordarla, ya que no hay manera de recuperar la información del llavero encriptado, pues la contraseña no se almacena, solo se usa como llave maestra para encriptar los datos.
- Opciones para ordenar los listados considerando el campo de titulo de la contraseña.
- Opciones para exportar el contenido del llavero a texto claro, cifrado, y en formato json.  


## [0.0.7] - 2022-08-04
- Se agrego indicadores de tareas vencidas y tareas al limite de tiempo.
- Se agrego una barra por cada tarea que va decreciendo cunando se acerca la fecha de termino.
- Se agrego la opción para definir una fecha de inicio, de lo contrario se toma la fecha de creación de la incidencia.
- el dashboard se agrego la opción para registrar el progreso global que se va registrando por cada una de las tareas(incidencia)
- Se agregó la opción para pausar/activar una tarea(incidencia) 
- Se agrego una vista de calendario donde se marcan y listan los proyectos con las tareas(incidencias) pendientes y pausadas.  
- En la sección de comentarios se habilito la opción para agregar imágenes adjuntas (para visualizarlas se requiere desmarcar la opción en la configuración general del proyecto en gitlab en versiones 15.3.0  en Visibility, project features, permissions: el checkbox de "Require authentication to view media files").
- En la Vista donde se muestran los comentarios se agrego un listado de logs que va registrando el gitlab de los cambios de la tarea(incidencia).
- Se corrigió el error que no permitía salir de la sesión al hacer un logout y volver a abrir la sesión.
- Se corrigió el error que al agregar una tarea(incidencia)) o asignarla, no regresaba al listado.

## [0.0.6] - 2022-07-20

- Se corrigió el error cuando se instala por primera vez version 0.0.5 sin tener versiones previas.
- Se corrigió el error al abrir la tarea (problema) con doble click.

## [0.0.5] - 2022-07-14

- Corrección de error al abrir la tarea(incidencia) en la pestaña

## [0.0.4] - 2022-07-14

- Sesión persistente de usuario de manera global
- Las actividades y selección del proyectos se mantiene persistes por espacios de trabajo
- Mejoras y optimizaciones en general

## [0.0.3] - 2022-07-11

- Corrección el problema del Reload que ocultaba la extension
- Corrección el avance persistente de progreso al cierre de la sesión
- Se agregar vista  en una pestaña de la tarea (incidencia)
- Se agregar opciones para realizar comentarios en las tareas(incidencias)
- Se incorpora las notas de incidencias del sistema (logs)
- Se agregan las fechas importantes de cierre y actualizaciones según el estado de la tarea(incidencia))
- Se realiza gestor de errores para los sucesos inesperados
- Mejoras y optimizaciones en general

## [0.0.2] - 2022-07-02

- Reportar el porcentaje de avance general en el dashboard
- Mejoras y optimizaciones en general

## [0.0.1] - 2022-06-24

- Manejo de tareas (incidencias) para GitLab
- Se conecta a servidores HTTP y HTTPS privados y públicos.
- Dashboard de estadísticas por proyecto.
- Búsqueda de proyecto para seleccionarlo.
- Listado de Tareas (incidencias) asignadas y delegadas
- Filtros de tareas por prioridad y estado
- Registra el progreso de la tarea
- Cerrar o Abrir tarea (incidencias)
- Agregar más tarea y asignarlas a usuarios del proyecto
- Editar tareas (incidencias)
- Clasificar la importancias de las tareas
- Detecta los privilegios de administrador
- Idioma Ingles y Español
- Posibilidad de habilitar un api services para realizar acciones de administrador
- (Admin) Cambiar imagen del avatar
- (Admin) Eliminar una tarea
