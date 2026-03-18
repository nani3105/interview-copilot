import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SplashScreen } from './screens/SplashScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { JobContextScreen } from './screens/JobContextScreen'
import { SessionScreen } from './screens/SessionScreen'
import { SettingsScreen } from './screens/SettingsScreen'

export function App() {
  return (
    <HashRouter>
      <div className="h-screen w-screen overflow-hidden bg-navy-900">
        <Routes>
          <Route path="/" element={<Navigate to="/splash" replace />} />
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/job-context" element={<JobContextScreen />} />
          <Route path="/session" element={<SessionScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </div>
    </HashRouter>
  )
}
