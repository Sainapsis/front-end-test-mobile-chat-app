import React from 'react';
import { Modal, StyleSheet, SafeAreaView, View, Pressable, Platform } from 'react-native';
import { MessageSearch } from './MessageSearch';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/common/ThemedText';
import { BlurView } from 'expo-blur';
import { searchModalStyles } from '@/styles/components/searchModal.styles';
interface SearchModalProps {
    visible: boolean;
    onClose: () => void;
    chatId?: string;
}

export const SearchModal = ({ visible, onClose, chatId }: SearchModalProps) => {
    const { theme } = useAppContext();

    const isTransparent = Platform.OS === 'ios';

    const renderBackground = () => {
        if (Platform.OS === 'ios') {
            return <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />;
        }
        return null;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={isTransparent}
        >
            <View style={[
                searchModalStyles.container,
                Platform.OS === 'android' && { backgroundColor: theme.colors.background }
            ]}>
                {renderBackground()}

                <SafeAreaView style={searchModalStyles.safeArea}>
                    <View style={[searchModalStyles.header, { borderBottomColor: theme.colors.border }]}>
                        <Pressable onPress={onClose} style={searchModalStyles.backButton}>
                            <IconSymbol name="chevron-back" size={24} color={theme.colors.primary} />
                        </Pressable>
                        <ThemedText style={searchModalStyles.title}>Search Messages</ThemedText>
                        <View style={searchModalStyles.placeholder} />
                    </View>

                    <View style={searchModalStyles.content}>
                        <MessageSearch chatId={chatId} onClose={onClose} />
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

