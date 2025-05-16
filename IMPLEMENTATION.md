# IMPLEMENTATION.md

## Documentación de Cambios

Este archivo documenta los cambios realizados por el usuario Jhoel Mogollon en el proyecto, junto con el razonamiento detrás de las decisiones tomadas, si corresponde.

## Cambios Realizados

### Fixes

1. **Ajustes en Estilos y Visualización de Botones**:
   - **Descripción:** Se ajustaron los estilos y la visualización de los botones para crear un nuevo chat y para enviar mensajes.
   - **Impacto:** Mejora la experiencia del usuario al proporcionar una interfaz más clara y atractiva para estas acciones.

### Features

1. **Edición y Eliminación de Mensajes**:
   - **Descripción:** Se implementaron funciones para editar y eliminar mensajes en los hooks `useChats` y `useChatsDb`. Estas funciones también se integraron en el `AppContext` para la gestión centralizada de mensajes.
   - **Impacto:** Permite a los usuarios editar y/o eliminar mensajes manteniendo presionado el mensaje enviado.

2. **Nuevas Columnas en la Tabla de Mensajes**:
   - **Descripción:** Se añadieron las columnas `isEdited`, `isDeleted`, `editedAt`, `deletedAt` y `originalText` a la tabla de mensajes para mejorar la gestión de mensajes.
   - **Impacto:** Proporciona soporte a nivel de base de datos para las funcionalidades de edición y eliminación de mensajes.

3. **Menú contextual para Edición y Eliminación de Mensajes**:
   - **Descripción:** Se añadieron nuevos estilos a la interfaz de usuario para la edición y/o eliminación de mensajes, implementando un menú contextual en el componente `MessageBubble`.
   - **Impacto:** Mejora la experiencia del usuario al proporcionar una interfaz intuitiva para editar y eliminar mensajes.

4. **Actualización de la Interfaz `Message`**:
   - **Descripción:** Se actualizó la interfaz `Message` para incluir atributos relacionados con la edición y eliminación de mensajes, como la recepción de lectura.
   - **Impacto:** Asegura que los datos necesarios para las nuevas funcionalidades estén disponibles en toda la aplicación.

5. **Implementación del Estado de Mensajes**:
   - **Descripción:** Se integró en el componente `ChatRoomScreen` y el componente `AppContext` en `MessageBubble` para gestionar y mostrar el estado de los mensajes.
   - **Impacto:** Mejora la visibilidad del estado de los mensajes (leído, editado, eliminado) en la interfaz.

6. **Integración del Estado de Mensajes**:
   - **Descripción:** Se integró el hook `useMessageStatus` que  y el componente `MessageStatusIcon` en `MessageBubble` para gestionar y mostrar el estado de los mensajes.
   - **Impacto:** Mejora la visibilidad del estado de los mensajes (leído, editado, eliminado) en la interfaz.

7. **Actualización Automática del Estado de Lectura**:
   - **Descripción:** Se implementó la funcionalidad para actualizar automáticamente el estado de lectura de los mensajes.
   - **Impacto:** Mejora la experiencia del usuario al marcar los mensajes como leídos sin necesidad de acciones manuales.

8. **Iconos de Confirmación de Lectura**:
   - **Descripción:** Se añadieron iconos de confirmación de lectura en el componente `IconSymbol` y se integraron en las burbujas de mensajes.
   - **Impacto:** Proporciona una representación visual clara del estado de lectura de los mensajes.

9. **Operaciones de Base de Datos para el Estado de Lectura**:
   - **Descripción:** Se añadieron operaciones de base de datos para gestionar el estado de lectura de los mensajes.
   - **Impacto:** Permite un manejo eficiente del estado de lectura a nivel de base de datos.

10. **Actualización del Hook `useChats`**:
    - **Descripción:** Se actualizó el hook `useChats` para manejar el estado de lectura de los mensajes.
    - **Impacto:** Centraliza la lógica de gestión del estado de lectura en un único lugar reutilizable.

11. **Funcionalidad de Estado de Lectura en el Contexto de la Aplicación**:
    - **Descripción:** Se añadió la funcionalidad de estado de lectura de mensajes al contexto de la aplicación.
    - **Impacto:** Facilita el acceso global al estado de lectura en toda la aplicación.

### Notas Adicionales

- [Ordering in chat rooms]: Se hizo la revisión del error de ordenamiento de los mensajes, se encontro que el ordenamiento se mostraba correctamente los mensajes como se especifica en el `README.md`.

