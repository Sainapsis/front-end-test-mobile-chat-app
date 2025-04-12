import React from 'react';
import { Button, StyleSheet, View, Alert } from 'react-native';
import { reinitializeDatabase } from '../database/db';
import { seedDatabase } from '../database/seed';

interface DatabaseInitializerProps {
    onComplete?: () => void;
}

export default function DatabaseInitializer({ onComplete }: DatabaseInitializerProps) {
    const handleInitialize = async () => {
        Alert.alert(
            "Reinicializar Base de Datos",
            "¿Estás seguro que quieres reinicializar completamente la base de datos al estado de fábrica? Esto eliminará TODOS los datos.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Reinicializar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Mostrar mensaje de carga
                            Alert.alert("Reinicializando", "Reinicializando base de datos...");

                            // Reinicializar la base de datos (eliminar tablas y recrearlas)
                            const success = await reinitializeDatabase();

                            if (success) {
                                // Sembrar la base de datos con datos iniciales
                                await seedDatabase();

                                // Notificar al usuario
                                Alert.alert("Éxito", "La base de datos ha sido reinicializada al estado inicial de fábrica.");

                                // Llamar al callback si se proporciona
                                if (onComplete) {
                                    onComplete();
                                }
                            } else {
                                Alert.alert("Error", "Error al reinicializar la base de datos. Por favor, intenta de nuevo.");
                            }
                        } catch (error) {
                            console.error("Error reinicializando la base de datos:", error);
                            Alert.alert("Error", "Ocurrió un error al reinicializar la base de datos.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Button
                title="Reinicializar BD"
                onPress={handleInitialize}
                color="#FF3B30"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderRadius: 8,
        padding: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
}); 