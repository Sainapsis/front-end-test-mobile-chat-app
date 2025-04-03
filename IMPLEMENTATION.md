# IMPLEMENTATION.md

## Resumen General

Este documento describe los cambios realizados en el proyecto como parte de la prueba técnica de Sainapsis. Se abordaron múltiples áreas del proyecto, incluyendo la implementación de nuevas funcionalidades, mejoras de rendimiento, corrección de errores, optimización de la arquitectura del código y mejoras en la experiencia de usuario (UI/UX). 

Además, se detalla el uso asistido de inteligencia artificial como herramienta de apoyo para la comprensión, estructuración y desarrollo del código, lo cual fue fundamental dado que el entorno del proyecto (React Native + Expo + Edge) era completamente nuevo para mí.

---

## Funcionalidades Implementadas

- Compartir archivos multimedia (en especial imágenes con vista previa comprimida).
- Confirmaciones de lectura con indicadores de estado (enviado, leído).
- Reacciones a mensajes con emojis.
- Creación y gestión de chats grupales.
- Función de búsqueda de mensajes.
- Eliminación y edición de mensajes.
- Grabación y reproducción de mensajes de voz.
- Reenvío de mensajes.
- **Avatares de usuario:** Se añadió la funcionalidad para mostrar avatares en los usuarios, inspirado en el diseño y usabilidad de aplicaciones como WhatsApp.

---

## Mejoras de Rendimiento

- Virtualización de la lista de mensajes para mejorar el rendimiento.
- Optimización de las consultas a la base de datos y del manejo del estado.
- Gestión eficiente de memoria para contenido multimedia.
- Paginación para cargar mensajes antiguos.

---

## Calidad de Código y Arquitectura

- Refactorización de componentes para mejorar la reutilización.
- Implementación de pruebas unitarias e integración.
- Mejora en la organización de carpetas y estructura del proyecto.
- Agregado de logs estructurados para depuración.

---

## Correcciones de Errores

- Corrección del orden de mensajes (los nuevos aparecen al final junto al input).
- Corrección de solapamiento del teclado en distintos dispositivos.

---

## Mejoras en UI/UX

- Soporte para modo oscuro.
- Estados de carga más claros y skeleton screens.
- Soporte básico para accesibilidad.
- Retroalimentación háptica para acciones relevantes.
- Animaciones más fluidas y mejora de pantallas vacías.

Además, para identificar mejoras visuales me basé en aplicaciones populares como **WhatsApp**, analizando elementos como disposición de mensajes, fluidez de interacción y estética. Esta referencia fue clave para detectar detalles como la implementación de **avatares por usuario**, una mejora visual relevante para la experiencia de chat.

---

## Uso de Inteligencia Artificial

La mayor parte del proyecto fue desarrollada con asistencia de IA, utilizando tres herramientas combinadas para maximizar la comprensión y calidad del trabajo:

1. **ChatGPT 4.0** – Utilizado desde el navegador para explicar conceptos y guiar refactorizaciones.
2. **Claude 3.7 (Anthropic - Claude Sonnet)** – Utilizado desde Cursor IDE, especialmente útil para entender partes del código y sugerir estructuras alternativas.
3. **Cursor IDE** – Utilizado para codificación guiada por IA, generación de fragmentos de código y explicaciones en contexto.

Cada intervención de IA fue revisada manualmente, ajustada según las necesidades del proyecto y explicada para garantizar que el código fuera comprendido y no introdujera errores.

---

## Contexto Personal

Este proyecto utilizaba tecnologías nuevas para mí, en particular el ecosistema de **React Native con Expo y Edge**. Durante los primeros días, el mayor reto fue hacer funcionar el entorno de desarrollo y comprender la estructura del proyecto. Aprendí lo esencial de Expo en tiempo récord para poder arrancar la app y empezar a trabajar en las mejoras.

Otro reto importante fue el **debugging de la aplicación**. Muchas veces el caché se bloqueaba o presentaba inconsistencias, y la base de datos local almacenaba muchos registros que no se eliminaban correctamente. Esto dificultaba la trazabilidad de las funcionalidades que estaba desarrollando. Por esta razón, decidí **agregar código que reiniciara o eliminara la base de datos cada vez que se reiniciara la app**, facilitando así un entorno de pruebas más limpio y controlado para poder avanzar eficientemente en la prueba técnica.

Este proceso de aprendizaje acelerado fue facilitado por las herramientas de IA, que me ayudaron a interpretar el código, entender los flujos y optimizar mis tiempos de desarrollo.

---

## Conclusión

La experiencia fue desafiante pero enriquecedora. No solo logré implementar todas las funcionalidades principales solicitadas, sino que también aporté mejoras estructurales que dejan la base del proyecto más robusta, escalable y legible. Agradezco la oportunidad de haber participado en esta prueba técnica.

