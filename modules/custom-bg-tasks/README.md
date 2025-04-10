# Custom Background Tasks for Expo

Plugin nativo para Expo que permite ejecutar código JavaScript en segundo plano cuando llegan notificaciones silenciosas o bajo demanda.

## Características

- Ejecuta código JavaScript en segundo plano (Android y iOS)
- Maneja automáticamente notificaciones silenciosas para ejecutar código
- Integración con bases de datos JavaScript en segundo plano
- API sencilla para controlar la ejecución de tareas
- Compatible con Expo y React Native

## Instalación

```bash
npx expo install custom-bg-tasks
```

## Uso

### Configuración básica

```tsx
import { CustomBgTasksModule } from 'custom-bg-tasks';

// Registrar para recibir notificaciones silenciosas
await CustomBgTasksModule.registerSilentNotificationHandler();

// Escuchar resultados de tareas en segundo plano
const subscription = CustomBgTasksModule.addListener(
  'onBackgroundTaskCompleted',
  (result) => {
    console.log('Task completed:', result);
    // result.taskId - ID de la tarea
    // result.success - éxito o fracaso
    // result.result - resultado (si success es true)
    // result.error - mensaje de error (si success es false)
  }
);

// Limpiar cuando ya no necesite escuchar
subscription.remove();
await CustomBgTasksModule.unregisterSilentNotificationHandler();
```

### Ejecutar código JavaScript en segundo plano

```tsx
// Ejecutar código JS en segundo plano
const taskId = await CustomBgTasksModule.executeJsInBackground({
  taskId: 'my-task-id', // opcional, se generará uno si no se proporciona
  jsCode: `
    // Tu código JavaScript aquí
    // Por ejemplo, operaciones de base de datos
    const result = await db.getAllItems();
    return JSON.stringify(result);
  `,
  timeout: 30000, // tiempo de espera en ms (opcional, predeterminado: 30000)
  persistence: false // mantener en segundo plano incluso si la app se cierra (opcional, predeterminado: false)
});

// Verificar si una tarea está en ejecución
const isRunning = await CustomBgTasksModule.isBackgroundTaskRunning(taskId);

// Detener una tarea en segundo plano
const wasStopped = await CustomBgTasksModule.stopBackgroundTask(taskId);
```

### Notificaciones silenciosas

Para ejecutar código cuando llega una notificación silenciosa, incluye un campo `js_db_execution` en los datos de la notificación que contenga el código JavaScript a ejecutar.

Ejemplo de payload de Firebase Cloud Messaging:

```json
{
  "data": {
    "js_db_execution": "await db.syncData(); return 'Sync completed';"
  },
  "content_available": true
}
```

## API

### CustomBgTasksModule

- `executeJsInBackground(options: BackgroundTaskOptions): Promise<string>`
  - Ejecuta código JavaScript en segundo plano y devuelve el ID de la tarea
- `registerSilentNotificationHandler(): Promise<void>`
  - Registra el manejador para ejecutar código cuando llegan notificaciones silenciosas
- `unregisterSilentNotificationHandler(): Promise<void>`
  - Anula el registro del manejador de notificaciones silenciosas
- `isBackgroundTaskRunning(taskId: string): Promise<boolean>`
  - Verifica si una tarea está actualmente en ejecución
- `stopBackgroundTask(taskId: string): Promise<boolean>`
  - Detiene una tarea en ejecución y devuelve true si se detuvo correctamente

### Eventos

- `onBackgroundTaskCompleted`
  - Se dispara cuando se completa una tarea en segundo plano

### Tipos

```typescript
type BackgroundTaskOptions = {
  taskId?: string;
  jsCode: string;
  timeout?: number;
  persistence?: boolean;
};

type BackgroundTaskResult = {
  taskId: string;
  success: boolean;
  result?: any;
  error?: string;
};
```

## Plataformas admitidas

- ✅ Android
- ✅ iOS
- ❌ Web

## Licencia

MIT 