# Pruebas de la Aplicación de Chat

Este directorio contiene las pruebas unitarias e integración para la aplicación de chat móvil.

## Estructura de directorios

- `__tests__/unit/`: Contiene todas las pruebas unitarias para componentes y hooks individuales
- `__tests__/integration/`: Contiene pruebas de integración que verifican la interacción entre múltiples componentes

## Cómo ejecutar las pruebas

### Utilizando npm

```bash
# Ejecutar todas las pruebas una vez
npm test

# Ejecutar pruebas en modo watch (se vuelven a ejecutar al guardar cambios)
npm run test:watch

# Ejecutar pruebas con informe de cobertura
npm run test:coverage
```

### Utilizando el script batch (solo Windows)

1. Navega al directorio `__tests__`
2. Ejecuta `run-tests.bat` haciendo doble clic en él o desde la línea de comandos
3. El script ejecutará todas las pruebas y mostrará los resultados

## Añadir nuevas pruebas

### Pruebas unitarias

Para añadir una nueva prueba unitaria:

1. Crea un nuevo archivo en `__tests__/unit/` con el formato `[NombreComponente].test.tsx` o `[NombreHook].test.ts`
2. Importa las dependencias necesarias:
   ```typescript
   import { render, fireEvent } from '@testing-library/react-native';
   import { renderHook } from '@testing-library/react';
   ```
3. Escribe tus pruebas usando el formato Jest:
   ```typescript
   describe('Nombre del componente o hook', () => {
     beforeEach(() => {
       // Configuración antes de cada prueba
     });
     
     it('debería hacer algo específico', () => {
       // Prueba específica
     });
   });
   ```

### Pruebas de integración

Para añadir una nueva prueba de integración:

1. Crea un nuevo archivo en `__tests__/integration/` con un nombre descriptivo que termine en `.test.tsx`
2. Configura los mocks necesarios para simular las dependencias
3. Escribe pruebas que verifiquen la interacción entre componentes

## Mocks

Los siguientes elementos están configurados con mocks para facilitar las pruebas:

- Base de datos (`database/db.ts`)
- Navegación con Expo Router
- Componentes nativos como imágenes o reproductores de audio
- Almacenamiento local

Si necesitas modificar estos mocks, revisa los archivos de configuración en:
- `jest.setup.js`
- `jest.config.js`

## Cobertura de código

Para ver un informe detallado de cobertura, ejecuta:

```bash
npm run test:coverage
```

Esto generará un directorio `coverage` con un informe HTML detallado que puedes abrir en tu navegador. 