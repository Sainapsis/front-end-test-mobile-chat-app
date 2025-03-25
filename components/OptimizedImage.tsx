import React, { useState, memo } from 'react';
import { Image, ImageProps, ActivityIndicator, View, StyleSheet } from 'react-native';

interface OptimizedImageProps extends ImageProps {
    placeholder?: React.ReactNode;
    fallback?: React.ReactNode;
}

function OptimizedImageComponent({
    source,
    style,
    placeholder,
    fallback,
    ...rest
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Valor por defecto para placeholder
    const defaultPlaceholder = (
        <View style={[styles.placeholder, style]}>
            <ActivityIndicator color="#007AFF" />
        </View>
    );

    // Valor por defecto para fallback
    const defaultFallback = (
        <View style={[styles.placeholder, style]}>
            <ActivityIndicator color="#FF3B30" />
        </View>
    );

    if (hasError) {
        return <>{fallback || defaultFallback}</>;
    }

    return (
        <View style={style}>
            {isLoading && (placeholder || defaultPlaceholder)}
            <Image
                source={source}
                style={[style, isLoading && styles.hidden]}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
                {...rest}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
    },
    hidden: {
        opacity: 0,
    }
});

// Memorizamos el componente para evitar renderizaciones innecesarias
export const OptimizedImage = memo(OptimizedImageComponent); 