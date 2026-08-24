import { createTheme } from '@mui/material/styles'
import theme, { brand } from '../theme'

const fieldRadius = 12

const adminTheme = createTheme(theme, {
  components: {
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: 'outlined',
      },
    },
    MuiFormControl: {
      defaultProps: {
        fullWidth: true,
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: fieldRadius,
          backgroundColor: brand.surface,
          transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
          '&:hover': {
            backgroundColor: brand.white,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: brand.plantGreenLight,
          },
          '&.Mui-focused': {
            backgroundColor: brand.white,
            boxShadow: `0 0 0 3px ${brand.plantGreenGlow}`,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: brand.plantGreen,
            borderWidth: 1.5,
          },
          '&.Mui-disabled': {
            backgroundColor: brand.beige,
          },
        },
        notchedOutline: {
          borderColor: brand.border,
        },
        input: {
          fontWeight: 600,
          color: brand.graphite,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          color: brand.textSecondary,
          '&.Mui-focused': {
            color: brand.plantGreenDark,
            fontWeight: 700,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 2,
          marginTop: 6,
          fontSize: '0.75rem',
          lineHeight: 1.35,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontWeight: 600,
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          alignItems: 'center',
        },
        label: {
          fontWeight: 600,
          fontSize: '0.9rem',
          color: brand.graphite,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: brand.plantGreen,
          },
          '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: brand.plantGreen,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          color: brand.graphite,
          paddingBottom: 8,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          paddingTop: '12px !important',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px !important',
          borderColor: `${brand.border} !important`,
          fontWeight: 800,
          color: brand.textSecondary,
          '&.Mui-selected': {
            bgcolor: `${brand.plantGreenMuted} !important`,
            color: `${brand.plantGreenDark} !important`,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 40,
        },
        indicator: {
          height: 3,
          borderRadius: 3,
          backgroundColor: brand.plantGreen,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 40,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.85rem',
          color: brand.textSecondary,
          '&.Mui-selected': {
            color: brand.plantGreenDark,
          },
        },
      },
    },
  },
})

export default adminTheme
