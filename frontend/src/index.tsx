// React
import React from "react";
import ReactDOM from "react-dom";
// React Router
import { BrowserRouter } from "react-router-dom";
// Styled Component
import { ThemeProvider } from "styled-components";
// Context
import ContextProvider from "./providers/context";
// Components
import App from "./App";
// Styles
import GlobalStyle from "./styles/GlobalStyle";
import theme from "./styles/Theme";

ReactDOM.render(
  <React.StrictMode>
    <ContextProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
