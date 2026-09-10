import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import StudentDetails from "./pages/StudentDetails";
import Payments from "./pages/Payments";
import PaymentDashboard from "./pages/PaymentDashboard";
import Layout from "./Layout";
import EditStudent from "./pages/EditStudent";
import Settings from "./pages/Settings";

function App() {
  const [staff, setStaff] = useState(() => {
    const savedStaff = localStorage.getItem("staff");

    return savedStaff
      ? JSON.parse(savedStaff)
      : null;
  });

  const handleLogin = (staffData) => {
    setStaff(staffData);
  };

  const handleStaffUpdate = (staffData) => {
  localStorage.setItem(
    "staff",
    JSON.stringify(staffData)
  );

  setStaff(staffData);
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("staff");

    setStaff(null);
  };

  // ==========================================
  // LOGIN
  // ==========================================

  if (!staff) {
    return <Login onLogin={handleLogin} />;
  }

  // ==========================================
  // APP ROUTES
  // ==========================================

  return (
    <BrowserRouter>
      <Routes>

        <Route
          element={
            <Layout
              staff={staff}
              onLogout={handleLogout}
            />
          }
        >

          {/* DASHBOARD */}
          <Route
            path="/"
            element={
              <Dashboard staff={staff} />
            }
          />

          {/* STUDENTS */}
          <Route
            path="/students"
            element={<Students />}
          />

          {/* ADD STUDENT */}
          <Route
            path="/students/add"
            element={<AddStudent />}
          />

          {/* STUDENT DETAILS */}
          <Route
            path="/students/:id"
            element={<StudentDetails />}
          />

          <Route
             path="/students/:id/edit"
             element={<EditStudent />}
         />

         <Route
  path="/settings"
  element={
    <Settings
      staff={staff}
      onLogout={handleLogout}
      onStaffUpdate={handleStaffUpdate}
    />
  }
/>

          {/* QUICK PAYMENT DASHBOARD */}
          <Route
            path="/payments"
            element={<PaymentDashboard />}
          />

          {/* STUDENT PAYMENT HISTORY */}
          <Route
            path="/students/:id/payments"
            element={<Payments />}
          />

        </Route>

        {/* UNKNOWN PAGE */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;