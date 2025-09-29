import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dates from './Dates.jsx'
import Papers from './Papers.jsx'
import Committee from './Committee.jsx'
import Speakers from './Speakers.jsx'
import Schedule from './Schedule.jsx'
import { Registration } from './Registration.jsx'
import Admin from './Admin.jsx'
import Reviewer from './Reviewer.jsx'
import PasswordChange from './PasswordChange.jsx'
import ResourceNotFound from './ResourceNotFound.jsx'
import Auth from './Auth.jsx'
import { AuthProvider } from './AuthContext.jsx'
import ReviewerDashboard from './ReviewerDashboard.jsx'
import PaperStatus from './PaperStatus.jsx'

const router = createBrowserRouter(
  [
    { path: '/',
       element: <App />,
       errorElement:<ResourceNotFound/> ,
      },
    { path: '/auth', element: <Auth /> },
    { path: '/dates', element: <Dates /> },
    { path: '/papers', element: <Papers /> },
    { path: '/committee', element: <Committee /> },
    { path: '/speakers', element: <Speakers /> },
    { path: '/schedule', element: <Schedule /> },
    { path: '/registration', element: <Registration /> },
    { path: '/admin', element: <Admin /> },
    { path: '/reviewer', element: <Reviewer /> },
    { path: '/reviewer-dashboard', element: <ReviewerDashboard /> },
    { path: '/paper-status', element: <PaperStatus /> },
    { path: '/change-password', element: <PasswordChange /> }
  ],
  {
    basename: '/ICoDSES/'
  }
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)
