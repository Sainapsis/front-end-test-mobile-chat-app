import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import log from './logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Componente ErrorBoundary para capturar errores en el árbol de componentes React
 * 
 * Uso:
 * ```jsx
 * <ErrorBoundary>
 *   <ComponenteQuePodriaFallar />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Actualizar el estado para que el siguiente renderizado muestre la UI de fallback
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Puedes registrar el error en algún servicio de reporte de errores
        log.error('Error capturado por ErrorBoundary:', error);



        // Llamar al callback onError si existe
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Actualizar el estado con la información del error
        this.setState({
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    renderDefaultFallback() {
        const { error, errorInfo } = this.state;
        return (
            <View style={styles.container}>
                <Text style={styles.title}>¡Algo salió mal!</Text>
                <Text style={styles.message}>
                    La aplicación ha encontrado un error inesperado. Hemos registrado el problema
                    y estamos trabajando para solucionarlo.
                </Text>

                {__DEV__ && (
                    <ScrollView style={styles.detailsContainer}>
                        <Text style={styles.errorText}>{error?.toString()}</Text>
                        <Text style={styles.stackText}>{errorInfo?.componentStack}</Text>
                    </ScrollView>
                )}

                <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                    <Text style={styles.buttonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        if (this.state.hasError) {
            // Renderizar el fallback personalizado o el predeterminado
            return this.props.fallback || this.renderDefaultFallback();
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#dc3545'
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#343a40'
    },
    detailsContainer: {
        maxHeight: 300,
        width: '100%',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f1f3f5',
        borderRadius: 8
    },
    errorText: {
        color: '#dc3545',
        fontWeight: 'bold',
        marginBottom: 10
    },
    stackText: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
        color: '#6c757d'
    },
    button: {
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default ErrorBoundary; 