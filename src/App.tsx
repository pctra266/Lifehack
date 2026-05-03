import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Wheel from './Components/Wheel/Wheel'
import DailyGoal from './Components/DailyGoal/DailyGoal'
import DateCard from './Components/DateIdea/DateCard'
import ChallengeTracker from './Components/ChallengeTracker/ChallengeTracker'

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
          <li>
            <Link to="/challenge">30-Day Challenge</Link>
          </li>
        </ul>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/" element={<Wheel />} />
          <Route path="/daily-goal" element={<DailyGoal />} />
          <Route path="/date-ideas" element={<DateCard />} />
          <Route path="/challenge" element={<ChallengeTracker />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App