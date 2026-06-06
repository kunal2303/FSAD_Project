import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import RecruiterDashboard from './pages/recruiter/Dashboard'
import RecruiterJobs from './pages/recruiter/Jobs'
import RecruiterApplications from './pages/recruiter/Applications'
import RecruiterInterviews from './pages/recruiter/Interviews'
import RecruiterOffers from './pages/recruiter/Offers'
import RecruiterReports from './pages/recruiter/Reports'

import CandidateDashboard from './pages/candidate/Dashboard'
import BrowseJobs from './pages/candidate/BrowseJobs'
import CandidateApplications from './pages/candidate/Applications'
import CandidateInterviews from './pages/candidate/Interviews'
import CandidateOffers from './pages/candidate/Offers'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Recruiter */}
          <Route element={<ProtectedRoute role="RECRUITER" />}>
            <Route element={<Layout />}>
              <Route path="/recruiter" element={<RecruiterDashboard />} />
              <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
              <Route path="/recruiter/applications" element={<RecruiterApplications />} />
              <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
              <Route path="/recruiter/offers" element={<RecruiterOffers />} />
              <Route path="/recruiter/reports" element={<RecruiterReports />} />
            </Route>
          </Route>

          {/* Candidate */}
          <Route element={<ProtectedRoute role="CANDIDATE" />}>
            <Route element={<Layout />}>
              <Route path="/candidate" element={<CandidateDashboard />} />
              <Route path="/candidate/jobs" element={<BrowseJobs />} />
              <Route path="/candidate/applications" element={<CandidateApplications />} />
              <Route path="/candidate/interviews" element={<CandidateInterviews />} />
              <Route path="/candidate/offers" element={<CandidateOffers />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
