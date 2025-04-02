import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ImageMessageProps {
  uri: string;
  thumbnailUri: string;
  isOwnMessage: boolean;
}

export const ImageMessage: React.FC<ImageMessageProps> = ({
  uri,
  thumbnailUri,
  isOwnMessage,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={[
          styles.imageContainer,
          isOwnMessage ? styles.ownImage : styles.otherImage,
        ]}
      >
        <Image
          source={{ uri: thumbnailUri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <MaterialIcons name="zoom-in" size={24} color="white" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <Image
            source={{ uri: uri }}
            style={styles.fullImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <MaterialIcons name="close" size={30} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    overflow: 'hidden',
    marginVertical: 4,
  },
  ownImage: {
    alignSelf: 'flex-end',
  },
  otherImage: {
    alignSelf: 'flex-start',
  },
  thumbnail: {
    width: 200,
    height: 200,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
}); 