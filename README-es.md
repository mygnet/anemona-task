# **Anemona Task GitLab**

[![Registro de cambios](https://img.shields.io/badge/Registro%20de%20cambios-0.0.2-orange)](https://github.com/mygnet/anemona-task/blob/main/CHANGELOG-es.md)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-blue)](https://github.com/mygnet/anemona-task/blob/main/LICENSE)
[![Leer en ingles](https://img.shields.io/badge/Leer%20en-Ingles-green)](README.md)

Extensión de VS Code que gestiona las incidencias de GitLab con apariencia de tareas asignadas, delegadas y estadística de avances en la barra lateral flotante o panel de vsc.


![Incidencias](/assets/github/screenshot.gif)


## **Características**
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
- (Admin) Eliminar una tare                    |


## **Cómo utilizar**

La extensión es muy fácil e intuitiva de usar y funciona en el panel de barra lateral:

### **Cambiar el idioma**
En este momento solo esta habilitado el idioma ingles y español
![Incidencias](/assets/github/lang.gif)

### **Iniciar sesión**
Se requiere que tengas una cuenta de control de versiones de **GitLab**, puede ser de cualquier servidor privado o publico ([gitlab.com](https://gitlab.com) u otro servidor), y generar tu ]**Token Acceso**. 

Para generar el **Token de Acceso** puedes ir en tu servidor GitLab a la opción de **Editar Perfil**, posteriormente en la barra lateral ir a la opción **Access Tokens**, introducir los valores a los campos **Token name**, **Expiration Date** y seleccionar **Select Scope** por lo menos la primer casilla como se muestra en la siguiente imagen:
![Incidencias](/assets/github/access-token.gif)

Una vez generado tu **Access Token** puedes usarlo para iniciar session de la siguiente manera:

![Incidencias](/assets/github/login.gif)

### **Dashboard**
Después de iniciar session se desplegara en el panel lateral el dashboard con las estadísticas de avances de las tareas(incidencias) del proyecto del control de versiones  seleccionado. 
![Incidencias](/assets/github/sel-project.gif)

###  **Listado**
Una vez seleccionado el proyecto, podrás ver las tareas(Incidencias) clasificadas y priorizadas en forma de lista donde podrás registrar el progreso, cerrar o abrir la tarea y aplicar filtros para su visualización.  
![Incidencias](/assets/github/list-tasks.gif)

###  **Agregar tareas(incidencias)**
En el mismo proyecto u otro previamente seleccionado puede agregar tareas(incidencias) de la siguiente manera:
![Incidencias](/assets/github/new-task.gif)

###  **Editar tareas(incidencias)**
Si tu eres el creador de la tarea(incidencia) te aparecerán las opciones para editar la tarea con forma de 3 puntos en la parte superior de la tarea. 
![Incidencias](/assets/github/edit-task.gif)

###   **Permisos de administrador**
Solo con permisos del administrador se podrán realizar algunas operaciones exclusivas para este rol.
- Eliminar tareas (incidencias) agregadas por mi.
- Cambiar la imagen del avatar
- Editar nombre del usuario

Si tienes el rol de administrador podrás realizas estas acciones, y como alternativa existe un campo al iniciar sesión que es opcional, es para especificar una Api de servicios para realizar estas acciones de administrador por medio del Api.
![Incidencias](/assets/github/admin.gif)


###   **incidencias de GitLab**
Demos un vistazo de las incidencias en el servidor de control de versiones GitLab que fueron agregadas, editas desde la extension vsc.
![Incidencias](/assets/github/issues.jpg)
