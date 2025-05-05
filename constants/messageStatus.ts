export const MESSAGE_STATUS = {
    SENT: 'sent',
    READ: 'read',
} as const;

export const STATUS_ICONS = {
    [MESSAGE_STATUS.SENT]: {
      name: 'checkmark',
      size: 12,
      colors: {
        light: '#000000',
        dark: '#FFFFFF'
      }
    },
    [MESSAGE_STATUS.READ]: {
      name: 'checkmark.square',
      size: 12,
      colors: {
        light: '#4CAF50',
        dark: '#4CAF50'
      }
    }
  } as const;