// BookingForm.js
import { api } from './api';

function BookingForm({ room, guest, onBookingComplete, onBack }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [submitButtonText, setSubmitButtonText] = React.useState('Book Now');
  const [errorDisplay, setErrorDisplay] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setSubmitButtonText('Booking...');
    
    try {
      const form = e.target;
      const formData = new FormData(form);
      
      const bookingData = {
        room_id: room.id,
        guest_id: guest.id,
        check_in_date: formData.get('check_in_date'),
        check_out_date: formData.get('check_out_date'),
        special_requests: formData.get('special_requests') || null,
        status: 'confirmed'
      };
      
      console.log('Submitting booking data:', bookingData);
      
      // Use the API utility which handles CSRF token automatically
      const data = await api.post('/bookings', bookingData);
      console.log('Booking API Response:', data);
      
      alert(`Booking successful! Your booking reference is: ${data.booking_reference || 'N/A'}`);
      
      if (typeof onBookingComplete === 'function') {
        onBookingComplete(data);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.message || 'Booking failed. Please try again.');
      setErrorDisplay(`<div class="mb-4 p-4 bg-red-50 rounded-md">
        <h4 class="font-medium text-red-800">Error</h4>
        <p class="text-sm text-red-700">${error.message}</p>
      </div>`);
    } finally {
      setIsSubmitting(false);
      setSubmitButtonText('Book Now');
    }
  };

  // Set default dates (tomorrow for check-in, day after for check-out)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  
  const formatDate = (date) => date.toISOString().split('T')[0];

  return `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900">Book Room #${room.room_no} - ${room.room_type}</h3>
          <button onclick="${onBack}" class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="mb-4 p-4 bg-blue-50 rounded-md">
          <h4 class="font-medium text-blue-800">Guest Information</h4>
          <p class="text-sm text-blue-700">
            ${guest.first_name} ${guest.last_name}<br>
            ${guest.email}<br>
            ${guest.phone_number}
          </p>
        </div>
        
        ${errorDisplay}
        
        <form id="bookingForm" onsubmit="event.preventDefault(); ${handleSubmit.toString().replace(/\n\s*/g, ' ')}">
          <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="check_in_date" class="block text-sm font-medium text-gray-700">Check-in Date *</label>
                <input type="date" name="check_in_date" id="check_in_date" required
                  min="${formatDate(tomorrow)}" value="${formatDate(tomorrow)}"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
              </div>
              <div>
                <label for="check_out" class="block text-sm font-medium text-gray-700">Check-out Date *</label>
                <input type="date" name="check_out" id="check_out" required
                  min="${formatDate(dayAfterTomorrow)}" value="${formatDate(dayAfterTomorrow)}"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
              </div>
            </div>
            
            <div>
              <label for="special_requests" class="block text-sm font-medium text-gray-700">Special Requests</label>
              <textarea name="special_requests" id="special_requests" rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"></textarea>
            </div>
          </div>
          
          <div class="flex justify-between">
            <button type="button" onclick="${onBack}"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Back
            </button>
            <button type="submit"
              disabled="${isSubmitting}"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              ${submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Make the function available globally
window.BookingForm = BookingForm;
