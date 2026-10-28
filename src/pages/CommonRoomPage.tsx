import { useMemo, useState } from 'react'
import { COMMON_ROOM_QUESTIONS, VILLAIN_AFTER_QUESTION } from '../../shared/commonRoom'
import { AnswerReview } from '../components/common-room/AnswerReview'
import { ChapterCompletion } from '../components/common-room/ChapterCompletion'
import { CommonRoomIntroduction } from '../components/common-room/CommonRoomIntroduction'
import { QuestionCard } from '../components/common-room/QuestionCard'
import { QuestionProgress } from '../components/common-room/QuestionProgress'
import { ReturnScene } from '../components/common-room/ReturnScene'
import { Stage } from '../components/common-room/Stage'
import { VillainDuel } from '../components/common-room/VillainDuel'
import { useCommonRoom } from '../hooks/useCommonRoom'

type View = 'intro' | 'questions' | 'review' | 'complete' | 'villain' | 'return'
type Direction = 'forward' | 'back'

const QUESTIONS = COMMON_ROOM_QUESTIONS
const TOTAL = QUESTIONS.length

// The villain stands between one question and the next. Moving to any question at or past this index meets it first.
const gateAt = QUESTIONS.findIndex((question) => question.id === VILLAIN_AFTER_QUESTION)
const VILLAIN_GATE = gateAt === -1 ? Number.POSITIVE_INFINITY : gateAt + 1

// Kept for this visit only, in this tab, so a refresh does not make her fight again but a new visit does.
const DEFEATED_KEY = 'little-things-villain-defeated'
const wasDefeated = () => {
  try {
    return sessionStorage.getItem(DEFEATED_KEY) === 'yes'
  } catch {
    return false
  }
}
const rememberDefeat = () => {
  try {
    sessionStorage.setItem(DEFEATED_KEY, 'yes')
  } catch {
    // Without storage she simply faces it again after a refresh.
  }
}

// After the last question the villain comes back, once per visit.
const RETURN_KEY = 'little-things-return-seen'
const returnSeen = () => {
  try {
    return sessionStorage.getItem(RETURN_KEY) === 'yes'
  } catch {
    return false
  }
}
const rememberReturn = () => {
  try {
    sessionStorage.setItem(RETURN_KEY, 'yes')
  } catch {
    // Without storage the scene may play again after a refresh.
  }
}

type Waiting = { target: number; turned: Direction; from: View }

export function CommonRoomPage() {
  const { answers, load, reload, save, remove } = useCommonRoom()
  const [view, setView] = useState<View>('intro')
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<Direction>('forward')
  const [revisiting, setRevisiting] = useState(false)
  // Unsaved text is kept while moving between questions, so turning a page never loses what was typed.
  const [drafts, setDrafts] = useState<Readonly<Record<string, string>>>({})
  // Remembered only in this open page, to know which questions were passed over. It is never sent anywhere.
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set())
  const [defeated, setDefeated] = useState(wasDefeated)
  // Where she was going when the villain stepped in, so she can carry on there once it is gone.
  const [waiting, setWaiting] = useState<Waiting | null>(null)

  const answeredIds = useMemo(() => new Set(Object.keys(answers)), [answers])
  const firstUnanswered = QUESTIONS.findIndex((question) => !answeredIds.has(question.id))
  const unansweredCount = TOTAL - answeredIds.size

  // While revisiting, going forward steps over questions that already have answers. Going back is always to the
  // question just before, so an earlier answer can still be looked at or changed.
  const nextIndex = (): number | null => {
    for (let i = index + 1; i < TOTAL; i++) {
      if (!revisiting || !answeredIds.has(QUESTIONS[i].id)) return i
    }
    return null
  }
  const previous = index > 0 ? index - 1 : null

  const goTo = (target: number, turned: Direction) => {
    if (target >= VILLAIN_GATE && !defeated) {
      setWaiting({ target, turned, from: view === 'villain' ? 'questions' : view })
      setView('villain')
      return
    }
    setDirection(turned)
    setIndex(target)
    setView('questions')
  }

  const goNext = () => {
    const next = nextIndex()
    if (next === null) {
      setView(returnSeen() ? 'complete' : 'return')
    } else {
      goTo(next, 'forward')
    }
  }

  const goPrevious = () => {
    if (previous !== null) goTo(previous, 'back')
  }

  const jump = (target: number) => {
    setRevisiting(false)
    goTo(target, target >= index ? 'forward' : 'back')
  }

  const question = QUESTIONS[index]
  const saved = answers[question.id]

  return (
    <Stage>
      {view === 'intro' && (
        <CommonRoomIntroduction
          load={load}
          onRetry={() => void reload()}
          onEnter={() => goTo(firstUnanswered === -1 ? 0 : firstUnanswered, 'forward')}
        />
      )}

      {view === 'questions' && (
        <>
          <QuestionProgress questions={QUESTIONS} answered={answeredIds} index={index} onJump={jump} />
          <QuestionCard
            key={question.id}
            question={question}
            number={index + 1}
            total={TOTAL}
            saved={saved}
            draft={drafts[question.id] ?? saved?.answer ?? ''}
            skipped={skipped.has(question.id)}
            revisiting={revisiting}
            direction={direction}
            canGoBack={previous !== null}
            onDraftChange={(text) => setDrafts((current) => ({ ...current, [question.id]: text }))}
            onSave={async (text) => {
              await save(question.id, text)
              setDrafts((current) => ({ ...current, [question.id]: text }))
            }}
            onDelete={async () => {
              await remove(question.id)
              setDrafts((current) => ({ ...current, [question.id]: '' }))
            }}
            onPrevious={goPrevious}
            onSkip={() => {
              setSkipped((current) => new Set(current).add(question.id))
              goNext()
            }}
            onNext={goNext}
          />
        </>
      )}

      {view === 'villain' && waiting && (
        <VillainDuel
          onBack={() => setView(waiting.from)}
          onDefeated={() => {
            rememberDefeat()
            setDefeated(true)
            setDirection(waiting.turned)
            setIndex(waiting.target)
            setView('questions')
            setWaiting(null)
          }}
        />
      )}

      {view === 'return' && (
        <ReturnScene
          onFinished={() => {
            rememberReturn()
            setView('complete')
          }}
        />
      )}

      {view === 'complete' && (
        <ChapterCompletion
          unansweredCount={unansweredCount}
          onReview={() => setView('review')}
          onRevisit={() => {
            setRevisiting(true)
            goTo(firstUnanswered, 'forward')
          }}
        />
      )}

      {view === 'review' && (
        <AnswerReview
          questions={QUESTIONS}
          answers={answers}
          onEdit={(target) => {
            setRevisiting(false)
            goTo(target, 'forward')
          }}
          onBack={() => {
            setRevisiting(false)
            goTo(0, 'back')
          }}
        />
      )}
    </Stage>
  )
}
