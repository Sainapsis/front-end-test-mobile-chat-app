interface MediaSelectionCallbacks {
    onSelectImage: () => void;
    onSelectVideo: () => void;
    onSelectFile: () => void;
}

export const handleMediaSelection = (buttonIndex: number, callbacks: MediaSelectionCallbacks) => {
    switch (buttonIndex) {
      case 1:
        callbacks.onSelectImage();
        break;
      case 2:
        callbacks.onSelectVideo();
        break;
      case 3:
        callbacks.onSelectFile();
        break;
      default:
        break;
    }
  };