import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

export const pickAndCompressImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImages = result.assets;
      const processedImages = [];

      for (const img of selectedImages) {
        const originalUri = img.uri;

        // Imagen optimizada (300px)
        const compressed = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 300 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Imagen preview (20px, muy pequeña)
        const preview = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 20 } }],
          { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Caching imagen principal
        const fileName = compressed.uri.split("/").pop();
        const cachePath = `${FileSystem.cacheDirectory}${fileName}`;
        const fileInfo = await FileSystem.getInfoAsync(cachePath);
        if (!fileInfo.exists) {
          await FileSystem.copyAsync({ from: compressed.uri, to: cachePath });
        }

        // Caching preview
        const previewName = preview.uri.split("/").pop();
        const previewPath = `${FileSystem.cacheDirectory}${previewName}`;
        const previewInfo = await FileSystem.getInfoAsync(previewPath);
        if (!previewInfo.exists) {
          await FileSystem.copyAsync({ from: preview.uri, to: previewPath });
        }

        processedImages.push({
          uri: cachePath,
          previewUri: previewPath,
        });
      }

      return processedImages;
    }
  };