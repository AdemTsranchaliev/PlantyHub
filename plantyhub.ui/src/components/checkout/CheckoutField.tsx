import Box from '@mui/material/Box'
import TextField, { type TextFieldProps } from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { brand } from '../../theme'

/** Shopify-style label-on-top field — no floating label, no empty helper spacing */
export default function CheckoutField({
  label,
  error,
  helperText,
  select,
  children,
  ...props
}: TextFieldProps & { label: string }) {
  return (
    <Box>
      <Typography
        component="label"
        sx={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: '#6B6F6C',
          mb: 0.4,
        }}
      >
        {label}
      </Typography>
      <TextField
        {...props}
        select={select}
        fullWidth
        error={error}
        helperText={error ? helperText : undefined}
        slotProps={{
          formHelperText: { sx: { mx: 0, mt: 0.4, fontSize: '0.75rem' } },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            minHeight: 40,
            borderRadius: '5px',
            bgcolor: '#fff',
            fontSize: '0.875rem',
            color: brand.graphite,
            '& fieldset': { borderColor: '#D4D7D2' },
            '&:hover fieldset': { borderColor: '#A8ACA6' },
            '&.Mui-focused fieldset': { borderColor: brand.plantGreen, borderWidth: 1 },
            '&.Mui-error fieldset': { borderColor: '#C62828' },
          },
          '& .MuiOutlinedInput-input': { py: 0.85, px: 1.25 },
          '& .MuiSelect-select': { py: 0.85, px: 1.25 },
        }}
      >
        {children}
      </TextField>
    </Box>
  )
}
