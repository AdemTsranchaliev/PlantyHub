export type LessonTable = {
  columns: string[]
  rows: string[][]
}

export type LessonBlock = {
  title: string
  items: string[]
  ordered?: boolean
}

export type SchoolLesson = {
  title: string
  duration: string
  summary: string
  lead: string
  video?: string
  photos?: string
  stepsLabel?: string
  steps?: string[]
  table?: LessonTable
  blocks?: LessonBlock[]
  noteLabel?: string
  note?: string
  tip: string
}

export type SchoolSection = {
  title: string
  description: string
  topicsLabel: string
}

export type SchoolPack = {
  title: string
  eyebrow: string
  lead: string
  pickSection: string
  backToSections: string
  backToTopics: string
  openTopic: string
  tipLabel: string
  stepsLabel: string
  videoLabel: string
  galleryLabel: string
  topicsCount: string
  nextTopic: string
  prevTopic: string
  sections: {
    start: SchoolSection
    grow: SchoolSection
    harvest: SchoolSection
    care: SchoolSection
    plants: SchoolSection
  }
  topics: {
    box: SchoolLesson
    hydro: SchoolLesson
    firstRun: SchoolLesson
    water: SchoolLesson
    lamp: SchoolLesson
    solution: SchoolLesson
    pods: SchoolLesson
    place: SchoolLesson
    weeks: SchoolLesson
    harvest: SchoolLesson
    sprout: SchoolLesson
    cycle: SchoolLesson
    clean: SchoolLesson
    trouble: SchoolLesson
    away: SchoolLesson
    safety: SchoolLesson
    basil: SchoolLesson
    parsley: SchoolLesson
    lettuce: SchoolLesson
    arugula: SchoolLesson
    mint: SchoolLesson
  }
  ctaTitle: string
  ctaText: string
  ctaFaq: string
  ctaContact: string
  ctaBuy: string
}
