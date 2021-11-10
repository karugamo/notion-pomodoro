import {initializeApp} from 'firebase/app'
import {getDatabase, ref, onValue, set} from 'firebase/database'
import {isNull} from 'lodash'
import {useEffect, useState} from 'react'

const firebaseConfig = {
  apiKey: 'AIzaSyCM1KhB3KGTcmeE8gYVSPWKozm2jVCBQRk',
  authDomain: 'notion-pomodoro.firebaseapp.com',
  databaseURL:
    'https://notion-pomodoro-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'notion-pomodoro',
  storageBucket: 'notion-pomodoro.appspot.com',
  messagingSenderId: '277316770356',
  appId: '1:277316770356:web:e2af2da91a34ef60580861'
}

const app = initializeApp(firebaseConfig)

const database = getDatabase(app)

export function useSharedState(id = 'test-space', initialState) {
  const space = ref(database, id)

  const [sharedState, setSharedState] = useState<any>(initialState)

  useEffect(() => {
    onValue(space, (snapshot) => {
      if (isNull(snapshot.val())) return
      setSharedState(snapshot.val())
    })
  }, [])

  function setState(value) {
    set(space, value)
  }

  return [sharedState, setState]
}

export default app
