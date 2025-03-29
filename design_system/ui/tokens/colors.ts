const tintLight = "#5BE099FF";
const tintDark = "#FFFFFF";

export const palette = {
  primary: {
    lighter: "#E3F2FD",
    light: "#64F6A3FF",
    main: "#2CC5C0FF",
    dark: "#0F1631FF",
    darker: "#0E203BFF",
  },
  neutral: {
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
  success: {
    light: "#81C784",
    main: "#4CAF50",
    dark: "#388E3C",
  },
  error: {
    light: "#E57373",
    main: "#F44336",
    dark: "#D32F2F",
  },
  warning: {
    light: "#FFD54F",
    main: "#FFC107",
    dark: "#FFA000",
  },
  overlay: {
    light: "rgba(0, 0, 0, 0.5)",
    dark: "rgba(255, 255, 255, 0.1)",
  },
  border: {
    default: "#E0E0E0",
  },
};

export const themes = {
  light: {
    ...palette,
    text: {
      primary: "#11181C",
      secondary: "#687076",
      disabled: palette.neutral[500],
      contrast: "#FFFFFF",
      black: "#000000",
    },
    background: {
      main: "#FFFFFF",
      surface: palette.neutral[100],
      elevated: "#FFFFFF",
      black: "#000000",
    },
    button: {
      primary: { background: palette.primary.main, text: "#FFFFFF", border: palette.primary.dark },
      secondary: { background: palette.neutral[100], text: "#11181C", border: palette.neutral[400] },
      outline: { background: "transparent", text: palette.primary.main, border: palette.primary.main },
      ghost: { background: "transparent", text: palette.primary.main, border: "transparent" },
      disabled: { background: palette.neutral[300], text: palette.neutral[500], border: palette.neutral[400] },
    },
    icon: {
      default: "#687076",
      active: tintLight,
    },
    tabIcon: {
      default: "#687076",
      selected: tintLight,
    },
    tint: tintLight,
    overlay: {
      light: "rgba(0, 0, 0, 0.5)",
      dark: "rgba(255, 255, 255, 0.1)",
    },
  },

  dark: {
    ...palette,
    text: {
      primary: "#ECEDEE",
      secondary: "#9BA1A6",
      disabled: palette.neutral[600],
      contrast: "#151718",
      black: "#000000",
    },
    background: {
      main: "#151718",
      surface: "#1F2326",
      elevated: "#2C2F33",
      black: "#000000",
    },
    button: {
      primary: { background: palette.primary.dark, text: "#FFFFFF", border: palette.primary.darker },
      secondary: { background: palette.neutral[800], text: "#ECEDEE", border: palette.neutral[700] },
      outline: { background: "transparent", text: palette.primary.light, border: palette.primary.light },
      ghost: { background: "transparent", text: palette.primary.light, border: "transparent" },
      disabled: { background: palette.neutral[700], text: palette.neutral[500], border: palette.neutral[600] },
    },
    icon: {
      default: "#9BA1A6",
      active: tintDark,
    },
    tabIcon: {
      default: "#D2D8DDFF",
      selected: tintDark,
    },
    tint: tintDark,
    overlay: {
      dark: "rgba(0, 0, 0, 0.5)",
      light: "rgba(255, 255, 255, 0.7)",
    },
  },
};
