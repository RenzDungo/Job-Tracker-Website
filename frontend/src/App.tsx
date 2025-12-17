import { useState } from 'react'
import LoginPage from './pages/Login'
import AddPage from './pages/AddPage'
import Homepage from './pages/HomePage'
import AIPage from './pages/AI'
import NavbarComponent from './components/navbar'
function App() {
  const [page, setPage] =useState("Home")
  return (
    <div style={{alignContent:"center", justifyContent:"center"}}>
      <NavbarComponent page={page} setPage={setPage}/>
      <div style={{paddingTop:"15px"}}>
      {page === "Login" && <LoginPage setPage={setPage}/>}
      {page=== "Home" && <Homepage/>}
      {page=== "Add" && <AddPage setPage={setPage}/>}
      {page === "AI" && <AIPage setPage={setPage}/>}
      </div>

    </div>
  )
}

export default App
