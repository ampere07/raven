type QuestionBase = { id: string; prompt: string; hint?: string }

export type Question =
  | (QuestionBase & { kind: 'short' | 'long' })
  | (QuestionBase & { kind: 'choice' | 'select'; options: readonly string[] })
  | (QuestionBase & { kind: 'multiselect'; options: readonly string[]; max: number })

export type QuestionGroup = { id: string; title: string; questions: readonly Question[] }

export type FormValues = { name: string; answers: Record<string, string> }

export type Answer = { questionId: string; question: string; answer: string }

export type Submission = { name?: string; answers: Answer[] }

export const LIMITS = { name: 80, answer: 2000, body: 100_000 } as const

// Several picks are stored in one answer, e.g. "Rose, Tulip, Daisy".
export const splitChoices = (answer: string) =>
  answer
    .split(',')
    .map((choice) => choice.trim())
    .filter(Boolean)
export const joinChoices = (choices: readonly string[]) => choices.join(', ')

export const FLOWER_QUESTION_ID = 'flowers'
export const MAX_FLOWERS = 3
export const NO_FAVORITE = 'I don’t have a favorite'

// The most common flowers come first so they are what she sees when the list opens.
const COMMON_FLOWERS = [
  'Rose', 'Sunflower', 'Tulip', 'Daisy', 'Lily', 'Orchid', 'Peony', 'Lavender', 'Carnation', 'Hydrangea',
  'Daffodil', 'Cherry blossom', 'Marigold', 'Chrysanthemum', 'Iris', 'Jasmine', 'Lilac', 'Dahlia', 'Poppy',
  'Hibiscus',
] as const

const OTHER_FLOWERS = [
  'Allium', 'Alstroemeria', 'Amaryllis', 'Anemone', 'Aster', 'Azalea', 'Baby’s breath', 'Begonia', 'Bellflower',
  'Black-eyed Susan', 'Bleeding heart', 'Bluebell', 'Bougainvillea', 'Buttercup', 'Camellia', 'Chamomile',
  'Clematis', 'Coneflower', 'Cornflower', 'Cosmos', 'Crocus', 'Dandelion', 'Delphinium', 'Dianthus', 'Dogwood',
  'Edelweiss', 'Forget-me-not', 'Foxglove', 'Freesia', 'Fuchsia', 'Gardenia', 'Geranium', 'Gerbera daisy',
  'Gladiolus', 'Heather', 'Hellebore', 'Hollyhock', 'Honeysuckle', 'Hyacinth', 'Larkspur', 'Lily of the valley',
  'Lisianthus', 'Lotus', 'Lupine', 'Magnolia', 'Morning glory', 'Narcissus', 'Nasturtium', 'Pansy', 'Petunia',
  'Plumeria', 'Primrose', 'Protea', 'Ranunculus', 'Rhododendron', 'Snapdragon', 'Snowdrop', 'Sweet pea',
  'Tiger lily', 'Tuberose', 'Violet', 'Water lily', 'Wildflowers', 'Zinnia',
] as const

export const FLOWERS = [...COMMON_FLOWERS, ...OTHER_FLOWERS, NO_FAVORITE] as const

export type FlowerName = (typeof FLOWERS)[number]

export const QUESTION_GROUPS: readonly QuestionGroup[] = [
  {
    id: 'everyday',
    title: 'The little things',
    questions: [
      { id: 'favorite-food', kind: 'short', prompt: 'Anong food yung kahit paulit-ulit mong kainin, hindi ka magsasawa?' },
      { id: 'drink-order', kind: 'short', prompt: 'Ano usually order mo kapag nagkakape or bumibili ng drink?' },
      {
        id: 'sweet-or-savory',
        kind: 'choice',
        prompt: 'Sweet or savory ka ba?',
        options: ['Sweet', 'Savory', 'Depende sa mood'],
      },
    ],
  },
  {
    id: 'songs-and-stories',
    title: 'Songs and stories',
    questions: [
      { id: 'song-lately', kind: 'short', prompt: 'Anong song yung madalas mong pinapakinggan lately?' },
      {
        id: 'rewatch',
        kind: 'short',
        prompt: 'May movie or series ba na kahit ilang beses mo nang napanood, hindi ka pa rin nagsasawa?',
      },
      {
        id: 'stayed-with-you',
        kind: 'long',
        prompt: 'May book, movie, or place ba na may special meaning sa’yo or hindi mo makalimutan?',
      },
    ],
  },
  {
    id: 'slow-days',
    title: 'Your kind of day',
    questions: [
      {
        id: 'relaxing-day',
        kind: 'long',
        prompt: 'Paano yung perfect chill day mo? Yung araw na wala kang masyadong iniisip or kailangang gawin.',
      },
      { id: 'mood', kind: 'long', prompt: 'Ano yung isang bagay na kayang magpagaan ng mood mo kahit bad day?' },
      {
        id: 'morning-or-night',
        kind: 'choice',
        prompt: 'Morning person ka ba or mas gising ang diwa mo sa gabi?',
        options: ['Morning person', 'Night owl', 'Depende sa araw'],
      },
    ],
  },
  {
    id: 'a-little-more',
    title: 'A little more about you',
    questions: [
      {
        id: FLOWER_QUESTION_ID,
        kind: 'multiselect',
        prompt: 'May favorite flower ka ba?',
        hint: `Pwede kang pumili ng hanggang ${MAX_FLOWERS}.`,
        options: FLOWERS,
        max: MAX_FLOWERS,
      },
      {
        id: 'looking-forward',
        kind: 'long',
        prompt: 'Ano yung isang bagay na excited ka or looking forward ka ngayon?',
      },
      {
        id: 'anything-else',
        kind: 'long',
        prompt: 'May something ba about you na gusto mong malaman ko?',
      },
    ],
  },
]

export const QUESTIONS: readonly Question[] = QUESTION_GROUPS.flatMap((group) => group.questions)
