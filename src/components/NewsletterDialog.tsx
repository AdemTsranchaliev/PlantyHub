import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const NewsletterDialogContent = lazy(() => import('./NewsletterDialogContent'))

const STORAGE_KEY = 'ph_newsletter_seen'
const TIMER_MS = 8000

export default function NewsletterDialog() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const triggeredRef = useRef(false)

  useEffect(() => {
    let seen = false
    try {
      seen = localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      seen = false
    }
    if (seen) return

    const trigger = () => {
      if (triggeredRef.current) return
      triggeredRef.current = true
      setMounted(true)
      setOpen(true)
    }

    const timer = window.setTimeout(trigger, TIMER_MS)

    const onExitIntent = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger()
    }
    document.addEventListener('mouseout', onExitIntent)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('mouseout', onExitIntent)
    }
  }, [])

  const markSeen = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  const handleClose = () => {
    setOpen(false)
    markSeen()
  }

  if (!mounted) return null

  return (
    <Suspense fallback={null}>
      <NewsletterDialogContent open={open} onClose={handleClose} onSubscribed={markSeen} />
    </Suspense>
  )
}
