# Implementación de Cambios - Prueba Técnica

Este documento describe las correcciones de bugs y nuevas funcionalidades implementadas en el proyecto.

## Correcciones de Bugs

### Duplicación de chats con la misma persona
**Problema:**  
Existía un bug que permitía crear múltiples chats con la misma persona.

**Solución:**  
Se implementó una validación que verifica si ya existe un chat con el usuario seleccionado, impidiendo la creación de chats duplicados.

---

### Avatar de usuario con letras recortadas
**Problema:**  
Las iniciales en el avatar del perfil del usuario aparecían cortadas a la mitad.

**Solución:**  
Se ajustaron los estilos del componente Avatar para mostrar correctamente las iniciales sin recortes.

---

### Carga innecesaria de mensajes al iniciar
**Problema:**  
La aplicación cargaba todos los mensajes de todos los chats al inicio, afectando el rendimiento.

**Solución:**  
Se implementó carga bajo demanda, cargando solo los mensajes del chat cuando el usuario lo abre.

---

### Pressables con iconos no funcionales
**Problema:**  
Los botones que contenían iconos no respondían a las interacciones.

**Solución:**  
- Se migraron los iconos a IonIcons
- Se corrigieron los estilos de los componentes presionables

## Nuevas Funcionalidades

### Eliminar chats desde el listado
**Implementación:**  
Se añadió la opción de eliminar chats directamente desde la vista de listado mediante una alerta de confirmación.

---

### Editar/Eliminar mensajes individuales
**Implementación:**  
Se implementó un sistema de alertas con dos opciones:
- **Eliminar:** Borra el mensaje directamente
- **Editar:** Muestra un modal con el mensaje editable