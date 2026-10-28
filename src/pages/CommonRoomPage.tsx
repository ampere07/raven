import { useCallback, useEffect, useMemo, useState } from 'react'
import { COMMON_ROOM_QUESTIONS, SNITCH_AFTER_QUESTION, VILLAIN_AFTER_QUESTION } from '../../shared/commonRoom'
import { ChapterCompletion, type SaveState } from '../components/common-room/ChapterCompletion'
import { CommonRoomIntroduction } from '../components/common-room/CommonRoomIntroduction'
import { QuestionCard } from '../components/common-room/QuestionCard'
import { QuestionProgress } from '../components/common-room/QuestionProgress'
import { ReturnScene } from '../components/common-room/ReturnScene'
import { SnitchGame } from '../components/common-room/SnitchGame'
import { Stage } from '../components/common-room/Stage'
import { VillainDuel } from '../components/common-room/VillainDuel'
import { useCommonRoom } from '../hooks/useCommonRoom'
import { setSceneTrack } from '../utils/sceneMusic'

type View = 'intro' | 'questions' | 'villain' | 'snitch' | 'return' | 'complete'
type Direction = 'forward' | 'back'

const QUESTIONS = COMMON_ROOM_QUESTIONS
const TOTAL = QUESTIONS.length

// The villain and the Quidditch game each stand between one question and the next. Moving to any question at or past
// a gate meets its scene first. They play every time the chapter is opened.
const gateAfter = (id: string) => {
  const at = QUESTIONS.findIndex((question) => question.id === id)
  return at === -1 ? Number.POSITIVE_INFINITY : at + 1
}
const VILLAIN_GATE = gateAfter(VILLAIN_AFTER_QUESTION)
const SNITCH_GATE = gateAfter(SNITCH_AFTER_QUESTION)

type Waiting = { target: number; turned: Direction }

export function CommonRoomPage() {
  const { answers, load, reload, commit } = useCommonRoom()
  const [view, setView] = useState<View>('intro')
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<Direction>('forward')
  // What she has typed, kept in this open page only. It is all sent together once the last scene is over.
  const [drafts, setDrafts] = useState<Readonly<Record<string, string>>>({})
  const [defeated, setDefeated] = useState(false)
  const [snitchDone, setSnitchDone] = useState(false)
  // Where she was going when a scene stepped in, so she can carry on there once it is over.
  const [waiting, setWaiting] = useState<Waiting | null>(null)
  const [saveState, setSaveState] = useState<SaveState>({ status: 'saving' })

  // The snitch scene may swap the music; leaving the chapter gives it back.
  useEffect(() => () => setSceneTrack(null), [])

  // Earlier answers from a past visit start out in the boxes, so changing one is just typing over it.
  const textOf = useCallback(
    (id: string) => (drafts[id] ?? answers[id]?.answer ?? '').trim(),
    [drafts, answers],
  )
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
      setSaveState({ status: 'failed', message: error instanceof Error ? error.message : 'May nangyaring mali.' })
    }
  }, [commit, textOf])

  // The one and only save: as soon as the last scene is over.
  useEffect(() => {
    if (view === 'complete') void saveEverything()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on arrival; retries are explicit
  }, [view])

  const sceneBefore = (target: number, beaten: boolean, caught: boolean): View | null => {
    if (target >= VILLAIN_GATE && !beaten) return 'villain'
    if (target >= SNITCH_GATE && !caught) return 'snitch'
    return null
  }

  const continueTo = (target: number, turned: Direction, beaten: boolean, caught: boolean) => {
    const scene = sceneBefore(target, beaten, caught)
    if (scene) {
      setWaiting({ target, turned })
      setView(scene)
      return
    }
    setWaiting(null)
    setDirection(turned)
    setIndex(target)
    setView('questions')
  }

  const goTo = (target: number, turned: Direction) => continueTo(target, turned, defeated, snitchDone)

  const goNext = () => {
    if (index + 1 < TOTAL) goTo(index + 1, 'forward')
    else setView('return')
  }

  const question = QUESTIONS[index]

  return (
    <Stage>
      {view === 'intro' && (
        <CommonRoomIntroduction load={load} onRetry={() => void reload()} onEnter={() => goTo(0, 'forward')} />
      )}

      {view === 'questions' && (
        <>
          <QuestionProgress
            questions={QUESTIONS}
            answered={answeredIds}
            index={index}
            onJump={(target) => goTo(target, target >= index ? 'forward' : 'back')}
          />
          <QuestionCard
            key={question.id}
            question={question}
            number={index + 1}
            total={TOTAL}
            draft={drafts[question.id] ?? answers[question.id]?.answer ?? ''}
            direction={direction}
            canGoBack={index > 0}
            onDraftChange={(text) => setDrafts((current) => ({ ...current, [question.id]: text }))}
            onPrevious={() => goTo(index - 1, 'back')}
            onNext={goNext}
          />
        </>
      )}

      {view === 'villain' && waiting && (
        <VillainDuel
          onBack={() => setView('questions')}
          onDefeated={() => {
            setDefeated(true)
            continueTo(waiting.target, waiting.turned, true, snitchDone)
          }}
        />
      )}

      {view === 'snitch' && waiting && (
        <SnitchGame
          onDone={() => {
            setSnitchDone(true)
            continueTo(waiting.target, waiting.turned, defeated, true)
          }}
        />
      )}

      {view === 'return' && <ReturnScene onFinished={() => setView('complete')} />}

      {view === 'complete' && <ChapterCompletion save={saveState} onRetry={() => void saveEverything()} />}
    </Stage>
  )
}
