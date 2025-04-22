import React from 'react';
import { Pressable } from 'react-native';
import { ThemedText } from '@/components/common/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { mediaPickerModalStyles } from '@/styles/components/mediaPickerModal.styles';

const MediaOptionButton = ({
    option,
    onPress,
    isDark
}: {
    option: { icon: string; label: string; action: string };
    onPress: () => void;
    isDark: boolean;
}) => (
    <Pressable
        style={({ pressed }) => [
            mediaPickerModalStyles.option,
            pressed && mediaPickerModalStyles.optionPressed
        ]}
        onPress={onPress}
        hitSlop={10}
    >
        <IconSymbol
            name={option.icon as any}
            size={24}
            color={isDark ? '#FFFFFF' : '#000000'}
        />
        <ThemedText style={mediaPickerModalStyles.optionText}>
            {option.label}
        </ThemedText>
    </Pressable>
);

export default MediaOptionButton;