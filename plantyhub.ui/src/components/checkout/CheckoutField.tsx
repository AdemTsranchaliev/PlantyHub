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
  multiline,
  slotProps,
  id,
  ...props
}: TextFieldProps & { label: string }) {
  const htmlInput = slotProps?.htmlInput
  const htmlInputProps = typeof htmlInput === 'object' && htmlInput ? htmlInput : undefined

  return (
    <Box>
      <Typography
        component="label"
        htmlFor={id}
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
        id={id}
        select={select}
        multiline={multiline}
        fullWidth
        error={error}
        helperText={error ? helperText : undefined}
        slotProps={{
          ...slotProps,
          htmlInput: {
            enterKeyHint: multiline ? 'done' : 'next',
            ...htmlInputProps,
          },
          formHelperText: { sx: { mx: 0, mt: 0.4, fontSize: '0.75rem' } },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: multiline ? 'auto' : 44,
            borderRadius: '10px',
            bgcolor: '#fff',
            fontSize: '16px',
            color: brand.graphite,
            '& fieldset': { borderColor: '#D4D7D2' },
            '@media (hover: hover) and (pointer: fine)': {
              '&:hover fieldset': { borderColor: '#A8ACA6' },
            },
            '&.Mui-focused fieldset': { borderColor: brand.plantGreen, borderWidth: 1 },
            '&.Mui-error fieldset': { borderColor: '#C62828' },
          },
          '& .MuiOutlinedInput-input': {
            py: multiline ? 1.25 : 0,
            px: 1.5,
            height: multiline ? 'auto' : '44px',
            boxSizing: 'border-box',
            fontSize: '16px',
            scrollMarginTop: '20px',
            scrollMarginBottom: '30vh',
            '&:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 1000px #fff inset',
              WebkitTextFillColor: brand.graphite,
              caretColor: brand.graphite,
            },
          },
          '& .MuiSelect-select': { py: 0, px: 1.5, height: '44px', boxSizing: 'border-box', display: 'flex', alignItems: 'center' },
        }}
      >
        {children}
      </TextField>
    </Box>
  )
}
