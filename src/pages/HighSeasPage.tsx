import { useCallback, useEffect, useMemo, useState } from 'react'
import { CANNON_AFTER_QUESTION, HIGH_SEAS_COPY, HIGH_SEAS_QUESTIONS } from '../../shared/highSeas'
import { ChapterCompletion, type SaveState } from '../components/common-room/ChapterCompletion'
import { QuestionCard } from '../components/common-room/QuestionCard'
import { QuestionProgress } from '../components/common-room/QuestionProgress'
import { CannonDuel } from '../components/high-seas/CannonDuel'
import { JailEscape } from '../components/high-seas/JailEscape'
import { MazeTrap } from '../components/high-seas/MazeTrap'
import { SeaScroll } from '../components/high-seas/SeaScroll'
import { SeaIntro } from '../components/high-seas/SeaIntro'
import { SeaStage } from '../components/high-seas/SeaStage'
import { useCommonRoom } from '../hooks/useCommonRoom'
import { setSceneTrack } from '../utils/sceneMusic'

type View = 'intro' | 'questions' | 'duel' | 'maze' | 'jail' | 'complete'
type Direction = 'forward' | 'back'

const QUESTIONS = HIGH_SEAS_QUESTIONS
const TOTAL = QUESTIONS.length
const CHAPTER_LABEL = `Chapter ${HIGH_SEAS_COPY.number}: ${HIGH_SEAS_COPY.title}`

// Moving to any question at or past this one meets Davy Jones first. It plays every time the chapter is opened.
const duelAt = QUESTIONS.findIndex((question) => question.id === CANNON_AFTER_QUESTION)
const DUEL_GATE = duelAt === -1 ? Number.POSITIVE_INFINITY : duelAt + 1

type Waiting = { target: number; turned: Direction }

// Chapter III. It follows Chapter II's rules: nothing is sent while she answers, the answers are kept in the open page,
// and all of them are saved together once the last scene is over.
export function HighSeasPage() {
  const { answers, load, reload, commit } = useCommonRoom()
  const [view, setView] = useState<View>('intro')
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<Direction>('forward')
  const [drafts, setDrafts] = useState<Readonly<Record<string, string>>>({})
  const [beaten, setBeaten] = useState(false)
  const [waiting, setWaiting] = useState<Waiting | null>(null)
  const [saveState, setSaveState] = useState<SaveState>({ status: 'saving' })

  // The finale may swap the music; leaving the chapter gives it back.
  useEffect(() => () => setSceneTrack(null), [])

  const textOf = useCallback((id: string) => (drafts[id] ?? answers[id]?.answer ?? '').trim(), [drafts, answers])
  const answeredIds = useMemo(
    () => new Set(QUESTIONS.filter((question) => textOf(question.id).length > 0).map((question) => question.id)),
    [textOf],
  )

  const saveEverything = useCallback(async () => {
    setSaveState({ status: 'saving' })
    try {
      await commit(Object.fromEntries(QUESTIONS.map((question) => [question.id, textOf(question.id)])))
      setSaveState({ status: 'saved' })
    } catch (error) {
      setSaveState({
        status: 'failed',
        message: error instanceof Error ? error.message : 'May nangyaring mali.',
      })
    }
  }, [commit, textOf])

  // The one and only save: as soon as the last scene is over.
  useEffect(() => {
    if (view === 'complete') void saveEverything()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on arrival; retries are explicit
  }, [view])

  const goTo = (target: number, turned: Direction, defeated = beaten) => {
    if (target >= DUEL_GATE && !defeated) {
      setWaiting({ target, turned })
      setView('duel')
      return
    }
    setWaiting(null)
    setDirection(turned)
    setIndex(target)
    setView('questions')
  }

  const goNext = () => {
    if (index + 1 < TOTAL) goTo(index + 1, 'forward')
    else setView('maze')
  }

  const question = QUESTIONS[index]

  return (
    <SeaStage>
      {view === 'intro' && <SeaIntro load={load} onRetry={() => void reload()} onEnter={() => goTo(0, 'forward')} />}

      {view === 'questions' && (
        <>
          <QuestionProgress
            questions={QUESTIONS}
            answered={answeredIds}
            index={index}
            onJump={(target) => goTo(target, target >= index ? 'forward' : 'back')}
          />
          <SeaScroll>
            <QuestionCard
              key={question.id}
              question={question}
              number={index + 1}
              total={TOTAL}
              chapterLabel={CHAPTER_LABEL}
              draft={drafts[question.id] ?? answers[question.id]?.answer ?? ''}
              direction={direction}
              canGoBack={index > 0}
              onDraftChange={(text) => setDrafts((current) => ({ ...current, [question.id]: text }))}
              onPrevious={() => goTo(index - 1, 'back')}
              onNext={goNext}
            />
          </SeaScroll>
        </>
      )}

      {view === 'duel' && waiting && (
        <SeaScroll>
          <CannonDuel
            onBack={() => setView('questions')}
            onDefeated={() => {
              setBeaten(true)
              goTo(waiting.target, waiting.turned, true)
            }}
          />
        </SeaScroll>
      )}

      {view === 'maze' && (
        <SeaScroll>
          <MazeTrap onSolved={() => setView('jail')} onSkip={() => setView('jail')} />
        </SeaScroll>
      )}

      {view === 'jail' && (
        <SeaScroll>
          <JailEscape onFinished={() => setView('complete')} />
        </SeaScroll>
      )}

      {view === 'complete' && (
        <SeaScroll>
          <ChapterCompletion
            save={saveState}
            onRetry={() => void saveEverything()}
            title={HIGH_SEAS_COPY.completeTitle}
            subtitle={HIGH_SEAS_COPY.completeSubtitle}
          />
        </SeaScroll>
      )}
    </SeaStage>
  )
}
