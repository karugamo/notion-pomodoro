import React, {useEffect, useState} from 'react'
import styled, {ThemeProvider} from 'styled-components'
import {useSharedState} from './firebase'
const bellUrl = require('../assets/bell.mp3')
const bell = new Audio(bellUrl)

const intervalLength = 500
const workTime = 25 * 2
const breakTime = 5 * 2
const defaultDuration = minutesToMilliseconds(workTime)

const roomId = getQueryParam('id') || generateRoomId()

const workTheme = {
  backgroundColor: '#eeeee4',
  textColor: '#242422'
}

const breakTheme = {
  backgroundColor: '#242422',
  textColor: '#eeeee4'
}

export default function App() {
  const [timerEndTime, setTimerEndTime] = useSharedState<number | null>(
    `${roomId}/timerEndTime`,
    null
  )

  const [timeLeft, setTimeLeft] = useSharedState<number>(
    `${roomId}/timeLeft`,
    defaultDuration
  )

  const remainingTime = timerEndTime ? timerEndTime - Date.now() : timeLeft

  const [paused, setPaused] = useSharedState(`${roomId}/paused`, true)

  const [count, setCount] = useSharedState(`${roomId}/count`, 1)

  const [working, setWorking] = useSharedState(`${roomId}/working`, true)

  const [mouseEntered, setMouseEntered] = useState(true)

  const [successFullCopy, setSuccessFullCopy] = useState(false)

  useTick()
  useUpdateTitle()

  return (
    <ThemeProvider theme={working ? workTheme : breakTheme}>
      <Main
        onMouseEnter={() => setMouseEntered(true)}
        onMouseLeave={() => setMouseEntered(false)}
      >
        <CountContainer>
          <CountButton
            hidden={!mouseEntered}
            onClick={() => setCount(Math.max(1, count - 1))}
          >
            −
          </CountButton>
          <Count>№ {count}</Count>
          <CountButton
            hidden={!mouseEntered}
            onClick={() => setCount(count + 1)}
          >
            +
          </CountButton>
        </CountContainer>
        {formatTime(remainingTime)}
        <Buttons hidden={!mouseEntered}>
          {remainingTime !== 0 && (
            <Button onClick={playPauseTimer}>
              {paused ? 'Play' : 'Pause'}
            </Button>
          )}
          <SecondaryButton onClick={startWork}>{workTime}:00</SecondaryButton>
          <SecondaryButton onClick={startBreak}>{breakTime}:00</SecondaryButton>
        </Buttons>
        {!isInIframe() && (
          <Guide>
            <h3>How to use with Notion</h3>
            <ol>
              <li>
                <SecondaryButton onClick={copyUrl}>
                  {successFullCopy ? 'Copy the URL ✔' : 'Copy the URL'}
                </SecondaryButton>{' '}
                and paste it into Notion
              </li>
              <li>
                Choose <i>Create embed</i> from the popup menu
              </li>
              <li>Widget is displayed in Notion 💪</li>
            </ol>
          </Guide>
        )}
      </Main>
    </ThemeProvider>
  )

  function copyUrl() {
    navigator.clipboard.writeText(window.location.href)
    setSuccessFullCopy(true)
  }

  function useTick() {
    const [ticks, setTicks] = useState(0)
    useEffect(() => {
      const interval = setInterval(() => {
        if (!paused && remainingTime !== 0) {
          const time = Math.max(remainingTime - intervalLength, 0)
          setTicks(ticks + 1)

          if (time === 0) {
            bell.play()
            if (working) {
              setCount(count + 2)
              resetTimeToBreak()
            } else {
              resetTimeToWork()
            }
          }
        }
      }, intervalLength)

      return () => clearInterval(interval)
    }, [remainingTime, paused, working])
  }

  function useUpdateTitle() {
    useEffect(() => {
      document.title =
        ' № ' +
        count +
        ': ' +
        formatTime(remainingTime) +
        (working ? ' 💪' : ' 🌙')
    }, [remainingTime, count])
  }

  function playPauseTimer() {
    if (paused) {
      setTimerEndTime(Date.now() + remainingTime)
    } else {
      setTimerEndTime(null)
      setTimeLeft(remainingTime)
    }

    setPaused(!paused)
  }

  function resetTimeToBreak() {
    resetTime(breakTime, false)
  }

  function resetTimeToWork() {
    resetTime(workTime, true)
  }

  function startWork() {
    resetTime(workTime, true)
    setPaused(false)
  }

  function startBreak() {
    resetTime(breakTime, false)
    setPaused(false)
  }

  function resetTime(duration: number, working: boolean) {
    setTimerEndTime(Date.now() + minutesToMilliseconds(duration) + 1000)
    setPaused(true)
    setWorking(working)
  }
}

function formatTime(time: number) {
  const minutes = Math.floor(time / (60 * 1000))
  const seconds = Math.floor((time % (60 * 1000)) / 1000)
  return `${minutes}:${pad(seconds)}`
}

function minutesToMilliseconds(minutes: number) {
  return minutes * 60 * 1000
}

function pad(time: number) {
  return time < 10 ? `0${time}` : time
}

function isInIframe() {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

const Guide = styled.div`
  font-size: 24px;

  h3 {
    text-align: center;
    margin-bottom: 0;
    margin-top: 3rem;
  }

  li {
    margin-bottom: 0.5rem;
  }
`

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-variant: tabular-nums;

  background-color: ${({theme}) => theme.backgroundColor};
  color: ${({theme}) => theme.textColor};
  font-size: 75px;
`

const CountContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`

const Buttons = styled.div<{hidden: boolean}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 0.75rem;
  transition: opacity 0.3s ease-in-out;
  ${({hidden}) => hidden && 'opacity: 0;'}
`

const Count = styled.div`
  font-size: 36px;
  display: flex;
  align-items: flex-end;
  opacity: 0.8;
  color: ${({theme}) => theme.textColor};
`

const CountButton = styled.button<{hidden: boolean}>`
  font-size: 24px;
  border: none;
  color: ${({theme}) => theme.textColor};
  background-color: ${({theme}) => theme.backgroundColor};
  cursor: pointer;
  border-radius: 50%;
  width: 30px;
  height: 30px;

  transition: opacity 0.3s ease-in-out;
  ${({hidden}) => hidden && 'opacity: 0;'}

  &:hover {
    color: ${({theme}) => theme.backgroundColor};
    background-color: ${({theme}) => theme.textColor};
  }
`

const Button = styled.button`
  background-color: ${({theme}) => theme.textColor};
  cursor: pointer;
  border-radius: 4px;
  border: none;
  color: ${({theme}) => theme.backgroundColor};
  font-size: 16px;
  padding: 8px 16px;
  min-width: 100px;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.95);
  }
`

const SecondaryButton = styled(Button)`
  background-color: ${({theme}) => theme.backgroundColor};
  color: ${({theme}) => theme.textColor};
  border: 1px solid ${({theme}) => theme.textColor};
`

function generateRoomId() {
  const randomId = getRandomId()
  setQueryParam('id', randomId)
  return randomId
}

function getQueryParam(name: string) {
  const url = new URL(window.location.href)
  return url.searchParams.get(name)
}

function setQueryParam(name: string, value: string) {
  const url = new URL(window.location.href)
  url.searchParams.set(name, value)
  window.history.replaceState(null, '', url.toString())
}

function getRandomId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}
