import React, { useState, memo, useEffect } from "react";
import { View, StyleSheet, Pressable, Modal, Alert, TextInput, TouchableOpacity, useColorScheme } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { Message } from "@/hooks/useChats";
import { useAppContext } from "@/hooks/AppContext";
import { VoiceMessagePlayer } from "./VoiceMessagePlayer";
import { ForwardMessageModal } from "./ForwardMessageModal";
import { OptimizedImage } from "./OptimizedImage";
import { log, captureError, heavyFeedback, mediumFeedback, lightFeedback, selectionFeedback, successFeedback, errorFeedback, warningFeedback } from '@/utils';
import { Colors } from '@/constants/Colors';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  senderName?: string;
  onLongPress?: () => void;
  onForward?: (messageId: string) => void;
  onEdit?: (messageId: string, newText: string) => void;
  onDelete?: (messageId: string) => void;
}

function MessageBubbleComponent({ message, isCurrentUser, senderName, onLongPress, onForward, onEdit, onDelete }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showFullImage, setShowFullImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const { editMessage, deleteMessage } = useAppContext();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Log visualization of message when component mounts
  useEffect(() => {
    log.debug(`Message displayed [id: ${message.id}, type: ${message.messageType}]`);
  }, [message.id, message.messageType]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleLongPress = () => {
    // Retroalimentación háptica al mantener presionado un mensaje
    heavyFeedback();

    // Log interaction
    log.info(`Message long-pressed [id: ${message.id}]`);

    const options = [];

    // Opciones para mensajes propios
    if (isCurrentUser) {
      options.push(
        {
          text: "Editar",
          onPress: () => {
            selectionFeedback(); // Retroalimentación háptica al seleccionar editar
            setEditText(message.text);
            setIsEditing(true);
            log.debug(`Edit mode activated for message [id: ${message.id}]`);
          },
        },
        {
          text: "Eliminar",
          onPress: () => {
            selectionFeedback(); // Retroalimentación háptica al seleccionar eliminar
            Alert.alert(
              "Eliminar mensaje",
              "¿Estás seguro de que quieres eliminar este mensaje?",
              [
                {
                  text: "Cancelar",
                  style: "cancel",
                  onPress: () => lightFeedback(), // Retroalimentación ligera al cancelar
                },
                {
                  text: "Eliminar",
                  style: "destructive",
                  onPress: async () => {
                    warningFeedback(); // Retroalimentación de advertencia al confirmar eliminación
                    try {
                      log.info(`Deleting message [id: ${message.id}]`);
                      await deleteMessage(message.id);
                      successFeedback(); // Retroalimentación de éxito al eliminar
                    } catch (error) {
                      errorFeedback(); // Retroalimentación de error si falla
                      const errorId = captureError(
                        error instanceof Error ? error : new Error(String(error)),
                        {
                          action: 'deleteMessage',
                          messageId: message.id
                        }
                      );
                      log.error(`Failed to delete message [errorId: ${errorId}]`);
                      Alert.alert("Error", "No se pudo eliminar el mensaje. Inténtalo de nuevo.");
                    }
                  },
                },
              ]
            );
          },
          style: "destructive" as const,
        }
      );
    }

    // Opción de reenviar para todos los mensajes
    options.push(
      {
        text: "Reenviar",
        onPress: () => {
          selectionFeedback(); // Retroalimentación háptica al seleccionar reenviar
          setShowForwardModal(true);
          log.debug(`Forward modal opened for message [id: ${message.id}]`);
        }
      }
    );

    // Siempre añadir la opción de cancelar
    options.push({
      text: "Cancelar",
      style: "cancel" as const,
      onPress: () => lightFeedback(), // Retroalimentación ligera al cancelar
    });

    Alert.alert(
      "Opciones de mensaje",
      "¿Qué quieres hacer?",
      options
    );
  };

  const handleEditSubmit = async () => {
    if (editText.trim() === message.text) {
      lightFeedback(); // Retroalimentación ligera si no hay cambios
      setIsEditing(false);
      return;
    }

    try {
      mediumFeedback(); // Retroalimentación media al enviar la edición
      log.info(`Editing message [id: ${message.id}]`);
      const success = await editMessage(message.id, editText.trim());
      if (success) {
        successFeedback(); // Retroalimentación de éxito al editar
        setIsEditing(false);
      } else {
        throw new Error("Failed to edit message");
      }
    } catch (error) {
      errorFeedback(); // Retroalimentación de error si falla
      const errorId = captureError(
        error instanceof Error ? error : new Error(String(error)),
        {
          action: 'editMessage',
          messageId: message.id
        }
      );
      log.error(`Failed to edit message [errorId: ${errorId}]`);
      Alert.alert("Error", "No se pudo editar el mensaje. Inténtalo de nuevo.");
    }
  };

  const handleCancelEdit = () => {
    lightFeedback(); // Retroalimentación ligera al cancelar
    setEditText(message.text);
    setIsEditing(false);
    log.debug(`Edit canceled for message [id: ${message.id}]`);
  };

  const renderMessageStatus = () => {
    if (!isCurrentUser) return null;

    const iconColor = isDark ? "#FFFFFF80" : "#00000080";
    const iconSize = 14;

    switch (message.status) {
      case "sent":
        return (
          <MaterialIcons
            name="check"
            size={iconSize}
            color={iconColor}
          />
        );
      case "delivered":
        return (
          <MaterialIcons
            name="done-all"
            size={iconSize}
            color={iconColor}
          />
        );
      case "read":
        return (
          <MaterialIcons
            name="done-all"
            size={iconSize}
            color="#4CAF50"
          />
        );
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text":
        return isEditing ? (
          <View>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              style={{
                ...styles.messageText,
                ...(isCurrentUser && !isDark ? styles.selfMessageText : {}),
                ...styles.editInput,
                backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF"
              }}
              multiline
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleEditSubmit}
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                onPress={handleCancelEdit}
                style={[styles.editButton, styles.cancelButton]}
              >
                <ThemedText style={styles.editButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEditSubmit}
                style={[styles.editButton, styles.saveButton]}
              >
                <ThemedText style={styles.editButtonText}>Guardar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ThemedText
            style={{
              ...styles.messageText,
              ...(isCurrentUser && !isDark ? styles.selfMessageText : {})
            }}
          >
            {message.text}
            {message.isEdited && (
              <ThemedText style={styles.editedText}> (editado)</ThemedText>
            )}
          </ThemedText>
        );

      case "image":
        return (
          <View>
            <Pressable
              onPress={() => {
                lightFeedback(); // Retroalimentación ligera al abrir la imagen
                setShowFullImage(true);
              }}
            >
              <OptimizedImage
                source={{ uri: message.imagePreviewUri ?? message.imageUri }}
                style={styles.previewImage}
                resizeMode="cover"
                cacheKey={`preview_${message.id}`}
                priority="normal"
                prefetch={true}
              />
            </Pressable>
            {message.text && (
              <ThemedText
                style={{
                  ...styles.imageCaption,
                  ...(isCurrentUser && !isDark ? styles.selfMessageText : {})
                }}
              >
                {message.text}
              </ThemedText>
            )}
            <Modal
              visible={showFullImage}
              transparent={true}
              animationType="fade"
              onRequestClose={() => {
                lightFeedback(); // Retroalimentación ligera al cerrar la imagen
                setShowFullImage(false);
              }}
            >
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    lightFeedback(); // Retroalimentación ligera al cerrar la imagen
                    setShowFullImage(false);
                  }}
                >
                  <MaterialIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <OptimizedImage
                  source={{ uri: message.imageUri }}
                  style={styles.fullImage}
                  resizeMode="contain"
                  cacheKey={`full_${message.id}`}
                  priority="high"
                />
              </View>
            </Modal>
          </View>
        );

      case "voice":
        return (
          <View style={styles.voiceMessageContainer}>
            {message.voiceUri && message.voiceDuration && (
              <VoiceMessagePlayer
                uri={message.voiceUri}
                duration={message.voiceDuration}
              />
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (message.isDeleted) {
    return (
      <View
        style={[
          styles.container,
          isCurrentUser ? styles.selfContainer : styles.otherContainer
        ]}
        accessible={true}
        accessibilityLabel="Mensaje eliminado"
        accessibilityHint="Este mensaje ya no está disponible"
        accessibilityRole="none"
      >
        <View style={{
          ...styles.bubble,
          ...(isCurrentUser ? styles.selfBubble : styles.otherBubble),
          backgroundColor: isDark ? 'rgba(70, 70, 70, 0.7)' : 'rgba(240, 240, 240, 0.7)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(90, 90, 90, 0.5)' : 'rgba(220, 220, 220, 0.8)',
        }}>
          <ThemedText style={{
            ...styles.deletedText,
            color: isDark ? '#BBBBBB' : '#888888',
          }}>
            Este mensaje fue eliminado
          </ThemedText>
          <View style={styles.messageFooter}>
            <ThemedText style={{
              ...styles.timeText,
              opacity: 0.5
            }}>
              {formatTime(message.timestamp)}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      style={[
        styles.container,
        isCurrentUser ? styles.selfContainer : styles.otherContainer,
        { backgroundColor: isCurrentUser ? theme.messageBubbleSent : theme.messageBubble },
      ]}
      onLongPress={onLongPress || handleLongPress}
      delayLongPress={500}
    >
      <View
        style={[
          styles.bubble,
          isCurrentUser
            ? [
              styles.selfBubble,
              { backgroundColor: isDark ? theme.messageBubbleSent : theme.messageBubbleSent },
            ]
            : [
              styles.otherBubble,
              { backgroundColor: isDark ? theme.messageBubble : theme.messageBubble },
            ],
        ]}
      >
        {!isCurrentUser && senderName && (
          <ThemedText style={styles.senderName}>
            {senderName}
          </ThemedText>
        )}
        {renderMessageContent()}
        <View style={styles.messageFooter}>
          <ThemedText style={styles.timeText}>
            {formatTime(message.timestamp)}
          </ThemedText>
          {renderMessageStatus()}
        </View>
      </View>

      <ForwardMessageModal
        visible={showForwardModal}
        onClose={() => setShowForwardModal(false)}
        messageId={message.id}
        onForwardComplete={() => {
          log.info(`Message forwarded successfully [id: ${message.id}]`);
          Alert.alert("Éxito", "Mensaje reenviado correctamente");
        }}
      />
    </Pressable>
  );
}

// Utilizamos React.memo para evitar renderizaciones innecesarias
export const MessageBubble = memo(MessageBubbleComponent, (prevProps, nextProps) => {
  // Solo volver a renderizar si cambia alguna de estas propiedades
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.isEdited === nextProps.message.isEdited &&
    prevProps.message.isDeleted === nextProps.message.isDeleted &&
    prevProps.isCurrentUser === nextProps.isCurrentUser &&
    prevProps.senderName === nextProps.senderName &&
    prevProps.message.reactions.length === nextProps.message.reactions.length
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  selfContainer: {
    alignSelf: "flex-end",
  },
  otherContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selfBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  selfMessageText: {
    color: "#000000",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  imageCaption: {
    fontSize: 14,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },
  editedText: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: "italic",
  },
  deletedBubble: {
    backgroundColor: "rgba(240, 240, 240, 0.7)",
  },
  deletedText: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.7,
    color: "#888888",
  },
  editInput: {
    padding: 8,
    minHeight: 40,
    borderRadius: 8,
    marginBottom: 8,
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#9E9E9E",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  voiceMessageContainer: {
    minWidth: 200,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
});
