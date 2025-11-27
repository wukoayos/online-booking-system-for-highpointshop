/**
 * Admin Login Page Component
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC Flow: [Page_Load] -> [User_Enter_Password] -> [Submit_Login]
 *            -> [Store_Auth_Token] -> [Navigate_To_Dashboard]
 *
 * ⚠️ WARNING: This is a DEMO-ONLY authentication mechanism.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * STLC: [AdminLoginPage_Component]
 * - Simple password-based login (demo only)
 * - Store auth token in localStorage
 * - Navigate to dashboard on success
 */
function AdminLoginPage() {
  const navigate = useNavigate();

  // STLC: [State_Password] -> User input
  const [password, setPassword] = useState('');

  // STLC: [State_Error] -> Login error message
  const [error, setError] = useState('');

  // STLC: [State_Loading] -> Submission in progress
  const [loading, setLoading] = useState(false);

  /**
   * STLC: [Handle_Submit_Login] -> POST /api/admin/login
   * - on_success: Store token, navigate to dashboard
   * - on_fail: Show error message
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // STLC: [HTTP_POST_Login]
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        // STLC: [Handle_Login_Error]
        throw new Error(data.error || 'Login failed');
      }

      // STLC: [Store_Auth_Token] -> Demo: Store password as token
      // In production, this would store a JWT token
      localStorage.setItem('adminToken', password);

      // STLC: [Navigate_To_Dashboard]
      navigate('/admin/dashboard');

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * STLC: [Render_Login_Form]
   */
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600 text-sm">Enter your admin password to continue</p>
        </div>

        {/* Demo Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
          <p className="text-yellow-800 text-xs">
            <strong>Demo Mode:</strong> This is not secure for production use.
            Default password: <code className="bg-yellow-100 px-1 rounded">demo123</code>
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !password}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              loading || !password
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Services
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
