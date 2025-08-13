import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage"; // Main HomePage with all components
import HomePageOld from "../components/HomePage/HomePage"; // Your previous Material UI HomePage
import AboutPage from "../pages/AboutPage";
import ServicesPage from "../pages/ServicesPage";
import ContactUsPage from "../pages/ContactUsPage";
import UserManualPage from "../pages/UserManualPage";
import NewsListPage from "../pages/NewsListPage"; // News list page
import NewsPage from "../pages/NewsPage"; // Individual news page
import Signin from "../components/SignIn/Signin";
import Signup from "../components/SignUp/Signup";
import ForgotPassword from "../components/ForgotPassword/ForgotPassword";
import ForgotPasswordPlain from "../components/ForgotPassword/ForgotPasswordPlain";
import LicensePreviewPage from "../pages/LicensePreviewPage";
import EmailVerification from "../components/EmailVerification/EmailVerification";
import OTPVerification from "../components/OTPVerification/OTPVerification";
import UserDashboard from "../pages/UserDashboard"; // Changed to use the complete dashboard
import AdminDashboard from "../components/Admin_Dashboard/Dashboard/AdminDashboard";
import AdminUsers from "../components/Admin_Dashboard/Users/AdminUsers";
import AdminApplications from "../components/Admin_Dashboard/Applications/AdminApplications";
import ExamManagement from "../components/Admin_Dashboard/ExamManagement/ExamManagement";
import PracticalExamApproval from "../components/Admin_Dashboard/ExamManagement/PracticalExamApproval";
import PracticalExamConduct from "../components/Admin_Dashboard/ExamManagement/PracticalExamConduct";
import PracticalExamResultEntry from "../components/Admin_Dashboard/ExamManagement/PracticalExamResultEntry";
import AdminTrialQuestions from "../components/Admin_Dashboard/TrialQuestions/AdminTrialQuestions";
import AdminTrialResults from "../components/Admin_Dashboard/TrialResults/AdminTrialResults";
import PaymentManagement from "../components/Admin_Dashboard/PaymentManagement/PaymentManagement";
import LicenseManagement from "../components/Admin_Dashboard/LicenseManagement/LicenseManagement";
import RenewalManagement from "../components/Admin_Dashboard/RenewalManagement/RenewalManagement";
import NewsManagement from "../components/Admin_Dashboard/NewsManagement/NewsManagement";
import ViolationsManagement from "../components/Admin_Dashboard/ViolationsManagement/ViolationsManagement";
import GenerateReport from "../components/Admin_Dashboard/Reports/GenerateReport";
import ViewReport from "../components/Admin_Dashboard/Reports/ViewReport";
import LicenseVerification from "../components/LicenseVerification/LicenseVerification";
import LicenseInfoPage from "../pages/LicenseInfoPage";
import AuthRedirect from "../components/AuthRedirect/AuthRedirect";
import ExaminerDashboard from "../components/Examiner_Dashboard/Dashboard/ExaminerDashboard";
import ConductExam from "../components/Examiner_Dashboard/ConductExam/ConductExam";
import AvailableExams from "../components/Examiner_Dashboard/AvailableExams/AvailableExams";
import TrafficPoliceDashboard from "../components/TrafficPolice_Dashboard/Dashboard/TrafficPoliceDashboard";
import TrafficPoliceRoute from "../components/ProtectedRoute/TrafficPoliceRoute";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated =
    localStorage.getItem("userName") || localStorage.getItem("userId");

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const userType = localStorage.getItem("userType");
  const isAuthenticated = localStorage.getItem("userId");

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (userType !== "admin") {
    // Redirect to appropriate dashboard based on user type
    if (userType === "examiner") {
      return <Navigate to="/examiner/dashboard" replace />;
    } else if (userType === "traffic_police") {
      return <Navigate to="/traffic-police/dashboard" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }
  return children;
};

// User route component
const UserRoute = ({ children }) => {
  const userType = localStorage.getItem("userType");
  const isAuthenticated = localStorage.getItem("userId");

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If admin user tries to access user dashboard, redirect to admin dashboard
  if (userType === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If examiner user tries to access user dashboard, redirect to examiner dashboard
  if (userType === "examiner") {
    return <Navigate to="/examiner/dashboard" replace />;
  }

  // If traffic police user tries to access user dashboard, redirect to traffic police dashboard
  if (userType === "traffic_police") {
    return <Navigate to="/traffic-police/dashboard" replace />;
  }

  return children;
};

// Examiner route component
const ExaminerRoute = ({ children }) => {
  const userType = localStorage.getItem("userType");
  const isAuthenticated = localStorage.getItem("userId");

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (userType !== "examiner") {
    // Redirect to appropriate dashboard based on user type
    if (userType === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userType === "traffic_police") {
      return <Navigate to="/traffic-police/dashboard" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/old-home" element={<HomePageOld />} />{" "}
      {/* Added your previous homepage */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/aboutus" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="/user-manual" element={<UserManualPage />} />
      <Route path="/news" element={<NewsListPage />} />
      <Route path="/news/:id" element={<NewsPage />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password/plain" element={<ForgotPasswordPlain />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      {/* License verification route (for QR code scanning) */}
      <Route path="/verify/:licenseNumber" element={<LicenseVerification />} />
      {/* License preview route (uses front-end compact layout) */}
      <Route path="/license/:licenseNumber" element={<LicensePreviewPage />} />
      {/* License information routes */}
      <Route path="/license-info/:type" element={<LicenseInfoPage />} />
      <Route path="/requirements" element={<LicenseInfoPage />} />
      <Route path="/categories" element={<LicenseInfoPage />} />
      <Route path="/fees" element={<LicenseInfoPage />} />
      {/* Auth required routes */}
      <Route path="/apply" element={<AuthRedirect />} />
      <Route path="/exam" element={<AuthRedirect />} />
      <Route path="/renewal" element={<AuthRedirect />} />
      <Route path="/violations" element={<AuthRedirect />} />
      <Route path="/status" element={<AuthRedirect />} />
      {/* User routes */}
      <Route
        path="/user-dashboard"
        element={
          <UserRoute>
            <UserDashboard />
          </UserRoute>
        }
      />
      {/* Legacy dashboard route */}
      <Route
        path="/dashboard"
        element={
          <UserRoute>
            <UserDashboard />
          </UserRoute>
        }
      />
      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <AdminRoute>
            <AdminApplications />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/applications/:id"
        element={
          <AdminRoute>
            <AdminApplications />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/exams"
        element={
          <AdminRoute>
            <ExamManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/practical-exams"
        element={
          <AdminRoute>
            <PracticalExamApproval />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/practical-exams/conduct/:examId"
        element={
          <AdminRoute>
            <PracticalExamConduct />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/practical-exams/result/:examId"
        element={
          <AdminRoute>
            <PracticalExamResultEntry />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/trial-questions"
        element={
          <AdminRoute>
            <AdminTrialQuestions />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/trial-results"
        element={
          <AdminRoute>
            <AdminTrialResults />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <AdminRoute>
            <PaymentManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/licenses"
        element={
          <AdminRoute>
            <LicenseManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/renewals"
        element={
          <AdminRoute>
            <RenewalManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/news"
        element={
          <AdminRoute>
            <NewsManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/violations"
        element={
          <AdminRoute>
            <ViolationsManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/generate-report"
        element={
          <AdminRoute>
            <GenerateReport />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/view-report"
        element={
          <AdminRoute>
            <ViewReport />
          </AdminRoute>
        }
      />
      {/* Examiner routes */}
      <Route
        path="/examiner/dashboard"
        element={
          <ExaminerRoute>
            <ExaminerDashboard />
          </ExaminerRoute>
        }
      />
      <Route
        path="/examiner/conduct-exam/:examId"
        element={
          <ExaminerRoute>
            <ConductExam />
          </ExaminerRoute>
        }
      />
      <Route
        path="/examiner/available-exams"
        element={
          <ExaminerRoute>
            <AvailableExams />
          </ExaminerRoute>
        }
      />
      {/* Traffic Police routes */}
      <Route
        path="/traffic-police/dashboard"
        element={
          <TrafficPoliceRoute>
            <TrafficPoliceDashboard />
          </TrafficPoliceRoute>
        }
      />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
