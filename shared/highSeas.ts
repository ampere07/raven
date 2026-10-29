import type { CommonRoomQuestion, FinaleBeat } from './commonRoom.js'

// Chapter III. Everything the chapter says in its own voice lives here, so it can be edited in one place.
// Answers are stored in the same collection as Chapter II, so every question id starts with "sea-" and must never
// be reused or renumbered.
export const HIGH_SEAS_COPY = {
  number: 'III',
  title: 'The High Seas',
  subtitle: 'Sumakay ka na. May mga tanong pa ako para sa’yo.',
  enter: 'Sumakay na',
  privacy: 'Hindi mo kailangang sagutin lahat. Skip mo lang kung hindi ka comfy.',
  completeTitle: 'Thankyou ulit sa cooperation.',
  completeSubtitle: 'Hanggang sa susunod na theme.',

  // The villain and the fight with him. None of this is stored.
  villainName: 'Davy Jones',
  villainDefeatLine: 'The sea will give you back to me.',
  duel: {
    guidance: 'I-tap mo kung saan mo gustong tumama yung kanyon. Sundan mo siya habang gumagalaw!',
    miss: 'Sablay! Sundan mo siya.',
    hit: ['Tama!', 'Isa pa!', 'Ayan!', 'Bumabagsak na!', 'Last na!'],
  },

  // After the last question: a maze in Davy Jones's dungeon. Reaching its end springs his trap, she wakes up in a cell,
  // and Raven rows her out. None of this is stored.
  maze: {
    guidance: 'Hanapin mo yung labasan, yung kumikinang sa kabilang dulo. Gamitin mo yung mga arrow sa baba o yung arrow keys.',
    found: 'Nakita mo na yung labasan!',
  },
  escape: {
    villainLine: 'Nahulog ka sa bitag ko. Wala ka nang labasan.',
    heroLine: 'Huwag kang matakot. Ililigtas kita!',
    openLine: 'Kapit lang, bubuksan ko na ’to. May bangka sa labas.',
  },

  finale: {
    heroName: 'Raven',
    // After the rescue she and Raven talk. Each beat is one of his lines; if it has choices she picks a reply and he
    // answers it before the next beat. Nothing she picks is stored. The last beat is the punchline.
    conversation: [
      {
        say: 'Okay ka lang ba? Buti na lang naabutan kita.',
        choices: [
          { label: 'Okay lang ako', answer: 'Good. Hindi ako papayag na may kumuha sa’yo.', gif: 'salute' },
          { label: 'Takot na takot ako', answer: 'Nandito na ako. Hindi ako aalis.', gif: 'run' },
        ],
      },
      {
        say: 'Teka, may napansin ako. Kanina pa kita sinusundan.',
        choices: [
          { label: 'Ha? Kanina pa?', answer: 'Oo. Hindi lang kanina.', gif: 'hmm' },
          { label: 'Weh, di nga?', answer: 'Seryoso. Sandali lang, may sasabihin ako.', gif: 'rum' },
        ],
      },
      {
        say: 'Sinundan kita hanggang sa ibang theme.',
        punch: true,
        gif: 'regret',
        choices: [
          { label: 'Grabe ka talaga', answer: 'Wala akong pinagsisisihan. Tuloy na natin?', gif: 'cheers' },
          { label: 'Kaya pala nandito ka rin', answer: 'Syempre. Kung nasaan ka, nandun ako.', gif: 'cheers' },
        ],
      },
    ] satisfies readonly FinaleBeat[],
  },
} as const

// The cannon fight with Davy Jones stands between one question and the next.
export const CANNON_AFTER_QUESTION = 'sea-fav-outfit'
export const CANNON_HEALTH = 5

export const HIGH_SEAS_QUESTIONS: readonly CommonRoomQuestion[] = [
  {
    id: 'sea-cafe-drink',
    text: "What's your go-to drink kapag nasa café?",
  },
  {
    id: 'sea-small-happy',
    text: "What's one small thing that always makes you happy?",
  },
  {
    id: 'sea-fav-weather',
    text: "What's your favorite kind of weather",
  },
  {
    id: 'sea-fav-outfit',
    text: "Anong favorite mong outfit na suotin",
  },
  {
    id: 'sea-fav-dog',
    text: "Anong favorite mong breed ng dog",
  },
  {
    id: 'sea-fav-color',
    text: "What's your favorite color",
  },
  {
    id: 'sea-improve-self',
    text: "Ano yung gusto mong i-improve sa sarili mo ngayon",
  },
  {
    id: 'sea-red-flags-guy',
    text: "What are the biggest red flags you look for in a guy",
  },
  {
    id: 'sea-dream-travel',
    text: "What's your dream travel destination",
  },
  {
    id: 'sea-long-wanted-try',
    text: "Ano yung matagal mo nang gustong i-try pero hindi mo pa nagagawa",
  },
  {
    id: 'sea-misunderstood-about-you',
    text: "Ano yung madalas na hindi maintindihan ng mga tao about you",
  },
]
