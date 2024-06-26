import { useState } from 'react'
import axios from 'axios'
import './App.css'
import LoginPage from './pages/LoginPage'
import { UserContextProvider } from './UserContext'
import Routes from './Routes'

function App() {
  const [count, setCount] = useState(0)
  axios.defaults.baseURL = 'http://localhost:3000';
  axios.defaults.withCredentials = true;
  return (
    <>
      <UserContextProvider>
        <Routes />
      </UserContextProvider>
    </>
  )
}

export default App
