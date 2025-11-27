/**
 * Booking Page Component
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC Flow: [Step_1_Service] -> [Step_2_DateTime] -> [Step_3_Customer_Info]
 *            -> [Submit_Booking] -> [Show_Confirmation]
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * STLC: [BookingPage_Component]
 * - 3-step booking flow
 * - Form validation at each step
 * - Submit booking via POST /api/bookings
 */
function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedService = location.state?.selectedService;

  // STLC: [State_Current_Step] -> Track booking progress (1-3)
  const [currentStep, setCurrentStep] = useState(1);

  // STLC: [State_Services] -> All available services
  const [services, setServices] = useState([]);

  // STLC: [State_Booking_Data] -> Accumulated booking information
  const [bookingData, setBookingData] = useState({
    serviceId: selectedService?.id || '',
    date: '',
    time: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });

  // STLC: [State_Form_Errors] -> Validation errors
  const [errors, setErrors] = useState({});

  // STLC: [State_Submitting] -> Submission in progress
  const [submitting, setSubmitting] = useState(false);

  // STLC: [State_Success] -> Booking confirmation
  const [success, setSuccess] = useState(false);

  // STLC: [Effect_Fetch_Services] -> Load services if not passed via navigation
  useEffect(() => {
    if (!selectedService) {
      fetchServices();
    }
  }, []);

  /**
   * STLC: [Fetch_Services] -> GET /api/services
   */
  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  /**
   * STLC: [Validate_Step] -> Validation logic for each step
   */
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // STLC: [Validate_Service_Selected]
      if (!bookingData.serviceId) {
        newErrors.serviceId = 'Please select a service';
      }
    } else if (step === 2) {
      // STLC: [Validate_Date]
      if (!bookingData.date) {
        newErrors.date = 'Please select a date';
      } else {
        const selectedDate = new Date(bookingData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.date = 'Please select a future date';
        }
      }

      // STLC: [Validate_Time]
      if (!bookingData.time) {
        newErrors.time = 'Please select a time';
      }
    } else if (step === 3) {
      // STLC: [Validate_Customer_Name]
      if (!bookingData.customerName || bookingData.customerName.trim().length < 2) {
        newErrors.customerName = 'Name must be at least 2 characters';
      }

      // STLC: [Validate_Customer_Email]
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!bookingData.customerEmail || !emailRegex.test(bookingData.customerEmail)) {
        newErrors.customerEmail = 'Please enter a valid email';
      }

      // STLC: [Validate_Customer_Phone]
      if (!bookingData.customerPhone || bookingData.customerPhone.trim().length < 10) {
        newErrors.customerPhone = 'Phone number must be at least 10 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * STLC: [Handle_Next_Step] -> Move to next step with validation
   */
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * STLC: [Handle_Previous_Step] -> Go back to previous step
   */
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  /**
   * STLC: [Handle_Submit_Booking] -> POST /api/bookings
   * - Validate all fields
   * - Submit to API
   * - on_success: Show confirmation
   * - on_fail: Show error
   */
  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      // STLC: [HTTP_POST_Booking]
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (!response.ok) {
        // STLC: [Handle_API_Error]
        throw new Error(data.error || 'Failed to create booking');
      }

      // STLC: [Show_Success_State]
      setSuccess(true);

    } catch (err) {
      console.error('Error creating booking:', err);
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * STLC: [Render_Success_Confirmation]
   */
  if (success) {
    const selectedSvc = services.find(s => s.id === bookingData.serviceId) || selectedService;
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <div className="text-left bg-white rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Booking Details:</h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Service:</span> {selectedSvc?.name}</p>
              <p><span className="font-medium">Date:</span> {bookingData.date}</p>
              <p><span className="font-medium">Time:</span> {bookingData.time}</p>
              <p><span className="font-medium">Name:</span> {bookingData.customerName}</p>
              <p><span className="font-medium">Email:</span> {bookingData.customerEmail}</p>
              <p><span className="font-medium">Phone:</span> {bookingData.customerPhone}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  const selectedSvc = services.find(s => s.id === bookingData.serviceId) || selectedService;

  /**
   * STLC: [Render_Booking_Form] -> Multi-step form
   */
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Appointment</h1>
        <p className="text-gray-600">Complete the following steps to confirm your booking</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-20 h-1 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* STLC: [Step_1_Service_Selection] */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Select Service</h2>
            {selectedService ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900">{selectedService.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{selectedService.description}</p>
                <div className="flex justify-between mt-3 text-sm">
                  <span>{selectedService.duration} min</span>
                  <span className="font-bold">${selectedService.price.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="service"
                      value={service.id}
                      checked={bookingData.serviceId === service.id}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, serviceId: Number(e.target.value) })
                      }
                      className="mr-3"
                    />
                    <div className="flex-grow">
                      <div className="font-semibold">{service.name}</div>
                      <div className="text-sm text-gray-600">{service.description}</div>
                      <div className="text-sm mt-1">
                        {service.duration} min - ${service.price.toFixed(2)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.serviceId && (
              <p className="text-red-600 text-sm mt-2">{errors.serviceId}</p>
            )}
          </div>
        )}

        {/* STLC: [Step_2_DateTime_Selection] */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Step 2: Select Date & Time
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Date
                </label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Time
                </label>
                <input
                  type="time"
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.time && <p className="text-red-600 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STLC: [Step_3_Customer_Information] */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Step 3: Your Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={bookingData.customerName}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, customerName: e.target.value })
                  }
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.customerName && (
                  <p className="text-red-600 text-sm mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={bookingData.customerEmail}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, customerEmail: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.customerEmail && (
                  <p className="text-red-600 text-sm mt-1">{errors.customerEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={bookingData.customerPhone}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, customerPhone: e.target.value })
                  }
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.customerPhone && (
                  <p className="text-red-600 text-sm mt-1">{errors.customerPhone}</p>
                )}
              </div>
            </div>
            {errors.submit && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-md font-medium ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-6 py-2 rounded-md font-medium ${
                submitting
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {submitting ? 'Submitting...' : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
