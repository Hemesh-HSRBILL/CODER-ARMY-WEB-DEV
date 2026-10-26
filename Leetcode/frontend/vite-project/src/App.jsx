import { useEffect } from 'react'
import './App.css'
import {Route , Routes , Navigate} from 'react-router'
import Homepage from './pages/Homepage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Admin from './pages/Admin/Admin.jsx';
import { useDispatch , useSelector } from 'react-redux'
import { checkAuth } from './slice/authSlice.js';
import CreateProblem from "./pages/Admin/createProblem.jsx"
import UpdateProblem from "./pages/Admin/Update_problem.jsx"
import DeleteProblem from "./pages/Admin/delete_problem.jsx"
import AdminVideo from "./pages/Admin/AdminVideo.jsx"
import AdminUpload from "./pages/Admin/AdminUpload.jsx"
import ProblemPage from "./pages/submission_page/ProblemPage.jsx"

function App() {

  //First call when jusr user click my website it check is use authencicated or not
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

// check initial authentication
  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch]) //dispach is constant value so it never change dispatch run one time only whenuser enter so all do [] empaty array in place of [dispatch] 

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return(
    <>
    <Routes>
      <Route path="/" element={isAuthenticated ?<Homepage></Homepage> :<Navigate to="/signup" />}></Route>
      <Route path='/login' element={
        isAuthenticated
          ? <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />
          : <Login />
      }></Route>
      <Route path='/signup' element={
        isAuthenticated
          ? <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />
          : <Signup />
      }></Route>
      <Route path='/Login' element={<Navigate to="/login" replace />}></Route>
      <Route path='/Signup' element={<Navigate to="/signup" replace />}></Route>
      <Route path='/admin/dashboard' element={
        isAuthenticated && user?.role === "admin"
          ? <Admin />
          : <Navigate to={isAuthenticated ? '/' : '/signup'} replace />
      }></Route>

      <Route path='/admin' element={
        <Navigate to="/admin/dashboard" replace />
      }></Route>

      <Route path='/admin/problem/create' element={
        isAuthenticated && user?.role === "admin"
        ?<CreateProblem/>
        : <Navigate to={isAuthenticated ? '/' : '/signup'} replace />
      }></Route>

      <Route path='/admin/problem/update' element={
        isAuthenticated && user?.role === "admin"
        ?<UpdateProblem/>
        : <Navigate to={isAuthenticated ? '/' : '/signup'} replace />
      }></Route>

      <Route path='/admin/problem/delete' element={
        isAuthenticated && user?.role === "admin"
        ?<DeleteProblem/>
        : <Navigate to={isAuthenticated ? '/' : '/signup'} replace />
      }></Route>

      <Route path="/problem/:problemid" element={<ProblemPage />} />
      <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
      <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />

    </Routes>
    </>
  )
}

export default App

// notes  Nagivate to use only use with ROuting small navegate use without routing
