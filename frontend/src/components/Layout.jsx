/**
 * Layout Component
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC: [Layout_Component] -> [Header] + [Main_Content] + [Footer]
 */

import { Link } from 'react-router-dom';

/**
 * STLC: [Layout_Component]
 * - Header with navigation
 * - Main content area (children)
 * - Footer
 */
function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* STLC: [Header] -> Navigation bar */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo/Brand */}
              <Link
                to="/"
                className="flex items-center text-xl font-bold text-gray-900 hover:text-gray-700"
              >
                💆 Massage Shop
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Services
              </Link>
              <Link
                to="/admin/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* STLC: [Main_Content] -> Page content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* STLC: [Footer] -> Simple footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Massage Shop. Demo application built with STLC specifications.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
