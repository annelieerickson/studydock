import { HashRouter, Outlet, Route, Routes } from 'react-router-dom'
import PhoneFrame from './components/PhoneFrame'
import { TabBar } from './components/ui'
import { StoreProvider } from './store'
import { ThemeProvider } from './theme'
import Home from './screens/Home'
import { ProjectsList, SubjectDetail, ProjectDetail } from './screens/Projects'
import { CreatePlan, PlanSession } from './screens/Planner'
import { DockInstructions, ActiveSession, SessionDone } from './screens/Session'
import { FriendsList, AddFriends } from './screens/Friends'
import { Profile, SessionHistory } from './screens/Profile'
import Dock from './screens/Dock'

function TabLayout() {
  return (
    <>
      <Outlet />
      <TabBar />
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
      {/* HashRouter so deep links work on GitHub Pages without server rewrites */}
      <HashRouter>
        <PhoneFrame>
          <Routes>
            <Route element={<TabLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<ProjectsList />} />
              <Route path="/friends" element={<FriendsList />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Home />} />
            </Route>
            <Route path="/projects/:id" element={<SubjectDetail />} />
            <Route path="/projects/:id/:pid" element={<ProjectDetail />} />
            <Route path="/create/:step" element={<CreatePlan />} />
            <Route path="/start/:step" element={<PlanSession />} />
            <Route path="/session/dock" element={<DockInstructions />} />
            <Route path="/session/active" element={<ActiveSession />} />
            <Route path="/session/done" element={<SessionDone />} />
            <Route path="/friends/add" element={<AddFriends />} />
            <Route path="/history" element={<SessionHistory />} />
            <Route path="/dock" element={<Dock />} />
          </Routes>
        </PhoneFrame>
      </HashRouter>
      </ThemeProvider>
    </StoreProvider>
  )
}
