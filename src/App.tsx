import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Wheel from './Components/Wheel/Wheel'
import DailyGoal from './Components/DailyGoal/DailyGoal'
import DateCard from './Components/DateIdea/DateCard'

function App() {

  return (
    <BrowserRouter>
      <nav className="navbar">
        <ul className="nav-links">
          <li>
            <Link to="/">Wheel Game</Link>
          </li>
          <li>
            <Link to="/daily-goal">Daily Goal</Link>
          </li>
          <li>
            <Link to="/date-ideas">Discovery</Link>
          </li>
        </ul>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/" element={<Wheel />} />
          <Route path="/daily-goal" element={<DailyGoal />} />
          <Route path="/date-ideas" element={<DateCard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App