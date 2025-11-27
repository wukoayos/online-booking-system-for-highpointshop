/**
 * Main App Component
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC Flow: [App_Entry] -> [Router_Setup] -> [Route_Matching]
 *            -> [Component_Render]
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ServicesPage from './pages/ServicesPage';
import BookingPage from './pages/BookingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

/**
 * STLC: [App_Entry] -> Main application entry point
 *
 * Routes:
 * - / : Services list (homepage)
 * - /booking : 3-step booking flow
 * - /admin/login : Admin authentication
 * - /admin/dashboard : Admin bookings view
 */
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* STLC: [Route_Services] -> Customer services list */}
          <Route path="/" element={<ServicesPage />} />

          {/* STLC: [Route_Booking] -> 3-step booking flow */}
          <Route path="/booking" element={<BookingPage />} />

          {/* STLC: [Route_Admin_Login] -> Admin authentication */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* STLC: [Route_Admin_Dashboard] -> Admin bookings view */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
