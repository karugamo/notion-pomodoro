import React, {useState, useEffect} from 'react'
import styled from 'styled-components'

const defaultDuration = minutesToMilliseconds(25)
const intervalLength = 100

export default function App() {
  const [remainingTime, setRemainingTime] = useState<number>(defaultDuration)
  const [paused, setPaused] = useState<boolean>(true)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!paused && remainingTime !== 0)
        setRemainingTime((remainingTime) =>
          Math.max(remainingTime - intervalLength, 0)
        )
    }, intervalLength)

    return () => clearInterval(interval)
  }, [paused])

  return (
    <Main>
      {formatTime(remainingTime)}
      <Buttons>
        {remainingTime !== 0 && (
          <Button onClick={() => setPaused((paused) => !paused)}>
            {paused ? 'Play' : 'Pause'}
          </Button>
        )}
        <SecondaryButton onClick={() => resetTime(25)}>25:00</SecondaryButton>
        <SecondaryButton onClick={() => resetTime(5)}>5:00</SecondaryButton>
        {isInIframe() && 'iFrame!'}
      </Buttons>
    </Main>
  )

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
