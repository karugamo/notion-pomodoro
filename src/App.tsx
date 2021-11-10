import React, {useEffect} from 'react'
import styled from 'styled-components'
import {useSharedState} from './firebase'

const defaultDuration = minutesToMilliseconds(25)
const intervalLength = 500

export default function App() {
  const [remainingTime, setRemainingTime] = useSharedState(
    'test-id/remainingTime',
    defaultDuration
  )

  const [paused, setPaused] = useSharedState('test-id/paused', false)

  useTick()
  useUpdateTitle()

  return (
    <Main>
      {formatTime(remainingTime)}
      <Buttons>
        {remainingTime !== 0 && (
          <Button onClick={() => setPaused(!paused)}>
            {paused ? 'Play' : 'Pause'}
          </Button>
        )}
        <SecondaryButton onClick={() => resetTime(25)}>25:00</SecondaryButton>
        <SecondaryButton onClick={() => resetTime(5)}>5:00</SecondaryButton>
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
  )

  function useTick() {
    useEffect(() => {
      const interval = setInterval(() => {
        if (!paused && remainingTime !== 0)
          setRemainingTime(Math.max(remainingTime - intervalLength, 0))
      }, intervalLength)

      return () => clearInterval(interval)
    }, [remainingTime, paused])
  }

  function useUpdateTitle() {
    useEffect(() => {
      document.title = formatTime(remainingTime)
    }, [remainingTime])
  }

  function resetTime(duration: number) {
    setRemainingTime(minutesToMilliseconds(duration))
    setPaused(true)
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

  background-color: #eeeee4;
  color: #242422;
  font-size: 75px;
`

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
`

const Button = styled.button`
  background-color: #242422;
  cursor: pointer;
  border-radius: 4px;
  border: none;
  color: #eeeee4;
  font-size: 16px;
  padding: 8px;
  width: 100px;

  &:hover {
    background-color: #32322f;
  }

  &:active {
    transform: scale(0.95);
    background-color: #1c1c1a;
  }
`

const SecondaryButton = styled(Button)`
  background-color: #eeeee4;
  color: #242422;
  border: 1px solid #242422;

  &:hover {
    background-color: #e4e4e0;
  }

  &:active {
    transform: scale(0.95);
    background-color: #d8d8d4;
  }
`
