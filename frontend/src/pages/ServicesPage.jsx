/**
 * Services Page Component
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC Flow: [Page_Load] -> [Fetch_Services_API] -> [Render_Services_List]
 *            -> [User_Select_Service] -> [Navigate_To_Booking]
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * STLC: [ServicesPage_Component]
 * - Fetch services from GET /api/services
 * - Display services in card layout
 * - Navigate to booking on selection
 */
function ServicesPage() {
  // STLC: [State_Services] -> Store fetched services
  const [services, setServices] = useState([]);
  // STLC: [State_Loading] -> Loading indicator
  const [loading, setLoading] = useState(true);
  // STLC: [State_Error] -> Error message
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // STLC: [Effect_Fetch_Services] -> Fetch on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  /**
   * STLC: [Fetch_Services_API]
   * - operation: HTTP_GET
   * - endpoint: /api/services
   * - on_success: [Set_Services_State]
   * - on_fail: [Set_Error_State]
   */
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      // STLC: [HTTP_Request] -> GET /api/services
      const response = await fetch(`${API_BASE_URL}/services`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch services`);
      }

      // STLC: [Parse_JSON_Response]
      const data = await response.json();

      // STLC: [Set_Services_State] -> Update state with services
      setServices(data);
    } catch (err) {
      // STLC: [Set_Error_State] -> Display error to user
      console.error('Error fetching services:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * STLC: [Handle_Service_Select]
   * - Navigate to booking page with selected service
   */
  const handleSelectService = (service) => {
    // STLC: [Navigate_To_Booking] -> Pass service via state
    navigate('/booking', { state: { selectedService: service } });
  };

  // STLC: [Render_Loading_State]
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  // STLC: [Render_Error_State]
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Services</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchServices}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // STLC: [Render_Services_List]
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Massage Services</h1>
        <p className="text-gray-600">Choose a service to book your appointment</p>
      </div>

      {/* STLC: [Services_Grid] -> Display services in card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="p-6">
              {/* Service Name */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {service.name}
              </h3>

              {/* Service Description */}
              <p className="text-gray-600 mb-4 text-sm">
                {service.description}
              </p>

              {/* Service Details */}
              <div className="flex justify-between items-center mb-4 text-sm">
                <div className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {service.duration} min
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ${service.price.toFixed(2)}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => handleSelectService(service)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* STLC: [Empty_State] -> No services available */}
      {services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No services available at the moment.</p>
        </div>
      )}
    </div>
  );
}

export default ServicesPage;
