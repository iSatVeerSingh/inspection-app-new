import { ChakraProvider } from "@chakra-ui/react";
import ReactDOM from "react-dom/client";
import theme from "./theme";
import App from "./App";
import "./app.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
