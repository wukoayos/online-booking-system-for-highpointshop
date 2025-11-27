/**
 * Admin Dashboard Page Component
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC Flow: [Check_Auth] -> [Fetch_Bookings_API] -> [Render_Bookings_Table]
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScheduleTimeline from '../components/ScheduleTimeline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * STLC: [AdminDashboardPage_Component]
 * - Check authentication
 * - Fetch all bookings via GET /api/admin/bookings
 * - Display in table format
 * - Logout functionality
 */
function AdminDashboardPage() {
  const navigate = useNavigate();

  // STLC: [State_Bookings] -> All bookings data
  const [bookings, setBookings] = useState([]);

  // STLC: [State_Loading] -> Loading indicator
  const [loading, setLoading] = useState(true);

  // STLC: [State_Error] -> Error message
  const [error, setError] = useState(null);

  // STLC: [Effect_Check_Auth_And_Fetch] -> On mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      // STLC: [Redirect_To_Login] -> No auth token
      navigate('/admin/login');
      return;
    }

    fetchBookings(token);
  }, [navigate]);

  /**
   * STLC: [Fetch_Bookings_API] -> GET /api/admin/bookings
   * - Include Authorization header
   * - on_success: Display bookings
   * - on_fail: Show error or redirect to login
   */
  const fetchBookings = async (token) => {
    try {
      setLoading(true);
      setError(null);

      // STLC: [HTTP_GET_Admin_Bookings]
      const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // STLC: [Handle_Unauthorized] -> Invalid/expired token
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch bookings`);
      }

      // STLC: [Parse_JSON_Response]
      const data = await response.json();

      // STLC: [Set_Bookings_State]
      setBookings(data.bookings || []);

    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * STLC: [Handle_Logout]
   * - Clear auth token
   * - Navigate to login
   */
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  /**
   * STLC: [Format_Date] -> Display helper
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * STLC: [Format_DateTime] -> Display helper
   */
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // STLC: [Render_Loading_State]
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载预订信息中...</p>
        </div>
      </div>
    );
  }

  // STLC: [Render_Error_State]
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">加载预订信息失败</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => fetchBookings(localStorage.getItem('adminToken'))}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  /**
   * STLC: [Render_Dashboard]
   */
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理后台</h1>
          <p className="text-gray-600">管理所有客户预订</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          退出登录
        </button>
      </div>

      {/* Schedule Timeline */}
      <ScheduleTimeline />

      {/* Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-800 font-semibold text-sm">总预订数</p>
            <p className="text-3xl font-bold text-blue-900">{bookings.length}</p>
          </div>
          <div className="text-blue-600 text-4xl">📅</div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {bookings.length === 0 ? (
          // STLC: [Empty_State]
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">暂无预订</p>
            <p className="text-gray-400 text-sm mt-2">
              客户预订后将在此处显示
            </p>
          </div>
        ) : (
          // STLC: [Render_Bookings_Table]
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    编号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    服务项目
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    联系方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    预订时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    价格
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.serviceName}</div>
                      <div className="text-sm text-gray-500">{booking.duration} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                      <div className="text-sm text-gray-500">{booking.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{booking.customerEmail}</div>
                      <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(booking.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${booking.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
