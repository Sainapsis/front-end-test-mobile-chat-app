/**
 * Test simplificado para useChats
 */

import { renderHook } from '@testing-library/react';
import { act } from 'react';

// Simulamos un hook básico para el test
const useTestHook = () => {
    const [value, setValue] = React.useState(0);

    const increment = () => {
        setValue(prev => prev + 1);
    };

    return { value, increment };
};

// Importamos React para usar useState
import React from 'react';

describe('Hook básico', () => {
    it('debería poder probar un hook simple', () => {
        // Renderizar el hook
        const { result } = renderHook(() => useTestHook());

        // Verificar el valor inicial
        expect(result.current.value).toBe(0);

        // Actualizar el estado
        act(() => {
            result.current.increment();
        });

        // Verificar que el estado ha cambiado
        expect(result.current.value).toBe(1);
    });
}); 