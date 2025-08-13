import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#dc004e",
      light: "#ff5983",
      dark: "#9a0036",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
    error: {
      main: "#f44336",
      light: "#e57373",
      dark: "#d32f2f",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#ff9800",
      light: "#ffb74d",
      dark: "#f57c00",
      contrastText: "#000000",
    },
    info: {
      main: "#2196f3",
      light: "#64b5f6",
      dark: "#1976d2",
      contrastText: "#ffffff",
    },
    success: {
      main: "#4caf50",
      light: "#81c784",
      dark: "#388e3c",
      contrastText: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Mulish", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      color: "#212121",
      fontWeight: 600,
    },
    h2: {
      color: "#212121",
      fontWeight: 600,
    },
    h3: {
      color: "#212121",
      fontWeight: 600,
    },
    h4: {
      color: "#212121",
      fontWeight: 600,
    },
    h5: {
      color: "#212121",
      fontWeight: 600,
    },
    h6: {
      color: "#212121",
      fontWeight: 600,
    },
    body1: {
      color: "#212121",
    },
    body2: {
      color: "#757575",
    },
    caption: {
      color: "#757575",
    },
    subtitle1: {
      color: "#212121",
    },
    subtitle2: {
      color: "#757575",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
        },
        html: {
          margin: 0,
          padding: 0,
        },
        "#root": {
          margin: 0,
          padding: 0,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: "#212121",
        },
        secondary: {
          color: "#757575",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#212121",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: "#212121",
        },
        head: {
          backgroundColor: "#f5f5f5",
          color: "#212121",
          fontWeight: 600,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5f5f5",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          color: "#212121",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1976d2",
          color: "#ffffff",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#212121",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#212121",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
        contained: {
          color: "#ffffff",
        },
        outlined: {
          color: "#1976d2",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          color: "#212121",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "#757575",
          "&.Mui-focused": {
            color: "#1976d2",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#757575",
          "&.Mui-focused": {
            color: "#1976d2",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: "#212121",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-input": {
            color: "#212121",
          },
        },
      },
    },
  },
});

export default theme;
