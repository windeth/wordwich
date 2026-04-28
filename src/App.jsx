import { useGameStore } from './store/useGameStore'
import { useTheme } from './hooks/useTheme'
import HomeScreen from './components/screens/HomeScreen'
import SinglePlayerScreen from './components/screens/SinglePlayerScreen'
import SoloClassicSetupScreen from './components/screens/SoloClassicSetupScreen'
import DifficultyScreen from './components/screens/DifficultyScreen'
import PlayerSetupScreen from './components/screens/PlayerSetupScreen'
import MultiplayerScreen from './components/screens/MultiplayerScreen'
import HighScoresScreen from './components/screens/HighScoresScreen'
import HowToPlayScreen from './components/screens/HowToPlayScreen'
import SettingsScreen from './components/screens/SettingsScreen'
import GameScreen from './components/screens/GameScreen'
import RecapScreen from './components/screens/RecapScreen'
import HallOfFame from './components/screens/HallOfFame'
import BTCGameOverScreen from './components/screens/BTCGameOverScreen'
import SoloClassicEndScreen from './components/screens/SoloClassicEndScreen'

export default function App() {
  const screen = useGameStore(s => s.screen)
  useTheme()

  return (
    <div style={{ minHeight: '100svh', background: 'var(--bg)', transition: 'background 0.25s cubic-bezier(0.2,0,0,1)' }}>
      {screen === 'home'             && <HomeScreen />}
      {screen === 'singleplayer'     && <SinglePlayerScreen />}
      {screen === 'soloclassicsetup' && <SoloClassicSetupScreen />}
      {screen === 'difficulty'       && <DifficultyScreen />}
      {screen === 'playersetup'      && <PlayerSetupScreen />}
      {screen === 'multiplayer'      && <MultiplayerScreen />}
      {screen === 'highscores'       && <HighScoresScreen />}
      {screen === 'howtoplay'        && <HowToPlayScreen />}
      {screen === 'settings'         && <SettingsScreen />}
      {screen === 'game'             && <GameScreen />}
      {screen === 'recap'            && <RecapScreen />}
      {screen === 'halloffame'       && <HallOfFame />}
      {screen === 'btcgameover'      && <BTCGameOverScreen />}
      {screen === 'soloclassicend'   && <SoloClassicEndScreen />}
    </div>
  )
}
