export const schoolSections = ['start', 'grow', 'harvest', 'care', 'plants'] as const
export type SchoolSectionId = (typeof schoolSections)[number]

export const schoolTopics = [
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
export type SchoolTopicId = (typeof schoolTopics)[number]

export const schoolSectionTopics: Record<SchoolSectionId, readonly SchoolTopicId[]> = {
  start: ['box', 'hydro', 'firstRun', 'water'],
  grow: ['lamp', 'solution', 'pods', 'place'],
  harvest: ['weeks', 'harvest', 'sprout', 'cycle'],
  care: ['clean', 'trouble', 'away', 'safety'],
  plants: ['basil', 'parsley', 'lettuce', 'arugula', 'mint'],
}

export function isSchoolSection(value: string | null): value is SchoolSectionId {
  return !!value && (schoolSections as readonly string[]).includes(value)
}

export function isSchoolTopic(value: string | null): value is SchoolTopicId {
  return !!value && (schoolTopics as readonly string[]).includes(value)
}

/** Canonical learn query: section, then topic when it belongs to that section. */
export function learnSearch(section: string | null, topic: string | null): string {
  if (!isSchoolSection(section)) return ''
  if (isSchoolTopic(topic) && schoolSectionTopics[section].includes(topic)) {
    return `?section=${section}&topic=${topic}`
  }
  return `?section=${section}`
}
