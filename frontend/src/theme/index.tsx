import { extendTheme } from "@chakra-ui/react";

export default extendTheme({
  colors: {
    "app-bg": "#F0F0F6",
    "main-bg": "#FFFFFF",
    text: {
      500: "#667085",
      600: "#4D5464",
      700: "#333843",
      800: "#1A1C21",
    },
    primary: {
      50: "#EFEFFD",
      100: "#DEDEFA",
      500: "#5C59E8",
      600: "#4543AE",
    },
    neutral: {
      50: "#F4F7FE",
    },
  },
  borders: {
    stroke: "1px solid #C2C6CE",
    filter: "1px solid #5C59E8"
  },
});
