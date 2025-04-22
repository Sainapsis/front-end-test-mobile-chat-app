import { StyleSheet } from 'react-native';

export const chatRoomScreenStyles = StyleSheet.create({
    container: {
      flex: 1,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    messagesContainer: {
      padding: 10,
      flexGrow: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 10,
      alignItems: 'flex-end',
      // borderTopWidth: 0.2,
      borderTopColor: '#E1E1E1',
    },
    inputButtonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 8,
    },
    mediaButton: {
      marginRight: 8,
      padding: 4,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      // borderColor: '#E1E1E1',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      maxHeight: 100,
      // backgroundColor: '#FFFFFF',
    },
    sendButton: {
      marginLeft: 8,
      padding: 4,
    },
    disabledButton: {
      opacity: 0.5,
    },
    footerLoader: {
      borderRadius: 20,
      padding: 10,
      alignItems: 'center',
    },
    headerRight: {
      flexDirection: 'row',
      gap: 8,
      marginRight: 8,
    },
    mediaPreviewContainer: {
      marginHorizontal: 12,
      marginBottom: 8,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    mediaPreview: {
      width: '100%',
      height: 200,
      borderRadius: 12,
    },
    removeMediaButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: 12,
      padding: 4,
    },
    sendingButton: {
      opacity: 0.5,
    },
    videoPreviewContainer: {
      width: '100%',
      height: 200,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      overflow: 'hidden',
    },
    videoPreview: {
      width: '100%',
      height: '100%',
    },
    videoInfoContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 8,
      backgroundColor: '#fff',
    },
    videoPreviewText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#FFFFFF',
    },
    videoPreviewSize: {
      fontSize: 14,
      opacity: 0.7,
      color: '#FFFFFF',
    },
    filePreview: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#F0F0F0',
      borderRadius: 12,
      gap: 12,
      width: '100%',
    },
    fileInfo: {
      flex: 1,
      flexShrink: 1,
    },
    filePreviewText: {
      fontSize: 14,
      color: '#000000',
      flexWrap: 'wrap',
    },
    filePreviewSize: {
      fontSize: 12,
      color: '#666666',
      marginTop: 4,
    },
}); 