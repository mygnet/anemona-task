# **Anemona Task GitLab**

[![Registro de cambios](https://img.shields.io/badge/Registro%20de%20cambios-0.1.0-orange)](https://github.com/mygnet/anemona-task/blob/main/CHANGELOG-es.md)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-blue)](https://github.com/mygnet/anemona-task/blob/main/LICENSE)
[![Leer en ingles](https://img.shields.io/badge/Leer%20en-Ingles-green)](README.md)

Extensión de VS Code que gestiona problemas de GitLab como actividades y tareas que se pueden asignar, delegar entre el grupo de miembros de un proyecto de control de versiones de  GitLab, se tiene un tablero con estadísticas del progreso, todo esto en la barra lateral flotante o panel de vscode, también se tienen un calendario con tareas pendientes de todos los proyectos asignados.

También se incorpora una utilidad muy imprescindible para nosotros los desarrolladores que es un llavero de contraseñas, para tenerlo disponible en nuestro espacio de trabajo, aprovechando los documentos que se pueden crear como snippets de GitLab, estos están encriptados con AES 256 bits, con dos niveles de cifrado, el primer nivel es con metadatos único y  propios del llavero cuando se genera, y el segundo nivel se cifra con una contraseña maestra que no se guarda, solo se usa para bloquear y desbloquear el llavero, algo importante es que los snippets guardados en gitlab son totalmente privados, solo el usuario propietario puede tener acceso.

![Issues](/assets/github/00-dash.gif)

## **Características**

### **Tareas(Incidencias)**
- Manejo de tareas (incidencias) para GitLab
- Comentarios por tareas (incidencias)
- Adjuntar imágenes en los comentarios
- Se conecta a servidores HTTP y HTTPS privados y públicos.
- Dashboard de estadísticas por proyecto.
- Búsqueda de proyecto para seleccionarlo.
- Listado de Tareas (incidencias) asignadas y delegadas
- Calendario y eventos de tareas pendientes de todos los proyectos
- Filtros de tareas por prioridad y estado
- Registra el progreso de la tarea
- Pausar/Activar tarea (incidencias)
- Cerrar o Abrir tarea (incidencias)
- Indicadores de tareas(incidencias) vencidas o proxima a vencer
- Indicador de barra que se agota cunado el tiempo se termina 
- Agregar más tarea y asignarlas a usuarios del proyecto
- Editar tareas (incidencias)
- Clasificar la importancias de las tareas
- Detecta los privilegios de administrador
- Idioma Ingles y Español
- (Admin) Cambiar imagen del avatar
- (Admin) Eliminar una tare

### **Llavero de contraseñas**
- No hay un limite de llaveros
- Se Pueden editar, Eliminar y Ordenar los llaveros generales
- Dentro del llavero no hay limite de las contraseñas o llaves que se pueden agregar
- Se pueden editar, eliminar y ordenar
- Se pueden bloquear/desbloquear con una contraseña maestra, se genera el cifrado de dos niveles
- Se pueden exportar las a llaves texto plano, json y formato cifrado.

## **Cómo utilizar**

La extensión es muy fácil e intuitiva de usar y funciona en el panel de barra lateral:

### **Idioma**

En versiones anteriores se podría cambiar de ingles/español desde la misma extension, en versiones 0.0.8 y siguientes se integra a las preferencias del idioma del vscode, se consideran las recomendaciones y los estándares i18n y package.nls para el manejo del idioma.

![Incidencias](/assets/github/03-lang.gif)

Aunque existe la posibilidad de ejecutar el comando: ctr+shit+P "anemona.task: Language: Spanish" o  "anemona.task: Language: English"  este se restaura al abrir nuevamente el VSC con idioma predeterminado de este.


### **Iniciar sesión**

Se requiere que tengas una cuenta de control de versiones de **GitLab**, puede ser de cualquier servidor privado o publico ([gitlab.com](https://gitlab.com) u otro servidor), y generar tu ]**Token Acceso**.

Para generar el **Token de Acceso** puedes ir en tu servidor GitLab a la opción de **Editar Perfil**, posteriormente en la barra lateral ir a la opción **Access Tokens**, introducir los valores a los campos **Token name**, **Expiration Date** y seleccionar **Select Scope** por lo menos la primer casilla como se muestra en la siguiente imagen:
![Incidencias](/assets/github/access-token.gif)

Una vez generado tu **Access Token** puedes usarlo para iniciar session de la siguiente manera:

![Incidencias](/assets/github/02-login.gif)

### **Dashboard**

Después de iniciar session se desplegara en el panel lateral el dashboard con las estadísticas de avances de las tareas(incidencias) del proyecto del control de versiones  seleccionado.
![Incidencias](/assets/github/04-dash.gif)

### **Listado**

Una vez seleccionado el proyecto, podrás ver las tareas(Incidencias) clasificadas y priorizadas en forma de lista donde podrás registrar el progreso, cerrar o abrir la tarea y aplicar filtros para su visualización.
![Incidencias](/assets/github/05-task.gif)

### **Agregar tareas(incidencias)**

En el mismo proyecto u otro previamente seleccionado puede agregar tareas(incidencias) de la siguiente manera:
![Incidencias](/assets/github/06-task-new.gif)

### **Editar tareas(incidencias)**

Si tu eres el creador de la tarea(incidencia) te aparecerán las opciones para editar la tarea con forma de 3 puntos en la parte superior de la tarea.
![Incidencias](/assets/github/07-task-edit.gif)

### **Pausar y activar tareas(incidencias)**
Aunque no es propiamente una funcionalidad de gitlab, pero se puede simular agregando una etiqueta "paused" de esta manera se puede pausar una tarea(incidencia).
![Incidencias](/assets/github/08-task-paused.gif)

### **Calendario de eventos y tareas(incidencias) pendientes**
Si eres de esos programadores que tienes varios proyectos al mismo tiempo, esta vista te podrá ayudar
a darte una idea de los pendientes que tienes. 

![Incidencias](/assets/github/09-task-events.gif)

### **Comentarios a las tareas(incidencias)**
Algo muy importante es agregar notas o comentarios a una tarea(incidencia) asi como adjuntar algunas imágenes para poder documentar el trabajo que se realiza en estas.

(**Importante**: Tienes que desmarcar la casilla den gitlab: "Require authentication to view media files" del proyecto para que puedas ver las imágenes, después del ejemplo pongo lo que tines que hacer para desmarcar la casilla.)

![Incidencias](/assets/github/10-task-comments.gif)

Desmarcar la casilla del proyecto en GitLab: 
![Incidencias](/assets/github/12-git-file.gif)

### **Permisos de administrador**

Si tienes permisos del administrador, entonces podrás realizar algunas operaciones exclusivas para este rol.

- Eliminar tareas (incidencias) agregadas por mi.
- Cambiar la imagen del avatar
- Editar nombre del usuario

![Incidencias](/assets/github/11-admin.gif)

### **incidencias de GitLab**

Demos un vistazo de las incidencias en el servidor de control de versiones GitLab que fueron agregadas, editas desde la extension vsc.
![Incidencias](/assets/github/issues.jpg)


## **Llavero de contraseñas**

### **Generar un llavero de contraseñas**

La administración de contraseñas es muy sencilla e intuitiva, como se muestra en la imagen el proceso de agregar un llavero.

![Incidencias](/assets/github/k0-add.gif)

### **Opciones en los llaveros de contraseñas**

Básicamente existen algunas opciones genéricas, agregar, editar y ordenar loas llaveros y listado de contraseñas, se puede destacar que pueden bloquear los llaveros con una contraseña maestra.

![Incidencias](/assets/github/k0-options.gif)

### **Exportar llaveros**

Como una utilidad es la opción de exportar los llaveros a simples archivos de texto plano, json y cifrado.

![Incidencias](/assets/github/k0-export.gif)

### **Echando un vistazo a los snippets dentro de gitlab**
Como se puede ver, en ningún momento se envía el contenido en texto claro, en todo momento se almacena  cifrado y en un modo privado donde solo el usuario podrá tener acceso desde gitlab.

![Incidencias](/assets/github/k0-gitlab.gif)


### *Control de cambios*

See [CHANGELOG.md](https://github.com/mygnet/anemona-task/blob/main/CHANGELOG-es.md)

### *Licencia*

See [LICENSE](https://github.com/mygnet/anemona-task/blob/main/LICENCE)