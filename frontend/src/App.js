import { Route, Routes, Navigate } from "react-router-dom";
import Header from "./components/Header/Header";
import SignIn from "./pages/SignIn/SignIn";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Admin from "./pages/Admin/Admin";
import Instructor from "./pages/Instructor/Instructor";
import Student from "./pages/Student/Student";
import CourseView from "./pages/CourseView/CourseView";
import MyCourses from "./pages/MyCourses/MyCourse";
import ManageInstructors from "./pages/ManageInstructors/ManageInstructors";
import Courses from "./pages/Courses/Courses";

function App() {
  const userRole = localStorage.getItem("userRole");
  const isAuthenticated = localStorage.getItem("token");

  return (
    <div>
      <Header />
      <Routes>
        <Route path="/signup" element={<SignIn />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route 
          path="/admin" 
          element={userRole === "admin" ? <Admin /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/instructor" 
          element={userRole === "instructor" ? <Instructor /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/student" 
          element={userRole === "student" ? <Student /> : <Navigate to="/login" />} 
        />
        <Route
          path="/course/:courseId"
          element={isAuthenticated ? <CourseView /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-courses"
          element={isAuthenticated ? <MyCourses /> : <Navigate to="/login" />}
        />
        <Route
          path="/instructors"
          element={userRole === "admin" ? <ManageInstructors /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/manage-courses"
          element={userRole === "admin" ? <Courses /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;
