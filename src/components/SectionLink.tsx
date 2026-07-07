import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { brand } from '../theme'
import { resolveHref } from '../paths'

type SectionLinkProps = {
  href: string
  label: string
}

export default function SectionLink({ href, label }: SectionLinkProps) {
  return (
    <Box sx={{ textAlign: 'center', mt: { xs: 3, md: 4 } }}>
      <Link
        href={resolveHref(href)}
        underline="none"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          color: brand.graphite,
          fontWeight: 600,
          fontSize: '0.9rem',
          '&:hover': { color: brand.plantGreen },
        }}
      >
        {label}
        <ArrowForwardIcon sx={{ fontSize: 16 }} />
      </Link>
    </Box>
  )
}
