import { createTheme, ThemeOptions } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Professional Color Palette - Black, Yellow, White
const colors = {
  // Primary - Sophisticated Black Variations
  black: {
    50: '#f8f9fa',
    100: '#e9ecef',
    200: '#dee2e6',
    300: '#ced4da',
    400: '#6c757d',
    500: '#495057',
    600: '#343a40',
    700: '#212529',
    800: '#1a1d20',
    900: '#0d1117',
    950: '#040507',
  },
  
  // Secondary - Premium Yellow/Gold Variations
  yellow: {
    50: '#fffef7',
    100: '#fffbeb',
    200: '#fff4c4',
    300: '#ffec8b',
    400: '#ffdd47',
    500: '#ffd700', // Main gold
    600: '#e6c200',
    700: '#cc9900',
    800: '#b38600',
    900: '#996600',
    950: '#664400',
  },
  
  // Neutral - Clean White/Gray Variations  
  white: {
    50: '#ffffff',
    100: '#fefefe',
    200: '#fdfdfd',
    300: '#fbfbfb',
    400: '#f8f8f8',
    500: '#f5f5f5',
    600: '#e8e8e8',
    700: '#d1d1d1',
    800: '#b4b4b4',
    900: '#8e8e8e',
    950: '#6b6b6b',
  },
  
  // Status Colors (Professional variants)
  success: '#00d4aa',
  warning: '#ff9500',
  error: '#ff3b30',
  info: '#007aff',
};

// Advanced Typography System
const typography: ThemeOptions['typography'] = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.015em',
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    fontWeight: 500,
    letterSpacing: '0.025em',
    textTransform: 'uppercase' as const,
  },
};

// Professional Shadow System
const shadows = [
  'none',
  '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // sm
  '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // md
  '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // lg
  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // xl
  '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // 2xl
  '0 0 0 1px rgba(255, 215, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)', // yellow glow sm
  '0 0 0 1px rgba(255, 215, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)', // yellow glow md
  '0 0 0 1px rgba(255, 215, 0, 0.15), 0 10px 15px -3px rgba(0, 0, 0, 0.1)', // yellow glow lg
  'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', // inset
  'inset 0 1px 2px 0 rgba(0, 0, 0, 0.1)', // inset sm
  '0 0 20px rgba(255, 215, 0, 0.3)', // yellow glow strong
  '0 8px 32px rgba(0, 0, 0, 0.12)', // floating
  '0 4px 16px rgba(0, 0, 0, 0.15)', // elevated
  '0 2px 8px rgba(0, 0, 0, 0.1)', // subtle
  '0 1px 4px rgba(0, 0, 0, 0.1)', // minimal
  '0 6px 20px rgba(0, 0, 0, 0.15)', // card
  '0 12px 28px rgba(0, 0, 0, 0.15)', // modal
  '0 16px 40px rgba(0, 0, 0, 0.15)', // drawer
  '0 20px 48px rgba(0, 0, 0, 0.18)', // popup
  '0 24px 56px rgba(0, 0, 0, 0.2)', // tooltip
  '0 28px 64px rgba(0, 0, 0, 0.22)', // menu
  '0 32px 72px rgba(0, 0, 0, 0.24)', // overlay
  '0 36px 80px rgba(0, 0, 0, 0.26)', // maximum
];

// Modern Theme Configuration
export const modernTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.black[800],
      light: colors.black[600],
      dark: colors.black[900],
      contrastText: colors.white[50],
    },
    secondary: {
      main: colors.yellow[500],
      light: colors.yellow[400],
      dark: colors.yellow[600],
      contrastText: colors.black[800],
    },
    background: {
      default: colors.white[50],
      paper: colors.white[50],
    },
    text: {
      primary: colors.black[800],
      secondary: colors.black[600],
    },
    divider: colors.white[600],
    success: {
      main: colors.success,
      contrastText: colors.white[50],
    },
    warning: {
      main: colors.warning,
      contrastText: colors.white[50],
    },
    error: {
      main: colors.error,
      contrastText: colors.white[50],
    },
    info: {
      main: colors.info,
      contrastText: colors.white[50],
    },
  },
  
  typography,
  
  shadows: shadows as any,
  
  shape: {
    borderRadius: 12, // Modern rounded corners
  },
  
  spacing: 8, // 8px base spacing unit
  
  components: {
    // AppBar - Premium Header
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.black[900],
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderBottom: `1px solid ${alpha(colors.yellow[500], 0.1)}`,
          backdropFilter: 'blur(8px)',
        },
      },
    },
    
    // Button - Ultra-modern button styles
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          backgroundColor: colors.black[800],
          color: colors.white[50],
          '&:hover': {
            backgroundColor: colors.black[700],
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          },
        },
        containedSecondary: {
          backgroundColor: colors.yellow[500],
          color: colors.black[800],
          '&:hover': {
            backgroundColor: colors.yellow[400],
            boxShadow: `0 4px 12px ${alpha(colors.yellow[500], 0.4)}`,
          },
        },
        outlined: {
          borderColor: colors.black[300],
          color: colors.black[700],
          '&:hover': {
            borderColor: colors.black[600],
            backgroundColor: alpha(colors.black[800], 0.04),
          },
        },
      },
    },
    
    // Card - Premium card styling
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${colors.white[600]}`,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    
    // Paper - Clean paper styling
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${colors.white[600]}`,
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    
    // TextField - Modern input styling
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: colors.white[100],
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: colors.white[200],
            },
            '&.Mui-focused': {
              backgroundColor: colors.white[50],
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.yellow[500],
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    
    // Chip - Modern chip styling
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: 28,
        },
        filled: {
          backgroundColor: colors.black[100],
          color: colors.black[700],
          '&:hover': {
            backgroundColor: colors.black[200],
          },
        },
        outlined: {
          borderColor: colors.black[300],
          color: colors.black[600],
        },
      },
    },
    
    // Table - Professional table styling
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      },
    },
    
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.white[400],
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            color: colors.black[700],
            borderBottom: `2px solid ${colors.white[600]}`,
          },
        },
      },
    },
    
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(colors.yellow[500], 0.04),
          },
          '&:last-child .MuiTableCell-root': {
            borderBottom: 'none',
          },
        },
      },
    },
    
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.white[600]}`,
          padding: '12px 16px',
        },
      },
    },
    
    // IconButton - Modern icon button
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: alpha(colors.yellow[500], 0.1),
            transform: 'scale(1.05)',
          },
        },
      },
    },
    
    // Drawer - Premium drawer styling
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '16px 0 0 16px',
          border: `1px solid ${colors.white[600]}`,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.18)',
        },
      },
    },
    
    // Badge - Modern badge styling
    MuiBadge: {
      styleOverrides: {
        badge: {
          borderRadius: 6,
          fontSize: '0.625rem',
          fontWeight: 600,
          minWidth: 18,
          height: 18,
        },
      },
    },
  },
});

// Dark theme variant
export const modernDarkTheme = createTheme({
  ...modernTheme,
  palette: {
    ...modernTheme.palette,
    mode: 'dark',
    background: {
      default: colors.black[950],
      paper: colors.black[900],
    },
    text: {
      primary: colors.white[100],
      secondary: colors.white[300],
    },
    divider: colors.black[700],
  },
  components: {
    ...modernTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.black[950],
          borderBottom: `1px solid ${alpha(colors.yellow[500], 0.2)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.black[900],
          border: `1px solid ${colors.black[700]}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.black[900],
          border: `1px solid ${colors.black[700]}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: colors.black[800],
            '&:hover': {
              backgroundColor: colors.black[700],
            },
            '&.Mui-focused': {
              backgroundColor: colors.black[800],
            },
          },
        },
      },
    },
  },
});

export { colors };
