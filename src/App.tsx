import { useState } from 'react'
import { LoginPage } from './components/LoginPage'
import { Messenger } from './components/Messenger'
import { loadCredentials, saveCredentials } from './state/storage'
import type { Credentials } from './types'

function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(loadCredentials)

  function handleLogin(next: Credentials) {
    saveCredentials(next)
    setCredentials(next)
  }

  function handleLogout() {
    saveCredentials(null)
    setCredentials(null)
  }

  if (!credentials) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <Messenger key={credentials.idInstance} credentials={credentials} onLogout={handleLogout} />
}

export default App
