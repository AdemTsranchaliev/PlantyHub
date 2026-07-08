import { useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import LanguageIcon from '@mui/icons-material/Language'
import { useTranslation } from 'react-i18next'
import { languageStorageKey, supportedLanguages, type LanguageCode } from '../i18n/languages'
import { brand } from '../theme'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const current = supportedLanguages.find((l) => l.code === i18n.language) ?? supportedLanguages[0]

  const changeLanguage = (code: LanguageCode) => {
    void i18n.changeLanguage(code)
    localStorage.setItem(languageStorageKey, code)
    document.documentElement.lang = code
    setAnchor(null)
  }

  return (
    <>
      <IconButton
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-label="Language"
        sx={{ color: brand.graphite, gap: 0.5, borderRadius: 2, px: { xs: 0.5, sm: 1 } }}
      >
        <LanguageIcon fontSize="small" />
        <Typography
          component="span"
          sx={{
            display: { xs: 'none', sm: 'inline' },
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          {current.short}
        </Typography>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 160 } } }}
      >
        {supportedLanguages.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={i18n.language === lang.code}
            onClick={() => changeLanguage(lang.code)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: i18n.language === lang.code ? 700 : 400 }}>
                {lang.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lang.short}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
