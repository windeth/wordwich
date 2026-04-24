import { useGameStore } from './store/useGameStore'
import SetupScreen from './components/screens/SetupScreen'
import GameScreen from './components/screens/GameScreen'
import RecapScreen from './components/screens/RecapScreen'
import HallOfFame from './components/screens/HallOfFame'

export default function App() {
  const screen = useGameStore(s => s.screen)

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      {screen === 'setup' && <SetupScreen />}
      {screen === 'game' && <GameScreen />}
      {screen === 'recap' && <RecapScreen />}
      {screen === 'halloffame' && <HallOfFame />}
    </div>
  )
}
