import { BrowserRouter } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import AppRoutes from "./router/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import theme from "./theme/theme";
import { LanguageProvider, ThemeProvider } from "./contexts/LanguageContext";
import TitleManager from "./components/TitleManager";

import "./styles/performanceOptimizations.css";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <ScrollToTop />
            <TitleManager />
            <div className="performance-container">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </MuiThemeProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
