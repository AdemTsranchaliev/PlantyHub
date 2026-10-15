import { startTransition, useEffect, useMemo } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded'
import { useTranslation } from 'react-i18next'
import SectionContainer from '../components/SectionContainer'
import { schoolPackFor } from '../content/school'
import { navHrefs } from '../data/catalog'
import { productImages } from '../data/images'
import { brand } from '../theme'
import MediaImg from '../components/MediaImg'

const sectionIds = ['start', 'grow', 'harvest', 'care', 'plants'] as const
type SectionId = (typeof sectionIds)[number]

const topicIds = [
  'box',
  'hydro',
  'firstRun',
  'water',
  'lamp',
  'solution',
  'pods',
  'place',
  'weeks',
  'harvest',
  'sprout',
  'cycle',
  'clean',
  'trouble',
  'away',
  'safety',
  'basil',
  'parsley',
  'lettuce',
  'arugula',
  'mint',
] as const
type TopicId = (typeof topicIds)[number]

const sectionTopics: Record<SectionId, TopicId[]> = {
  start: ['box', 'hydro', 'firstRun', 'water'],
  grow: ['lamp', 'solution', 'pods', 'place'],
  harvest: ['weeks', 'harvest', 'sprout', 'cycle'],
  care: ['clean', 'trouble', 'away', 'safety'],
  plants: ['basil', 'parsley', 'lettuce', 'arugula', 'mint'],
}

const topicImages: Partial<Record<TopicId, string>> = {
  basil: productImages.basil,
  parsley: productImages.parsley,
  lettuce: productImages.lettuce,
  arugula: productImages.arugula,
  mint: productImages.mint,
}

type LessonTable = {
  columns: string[]
  rows: string[][]
}

const serif = '"Fraunces", Georgia, serif'

const crumbSx = {
  color: brand.textSecondary,
  fontSize: '0.8rem',
  fontWeight: 600,
  border: 0,
  background: 'none',
  cursor: 'pointer',
  p: 0,
  fontFamily: 'inherit',
  WebkitTapHighlightColor: 'transparent',
} as const

const panelSx = {
  bgcolor: brand.white,
  border: `1px solid ${brand.border}`,
  borderRadius: { xs: '16px', sm: '20px' },
  overflow: 'hidden',
  boxShadow: brand.shadow,
} as const

const rowBtnSx = {
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: { xs: 1.25, sm: 1.75 },
  textAlign: 'left',
  border: 0,
  borderBottom: `1px solid ${brand.border}`,
  bgcolor: 'transparent',
  cursor: 'pointer',
  px: { xs: 1.35, sm: 1.75 },
  py: { xs: 1.25, sm: 1.45 },
  font: 'inherit',
  color: 'inherit',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
  '&:last-of-type': { borderBottom: 0 },
  '&:focus-visible': {
    outline: `2px solid ${brand.plantGreen}`,
    outlineOffset: -2,
  },
  '&:active': { bgcolor: brand.plantGreenMuted },
  '@media (hover: hover)': {
    '&:hover': { bgcolor: brand.surfaceWarm },
  },
} as const

const kickerSx = {
  fontSize: '0.68rem',
  fontWeight: 800,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: brand.plantGreenDark,
} as const

function isSectionId(value: string | null): value is SectionId {
  return !!value && (sectionIds as readonly string[]).includes(value)
}

function isTopicId(value: string | null): value is TopicId {
  return !!value && (topicIds as readonly string[]).includes(value)
}

function formatCount(template: string, count: number) {
  return template.replace('{{count}}', String(count))
}

function IndexMark({ value }: { value: string }) {
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '12px',
        bgcolor: brand.plantGreenMuted,
        color: brand.plantGreenDark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.78rem',
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {value}
    </Box>
  )
}

function rowAccent(label: string) {
  if (label.includes('✅')) return brand.plantGreen
  if (label.includes('⚠')) return brand.peach
  if (label.includes('❌')) return '#A15C4A'
  return null
}

function TableFields({ columns, cells, emphasizeFirst = false }: { columns: string[]; cells: string[]; emphasizeFirst?: boolean }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(5.4rem, 34%) 1fr',
        columnGap: 1.15,
        rowGap: 0.55,
        alignItems: 'baseline',
      }}
    >
      {cells.map((cell, index) => (
        <Box key={index} sx={{ display: 'contents' }}>
          <Typography sx={{ ...kickerSx, lineHeight: 1.3 }}>{columns[index]}</Typography>
          <Typography
            sx={{
              color: brand.graphite,
              fontSize: '0.92rem',
              lineHeight: 1.4,
              fontWeight: emphasizeFirst && index === 0 ? 700 : 500,
            }}
          >
            {cell}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

function LessonTableView({ table }: { table: LessonTable }) {
  const statusColumn = !table.columns[0]?.trim()
  const leadShare = statusColumn ? 22 : 32
  return (
    <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
      <Box sx={{ ...panelSx, display: { xs: 'block', md: 'none' }, boxShadow: 'none' }}>
        {table.rows.map((row, rowIndex) => {
          const accent = rowAccent(row[0] ?? '')
          return (
            <Box
              key={rowIndex}
              sx={{
                px: 1.45,
                py: 1.15,
                borderBottom: rowIndex === table.rows.length - 1 ? 0 : `1px solid ${brand.border}`,
                borderLeft: accent ? `3px solid ${accent}` : '3px solid transparent',
              }}
            >
              {statusColumn ? (
                <>
                  <Typography sx={{ color: brand.graphite, fontWeight: 700, fontSize: '0.98rem', lineHeight: 1.3, mb: 0.7 }}>{row[0]}</Typography>
                  <TableFields columns={table.columns.slice(1)} cells={row.slice(1)} />
                </>
              ) : (
                <TableFields columns={table.columns} cells={row} emphasizeFirst />
              )}
            </Box>
          )
        })}
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            tableLayout: 'fixed',
            borderCollapse: 'separate',
            borderSpacing: 0,
            bgcolor: brand.white,
            border: `1px solid ${brand.border}`,
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <Box component="colgroup">
            {table.columns.map((_, index) => (
              <Box
                component="col"
                key={index}
                sx={{ width: index === 0 ? `${leadShare}%` : `${(100 - leadShare) / Math.max(table.columns.length - 1, 1)}%` }}
              />
            ))}
          </Box>
          <Box component="thead">
            <Box component="tr">
              {table.columns.map((column, index) => (
                <Box
                  component="th"
                  key={`${column}-${index}`}
                  sx={{
                    textAlign: 'left',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: brand.plantGreenDark,
                    bgcolor: brand.surfaceWarm,
                    px: 1.4,
                    py: 1,
                    borderBottom: `1px solid ${brand.border}`,
                  }}
                >
                  {column}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {table.rows.map((row, rowIndex) => {
              const accent = rowAccent(row[0] ?? '')
              return (
                <Box
                  component="tr"
                  key={rowIndex}
                  sx={{
                    bgcolor: rowIndex % 2 === 1 ? brand.surface : 'transparent',
                    boxShadow: accent ? `inset 3px 0 0 ${accent}` : 'none',
                  }}
                >
                  {row.map((cell, cellIndex) => (
                    <Box
                      component="td"
                      key={cellIndex}
                      sx={{
                        px: 1.4,
                        py: 1.05,
                        fontSize: '0.92rem',
                        lineHeight: 1.45,
                        color: brand.graphite,
                        fontWeight: cellIndex === 0 ? 700 : 500,
                        borderBottom: rowIndex === table.rows.length - 1 ? 0 : `1px solid ${brand.border}`,
                        verticalAlign: 'top',
                      }}
                    >
                      {cell}
                    </Box>
                  ))}
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function LearnPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const content = schoolPackFor(i18n.resolvedLanguage || i18n.language)

  const sectionParam = params.get('section')
  const topicParam = params.get('topic')
  const sectionId = isSectionId(sectionParam) ? sectionParam : null
  const topicId = isTopicId(topicParam) && sectionId && sectionTopics[sectionId].includes(topicParam) ? topicParam : null
  const view: 'hub' | 'section' | 'topic' = topicId ? 'topic' : sectionId ? 'section' : 'hub'

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view, sectionId, topicId])

  useEffect(() => {
    if (!sectionId) return
    const src = topicImages[sectionTopics[sectionId][0]]
    if (!src) return
    const img = new Image()
    img.src = src
  }, [sectionId])

  const navigate = (next: Record<string, string>) => {
    startTransition(() => setParams(next))
  }

  const goHub = () => navigate({})
  const goSection = (id: SectionId) => navigate({ section: id })
  const goTopic = (section: SectionId, topic: TopicId) => navigate({ section, topic })

  const section = sectionId ? content.sections?.[sectionId] : null
  const topic = topicId ? content.topics?.[topicId] : null
  const topicsInSection = sectionId ? sectionTopics[sectionId] : []

  const neighbors = useMemo(() => {
    if (!sectionId || !topicId) return { prev: null as TopicId | null, next: null as TopicId | null }
    const list = sectionTopics[sectionId]
    const idx = list.indexOf(topicId)
    return {
      prev: idx > 0 ? list[idx - 1] : null,
      next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null,
    }
  }, [sectionId, topicId])

  const prevTopic = neighbors.prev ? content.topics?.[neighbors.prev] : null
  const nextTopic = neighbors.next ? content.topics?.[neighbors.next] : null
  const topicImage = topicId ? topicImages[topicId] : undefined
  const lessonIndex = sectionId && topicId ? sectionTopics[sectionId].indexOf(topicId) : -1

  return (
    <main>
      <SectionContainer bgcolor={brand.surface} py={view === 'hub' ? { xs: 2.5, sm: 4, md: 5 } : { xs: 2, sm: 3, md: 4 }}>
        <Box sx={{ maxWidth: view === 'hub' ? 760 : 720, mx: 'auto' }}>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: 'center',
              flexWrap: 'wrap',
              rowGap: 0.35,
              mb: { xs: 1.75, sm: 2.25 },
            }}
          >
            <Link component={RouterLink} to="/" underline="hover" sx={crumbSx}>
              {t('pdp.home')}
            </Link>
            <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
            {view === 'hub' ? (
              <Typography sx={{ color: brand.graphite, fontSize: '0.8rem', fontWeight: 700 }}>{content.title}</Typography>
            ) : (
              <Link component="button" type="button" onClick={goHub} underline="hover" sx={crumbSx}>
                {content.title}
              </Link>
            )}
            {section && (
              <>
                <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary }} />
                {view === 'topic' ? (
                  <Link component="button" type="button" onClick={() => sectionId && goSection(sectionId)} underline="hover" sx={crumbSx}>
                    {section.title}
                  </Link>
                ) : (
                  <Typography sx={{ color: brand.graphite, fontSize: '0.8rem', fontWeight: 700 }}>{section.title}</Typography>
                )}
              </>
            )}
            {topic && view === 'topic' && (
              <>
                <NavigateNextRounded sx={{ fontSize: 16, color: brand.textSecondary, display: { xs: 'none', sm: 'block' } }} />
                <Typography
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    color: brand.graphite,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {topic.title}
                </Typography>
              </>
            )}
          </Stack>

          {view === 'hub' && (
            <>
              <Typography sx={{ ...kickerSx, mb: 1 }}>{content.eyebrow}</Typography>
              <Typography
                component="h1"
                sx={{
                  fontFamily: serif,
                  fontWeight: 600,
                  fontSize: { xs: '2rem', sm: '2.45rem' },
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  color: brand.graphite,
                  mb: 1,
                }}
              >
                {content.title}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '0.98rem', sm: '1.05rem' }, lineHeight: 1.55, maxWidth: 520, mb: { xs: 2.25, sm: 2.75 } }}>
                {content.lead}
              </Typography>
              <Box sx={panelSx}>
                {sectionIds.map((id, index) => {
                  const item = content.sections?.[id]
                  if (!item) return null
                  const count = sectionTopics[id].length
                  return (
                    <Box key={id} component="button" type="button" onClick={() => goSection(id)} sx={rowBtnSx}>
                      <IndexMark value={String(index + 1).padStart(2, '0')} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
                          <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: '1.12rem', sm: '1.22rem' }, color: brand.graphite, lineHeight: 1.2 }}>
                            {item.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: brand.plantGreen }}>
                            {formatCount(content.topicsCount, count)}
                          </Typography>
                        </Stack>
                        <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '0.84rem', sm: '0.9rem' }, lineHeight: 1.4, mt: 0.3 }}>
                          {item.description}
                        </Typography>
                      </Box>
                      <ArrowForwardRounded sx={{ fontSize: 18, color: brand.plantGreenDark, flexShrink: 0 }} />
                    </Box>
                  )
                })}
              </Box>
            </>
          )}

          {view === 'section' && section && (
            <>
              <Typography
                component="h1"
                sx={{
                  fontFamily: serif,
                  fontWeight: 600,
                  fontSize: { xs: '1.75rem', sm: '2.1rem' },
                  letterSpacing: '-0.03em',
                  lineHeight: 1.08,
                  color: brand.graphite,
                  mb: 0.6,
                }}
              >
                {section.title}
              </Typography>
              <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.5, mb: { xs: 2, sm: 2.25 }, maxWidth: 520 }}>
                {section.description}
              </Typography>
              <Box sx={panelSx}>
                {topicsInSection.map((id, index) => {
                  const item = content.topics?.[id]
                  if (!item) return null
                  return (
                    <Box key={id} component="button" type="button" onClick={() => goTopic(sectionId!, id)} sx={rowBtnSx}>
                      <IndexMark value={String(index + 1).padStart(2, '0')} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
                          <Typography sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: '1.05rem', sm: '1.12rem' }, color: brand.graphite, lineHeight: 1.25 }}>
                            {item.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: brand.plantGreen }}>{item.duration}</Typography>
                        </Stack>
                        <Typography sx={{ color: brand.textSecondary, fontSize: { xs: '0.84rem', sm: '0.88rem' }, lineHeight: 1.4, mt: 0.25 }}>
                          {item.summary}
                        </Typography>
                      </Box>
                      <ArrowForwardRounded sx={{ fontSize: 18, color: brand.plantGreenDark, flexShrink: 0 }} />
                    </Box>
                  )
                })}
              </Box>
            </>
          )}

          {view === 'topic' && topic && section && topicId && sectionId && (
            <>
              <Typography sx={{ ...kickerSx, mb: 0.55 }}>
                {String(lessonIndex + 1).padStart(2, '0')}/{String(topicsInSection.length).padStart(2, '0')} · {section.title} · {topic.duration}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <Typography
                  component="h1"
                  sx={{
                    fontFamily: serif,
                    fontWeight: 600,
                    fontSize: { xs: '1.7rem', sm: '2.05rem' },
                    letterSpacing: '-0.03em',
                    lineHeight: 1.08,
                    color: brand.graphite,
                  }}
                >
                  {topic.title}
                </Typography>
                {topicImage && (
                  <MediaImg
                    src={topicImage}
                    preset="card"
                    alt=""
                    sx={{
                      width: 26,
                      height: 26,
                      objectFit: 'contain',
                      flexShrink: 0,
                    }}
                  />
                )}
              </Stack>
              <Typography sx={{ color: brand.graphite, fontSize: { xs: '1rem', sm: '1.05rem' }, lineHeight: 1.55, mb: { xs: 1.75, sm: 2.25 } }}>
                {topic.lead}
              </Typography>

              {(topic.steps ?? []).length > 0 && (
                <Box sx={{ ...panelSx, px: { xs: 1.4, sm: 1.75 }, py: { xs: 1.35, sm: 1.6 }, mb: { xs: 1.75, sm: 2 } }}>
                  <Typography sx={{ ...kickerSx, mb: 1.15 }}>{topic.stepsLabel || content.stepsLabel}</Typography>
                  <Stack component="ol" spacing={1.15} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                    {(topic.steps ?? []).map((step, stepIndex) => (
                      <Box key={`${topicId}-${stepIndex}`} component="li" sx={{ display: 'flex', gap: 1.15, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '8px',
                            bgcolor: brand.plantGreenMuted,
                            color: brand.plantGreenDark,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            flexShrink: 0,
                            mt: 0.1,
                          }}
                        >
                          {stepIndex + 1}
                        </Box>
                        <Typography sx={{ color: brand.graphite, fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.5 }}>{step}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {topic.table && <LessonTableView table={topic.table} />}

              {(topic.blocks ?? []).map((block) => (
                <Box key={block.title} sx={{ ...panelSx, px: { xs: 1.4, sm: 1.75 }, py: { xs: 1.35, sm: 1.6 }, mb: { xs: 1.75, sm: 2 }, boxShadow: 'none' }}>
                  <Typography sx={{ ...kickerSx, mb: 1.1 }}>{block.title}</Typography>
                  <Stack component={block.ordered ? 'ol' : 'ul'} spacing={0.95} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                    {block.items.map((item, itemIndex) => (
                      <Box key={`${block.title}-${itemIndex}`} component="li" sx={{ display: 'flex', gap: 1.1, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            width: block.ordered ? 24 : 7,
                            height: block.ordered ? 24 : 7,
                            mt: block.ordered ? 0.1 : 0.75,
                            borderRadius: block.ordered ? '8px' : '50%',
                            bgcolor: block.ordered ? brand.plantGreenMuted : brand.plantGreen,
                            color: brand.plantGreenDark,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {block.ordered ? itemIndex + 1 : ''}
                        </Box>
                        <Typography sx={{ color: brand.graphite, fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.5 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}

              {topic.note && (
                <Box sx={{ mb: { xs: 1.75, sm: 2 } }}>
                  {topic.noteLabel && <Typography sx={{ ...kickerSx, mb: 0.55 }}>{topic.noteLabel}</Typography>}
                  <Typography sx={{ color: brand.graphite, fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.55 }}>{topic.note}</Typography>
                </Box>
              )}

              <Box
                sx={{
                  bgcolor: brand.cream,
                  borderRadius: '16px',
                  px: { xs: 1.5, sm: 1.85 },
                  py: { xs: 1.25, sm: 1.45 },
                  borderLeft: `3px solid ${brand.plantGreen}`,
                  mb: { xs: 1.75, sm: 2 },
                }}
              >
                <Typography sx={{ ...kickerSx, mb: 0.35 }}>{content.tipLabel}</Typography>
                <Typography sx={{ color: brand.graphite, fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.55 }}>{topic.tip}</Typography>
              </Box>

              {(topic.video || topic.photos) && (
                <Box
                  key={topicId}
                  component="details"
                  sx={{
                    mb: { xs: 2, sm: 2.25 },
                    '& > summary': { listStyle: 'none' },
                    '& > summary::-webkit-details-marker': { display: 'none' },
                    '&[open] .learn-media-chevron': { transform: 'rotate(180deg)' },
                  }}
                >
                  <Box
                    component="summary"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.35,
                      cursor: 'pointer',
                      color: brand.textSecondary,
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {[topic.video ? content.videoLabel : null, topic.photos ? content.galleryLabel : null].filter(Boolean).join(' · ')}
                    <ExpandMoreRounded className="learn-media-chevron" sx={{ fontSize: 18, transition: 'transform 160ms ease' }} />
                  </Box>
                  <Stack spacing={0.65} sx={{ mt: 0.85, color: brand.textSecondary }}>
                    {topic.video && (
                      <Typography sx={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
                        <Box component="span" sx={{ fontWeight: 800, color: brand.graphite }}>
                          {content.videoLabel}.{' '}
                        </Box>
                        {topic.video}
                      </Typography>
                    )}
                    {topic.photos && (
                      <Typography sx={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
                        <Box component="span" sx={{ fontWeight: 800, color: brand.graphite }}>
                          {content.galleryLabel}.{' '}
                        </Box>
                        {topic.photos}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}

              <Box
                component="button"
                type="button"
                onClick={() => goSection(sectionId)}
                sx={{
                  ...crumbSx,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.35,
                  mb: 1.15,
                  minHeight: 32,
                }}
              >
                <ArrowBackRounded sx={{ fontSize: 16 }} />
                {content.backToTopics}
              </Box>

              {(prevTopic || nextTopic) && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'stretch' }}>
                  {neighbors.prev && prevTopic && (
                    <Button
                      variant="outlined"
                      onClick={() => goTopic(sectionId, neighbors.prev!)}
                      sx={{ minHeight: 52, flex: 1, justifyContent: 'flex-start', gap: 1, px: 1.5, textAlign: 'left' }}
                    >
                      <ArrowBackRounded sx={{ flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: brand.textSecondary }}>
                          {content.prevTopic}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.25, color: brand.graphite }}>{prevTopic.title}</Typography>
                      </Box>
                    </Button>
                  )}
                  {neighbors.next && nextTopic && (
                    <Button
                      variant="contained"
                      onClick={() => goTopic(sectionId, neighbors.next!)}
                      sx={{ minHeight: 52, flex: 1, justifyContent: 'space-between', px: 1.6 }}
                    >
                      <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.8 }}>
                          {content.nextTopic}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.25 }}>{nextTopic.title}</Typography>
                      </Box>
                      <ArrowForwardRounded sx={{ flexShrink: 0 }} />
                    </Button>
                  )}
                </Stack>
              )}
            </>
          )}
        </Box>
      </SectionContainer>

      {view === 'hub' && (
        <Box
          component="section"
          sx={{
            background: brand.gradientCta,
            color: brand.white,
            py: { xs: 3.5, sm: 4.5, md: 5.5 },
            pb: { xs: 'max(28px, env(safe-area-inset-bottom))', sm: 4.5, md: 5.5 },
          }}
        >
          <Box sx={{ maxWidth: 480, mx: 'auto', px: { xs: 2, sm: 3 }, textAlign: 'center' }}>
            <Typography component="h2" sx={{ fontFamily: serif, fontWeight: 600, fontSize: { xs: '1.3rem', md: '1.65rem' }, mb: 0.85 }}>
              {content.ctaTitle}
            </Typography>
            <Typography sx={{ opacity: 0.9, lineHeight: 1.55, mb: 2, fontSize: { xs: '0.88rem', sm: '0.92rem' } }}>{content.ctaText}</Typography>
            <Stack spacing={1} sx={{ width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                component={RouterLink}
                to={navHrefs.faq}
                sx={{ minHeight: 44, bgcolor: brand.white, color: brand.graphite, '&:hover': { bgcolor: brand.beige } }}
              >
                {content.ctaFaq}
              </Button>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={RouterLink}
                  to={navHrefs.contact}
                  sx={{
                    minHeight: 44,
                    borderColor: 'rgba(255,255,255,0.55)',
                    color: brand.white,
                    '&:hover': { borderColor: brand.white, bgcolor: brand.white, color: brand.graphite },
                  }}
                >
                  {content.ctaContact}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  component={RouterLink}
                  to={navHrefs.buy}
                  sx={{
                    minHeight: 44,
                    borderColor: 'rgba(255,255,255,0.55)',
                    color: brand.white,
                    '&:hover': { borderColor: brand.white, bgcolor: brand.white, color: brand.graphite },
                  }}
                >
                  {content.ctaBuy}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      )}
    </main>
  )
}
