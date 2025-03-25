import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';

interface SkeletonLoaderProps {
    readonly width: number | string;
    readonly height: number;
    readonly borderRadius?: number;
    readonly style?: any;
}

export function SkeletonLoader({ width, height, borderRadius = 4, style }: SkeletonLoaderProps) {
    const colorScheme = useColorScheme();

    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: colorScheme === 'dark' ? '#404040' : '#E1E9EE',
                    opacity,
                },
                style,
            ]}
        />
    );
}

export function ChatItemSkeleton() {
    return (
        <View style={styles.chatItemContainer}>
            <SkeletonLoader width={50} height={50} borderRadius={25} />
            <View style={styles.chatItemContent}>
                <SkeletonLoader width={200} height={20} style={styles.marginBottom} />
                <SkeletonLoader width={150} height={16} />
            </View>
        </View>
    );
}

export function UserItemSkeleton() {
    return (
        <View style={styles.userItemContainer}>
            <SkeletonLoader width={50} height={50} borderRadius={25} />
            <View style={styles.userItemContent}>
                <SkeletonLoader width={150} height={20} style={styles.marginBottom} />
                <SkeletonLoader width={100} height={16} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
    chatItemContainer: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    chatItemContent: {
        marginLeft: 12,
        flex: 1,
    },
    userItemContainer: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    userItemContent: {
        marginLeft: 12,
        flex: 1,
    },
    marginBottom: {
        marginBottom: 8,
    },
}); 