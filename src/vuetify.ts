import { getCache } from "./lib/cache";

// import Vue from "vue";
export const primary = "#9CF6F6"; // 00b4e8
export const secondary = "#F4FF52";
export const accent = "#F4FF52";
export const success = "#60993E"; //"#568259";
export const error = "#ED6A5A";

export const themeColors = {
  primary,
  secondary,
  blue: primary,
  purple: secondary,
  accent,
  yellow: accent,
  success,
  green: success,
  error,
  red: error,
  info: primary,
  warning: accent
};

export const vuetifyOptions = {
  // icons: {
  //   iconfont: "mdiSvg" as any // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4'
  // },
  theme: {
    customProperties: true,
    cspNonce: "dQw4w9WgXcQ",
    minifyTheme: css =>
      process.env.NODE_ENV === "production"
        ? css.replace(/[\s|\r\n|\r|\n]/g, "")
        : css,
    dark: getCache<"dark" | "light">("theme", "dark") === "dark",
    // https://vuetifyjs.com/en/customization/theme
    themes: {
      light: {
        ...themeColors
      },
      dark: {
        ...themeColors
      }
    }
  }
};
