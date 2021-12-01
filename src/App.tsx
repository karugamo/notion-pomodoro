import React, {useEffect} from 'react'
import styled, {ThemeProvider} from 'styled-components'
import {useSharedState} from './firebase'
const bellUrl = require('../assets/bell.mp3')
const bell = new Audio(bellUrl)

const defaultDuration = minutesToMilliseconds(25)
const intervalLength = 500
const workTime = 25
const breakTime = 5

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
  const [remainingTime, setRemainingTime] = useSharedState(
    `${roomId}/remainingTime`,
    defaultDuration
  )

  const [paused, setPaused] = useSharedState(`${roomId}/paused`, true)

  const [count, setCount] = useSharedState(`${roomId}/count`, 1)

  const [working, setWorking] = useSharedState(`${roomId}/working`, true)

  useTick()
  useUpdateTitle()

  return (
    <ThemeProvider theme={working ? workTheme : breakTheme}>
      <Main>
        <CountContainer>
          <CountButton onClick={() => setCount(Math.max(1, count - 1))}>
            −
          </CountButton>
          <Count>№ {count}</Count>
          <CountButton onClick={() => setCount(count + 1)}>+</CountButton>
        </CountContainer>
        {formatTime(remainingTime)}
        <Buttons>
          {remainingTime !== 0 && (
            <Button onClick={() => setPaused(!paused)}>
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
              <li>Copy the URL and paste it into Notion</li>
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

  function useTick() {
    useEffect(() => {
      const interval = setInterval(() => {
        if (!paused && remainingTime !== 0) {
          const time = Math.max(remainingTime - intervalLength, 0)
          setRemainingTime(time)

          if (time === 0) {
            bell.play()
            if (working) {
              setCount(count + 1)
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
    setRemainingTime(minutesToMilliseconds(duration))
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

  background-color: ${({theme}) => theme.backgroundColor};
  color: ${({theme}) => theme.textColor};
  font-size: 75px;
`

const CountContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 0.75rem;
`

const Count = styled.div`
  font-size: 36px;
  display: flex;
  align-items: flex-end;
  opacity: 0.8;
  color: ${({theme}) => theme.textColor};
`

const CountButton = styled.button`
  font-size: 24px;
  border: none;
  color: ${({theme}) => theme.textColor};
  background-color: ${({theme}) => theme.backgroundColor};
  cursor: pointer;
  border-radius: 50%;
  width: 30px;
  height: 30px;

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
  padding: 8px;
  width: 100px;

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
  window.history.replaceState(null, null, url.toString())
}

function getRandomId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}
