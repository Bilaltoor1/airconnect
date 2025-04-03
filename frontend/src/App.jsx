import React from 'react';
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from "./page/Auth/Login.jsx";
import Home from "./page/General/Home.jsx";
import SignUp from "./page/Auth/SignUp.jsx";
import Admin from "./page/Admin.jsx";
import Student from "./page/Student.jsx";
import Teacher from "./page/Teacher.jsx";
import RoleBasedRoutes from "./components/RoleBaseRoutes.jsx";
import PublicRoutes from "./components/PublicRoutes.jsx";
import TeacherDetail from "./page/TeacherDetail.jsx";
import AuthLayout from "./layout/AuthLayout.jsx";
import BaseLayout from "./layout/BaseLayout.jsx";
import Application from "./page/Student/Application.jsx";
import Complaints from "./page/Student/Complaints.jsx";
import JobListings from "./page/General/JobListings.jsx";
import StudentApplicationsPage from "./page/Teacher/StudentApplicationsPage.jsx";
import ProfileSetup from "./page/Auth/ProfileSetup.jsx";
import UpdateUser from "./page/Auth/UpdateUser.jsx";
import ChangePassword from "./page/Auth/ChangePassword.jsx";
import ViewUser from "./page/General/ViewUserInformation.jsx";
import CreateJob from "./page/Coordinator/CreateJobs.jsx";
import BatchesPage from "./page/Coordinator/Batches.jsx";
import BatchDetailsPage from "./page/Coordinator/BatchDetailsPage.jsx";
import AddTeacherPage from "@/page/Coordinator/AddTeacherPage.jsx";
import AddStudentPage from "@/page/Coordinator/AddStudentPage.jsx";
import CreatePost from "@/page/General/CreatePost.jsx";
import AddAdvisorPage from "@/page/Coordinator/AddAdvisorPage.jsx";
import BatchManagementPage from "@/page/Coordinator/BatchManagementPage.jsx";
import CoordinatorApplicationPage from "@/page/Coordinator/ApplicationPage.jsx";
import TeacherApplicationPage from "@/page/Teacher/ApplicationPage.jsx";
import StudentApplicationHistory from "@/page/Student/StudentApplicationHistory.jsx";
import TeacherApplicationHistory from "@/page/Teacher/TeacherApplicationHistory.jsx";
import CoordinatorApplicationHistory from "@/page/Coordinator/CoordinatorApplicationHistory.jsx";
import ApplicationDetail from "@/page/General/ApplicationDetail.jsx";
import AnnoucmentDetail from "@/page/General/AnnoucmentDetail.jsx";
import SectionManagementPage from "./page/Coordinator/SectionManagementPage.jsx";
import VerifyTeacherPage from './page/Coordinator/VerifyTeacherPage.jsx';
import { NotificationProvider } from './context/NotificationContext';

function App() {
    return (
        <Router>
            <NotificationProvider>
                <Routes>
                    <Route element={<RoleBasedRoutes requiredRole="student"/>}>
                        <Route element={<BaseLayout/>}>
                            <Route element={<Student/>} path="/student"/>
                            <Route path="/student-applications-history" element={<StudentApplicationHistory/>}/>
                            <Route element={<Application/>} path="/application"/>
                            <Route element={<Complaints/>} path="/complaints"/>
                        </Route>
                    </Route>
                    <Route element={<RoleBasedRoutes requiredRole="teacher"/>}>
                        <Route element={<BaseLayout/>}>
                            <Route element={<Teacher/>} path="/teacher"/>
                            <Route path="/teacher-applications-history" element={<TeacherApplicationHistory/>}/>
                            <Route element={<TeacherDetail/>} path="/teacher/:id"/>
                            <Route element={<StudentApplicationsPage/>} path="/student-applications"/>
                            <Route element={<TeacherApplicationPage/>} path="/teacher-applications"/>
                        </Route>
                    </Route>
                    <Route element={<RoleBasedRoutes requiredRole="student-affairs"/>}>
                        <Route element={<BaseLayout/>}>
                            <Route element={<CreateJob/>} path="/create-jobs"/>
                        </Route>
                    </Route>
                    <Route element={<RoleBasedRoutes requiredRole="coordinator"/>}>
                        <Route element={<BaseLayout/>}>
                            <Route path="/batches" element={<BatchesPage/>}/>
                            <Route path="/add-advisor" element={<AddAdvisorPage/>}/>
                            <Route path="/add-teacher" element={<AddTeacherPage/>}/>
                            <Route path="/add-student" element={<AddStudentPage/>}/>
                            <Route path="/coordinator-applications" element={<CoordinatorApplicationPage/>}/>
                            <Route path="/batches/:batchId" element={<BatchDetailsPage/>}/>
                            <Route path="/batches-management" element={<BatchManagementPage/>}/>
                            <Route path="/section-filter-management" element={<SectionManagementPage/>}/>
                            <Route path="/coordinator-applications-history" element={<CoordinatorApplicationHistory/>}/>
                            <Route path="/verify-teachers" element={<VerifyTeacherPage/>}/>
                        </Route>
                    </Route>
                    <Route element={<ProtectedRoutes/>}>
                        <Route element={<ChangePassword/>} path="/change-password"/>
                        <Route element={<BaseLayout/>}>
                            <Route element={<Home/>} path="/"/>
                            <Route element={<AnnoucmentDetail/>} path="/announcement/:id"/>
                            <Route element={<JobListings/>} path="/job-listings"/>
                            <Route element={<UpdateUser/>} path="/update-user"/>
                            <Route element={<ViewUser/>} path="/view-user"/>
                            <Route path="/applications/:id" element={<ApplicationDetail/>}/>
                            <Route path="/create-announcement" element={<CreatePost/>}/>
                        </Route>
                        <Route element={<ProfileSetup/>} path="/profile-setup"/>
                    </Route>
                    <Route element={<PublicRoutes/>}>
                        <Route element={<AuthLayout/>}>
                            <Route element={<Login/>} path="/login"/>
                            <Route element={<SignUp/>} path="/signup"/>
                        </Route>
                    </Route>
                </Routes>
            </NotificationProvider>
        </Router>
    );
}

export default App;
