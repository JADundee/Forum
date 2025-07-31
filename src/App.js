import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Public from './components/Public'
import Register from './features/auth/Register'
import DashLayout from './components/DashLayout'
import Welcome from './features/auth/Welcome'
import ForumsList from './features/forums/ForumsList'
import UsersList from './features/users/UsersList'
import EditUser from './features/users/EditUser'
import EditForum from './features/forums/EditForum'
import NewForum from './features/forums/NewForum'
import Prefetch from './features/auth/Prefetch'
import PersistLogin from './features/auth/PersistLogin';
import RequireAuth from './features/auth/RequireAuth'
import { ROLES } from './config/roles'
import useTitle from './hooks/useTitle';
import ForumExpand from './features/forums/ForumExpand'
import NotificationsList from './features/notifications/NotificationsList'
import ForgotPassword from './features/auth/ForgotPassword'
import ResetPassword from './features/auth/ResetPassword'
import Profile from './features/users/Profile'

function App() {
  useTitle('theForum')

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route index element={<Public />} />
        <Route path="register" element={<Register />}>
        </Route>
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth allowedRoles={[...Object.values(ROLES)]} />}>
            <Route element={<Prefetch />}>
              <Route path="dash" element={<DashLayout />}>

                <Route index element={<Welcome />} />
                <Route path="profile" element={<Profile />} />

                {/* Make notifications accessible to all authenticated users */}
                <Route path="users/notifications/all" element={<NotificationsList />} />

                <Route element={<RequireAuth allowedRoles={[ ROLES.Admin ]} />}>
                  <Route path="users">
                    <Route index element={<UsersList />} />
                    <Route path=":id" element={<EditUser />} />
                  </Route>
                </Route>

                <Route path="forums">
                  <Route index element={<ForumsList />} />
                  <Route path=":id/edit" element={<EditForum />} />
                  <Route path=":id/expand" element={<ForumExpand />} />
                  <Route path="new" element={<NewForum />} />
                </Route>

              </Route>{/* End Dash */}
            </Route>
          </Route>
        </Route>{/* End Protected Routes */}

      </Route>
    </Routes >
  );
}

export default App;