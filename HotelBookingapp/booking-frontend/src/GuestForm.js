// GuestForm.js
import { getCsrfToken, API_BASE_URL, getAuthToken } from './api.js';

// Standalone guest creation logic
export async function submitGuestForm(e, onGuestRegistered, setError, setIsSubmitting) {
  e.preventDefault();
  setError && setError(null);
  setIsSubmitting && setIsSubmitting(true);

  try {
    const form = e.target;
    const formData = new FormData(form);
    
    // Log form data for debugging
    console.log('Submitting guest form with data:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value, `(type: ${typeof value})`);
    }
    
    // Get CSRF token and auth token
    const csrfToken = await getCsrfToken();
    const authToken = getAuthToken();
    
    if (!authToken) {
      window.location.href = 'login.html';
      return;
    }

    // Create request data
    const requestData = new FormData();
    
    // Add form fields
    const guestData = {
      first_name: formData.get('first_name')?.trim() || '',
      last_name: formData.get('last_name')?.trim() || '',
      email: formData.get('email')?.trim() || '',
      phone_number: formData.get('phone_number')?.trim() || '',
      address: formData.get('address')?.trim() || '',
      national_id_or_passport: formData.get('national_id_or_passport')?.trim() || ''
    };
    
    // Append all fields to FormData
    Object.entries(guestData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        requestData.append(key, value);
      }
    });
    
    // Log the data being sent
    console.log('Submitting guest form with data:');
    for (let [key, value] of requestData.entries()) {
      console.log(`${key}:`, value, `(type: ${typeof value})`);
    }
    
    const response = await fetch(`${API_BASE_URL}api/guests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-XSRF-TOKEN': csrfToken,
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: requestData
    });
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      throw new Error('Invalid response from server');
    }
    
    if (!response.ok) {
      console.error('Guest registration failed:', responseData);
      const errorMessage = responseData.message || 
                          responseData.error || 
                          'Registration failed. Please check your information and try again.';
      throw new Error(errorMessage);
    }
    
    console.log('Guest registration successful:', responseData);
    
    if (typeof onGuestRegistered === 'function') {
      onGuestRegistered(responseData);
    }
    
    return responseData;
  } catch (error) {
    console.error('Error in guest registration:', error);
    const errorMessage = error.message || 'Registration failed. Please try again.';
    setError && setError(errorMessage);
    throw error;
  } finally {
    setIsSubmitting && setIsSubmitting(false);
  }
}


function GuestForm({ room, onGuestRegistered, onCancel }) {
  // Simple error and loading state (not React)
  let error = '';
  let isSubmitting = false;
  let errorDisplay = '';
  let submitButtonText = 'Register';

  // Attach the submit handler after the form is rendered
  setTimeout(() => {
    const form = document.getElementById('guestForm');
    if (form && !form._handlerAttached) {
      form.addEventListener('submit', (e) => submitGuestForm(e, onGuestRegistered,
        (msg) => { error = msg; document.getElementById('guestFormError').innerHTML = msg ? `<div class=\"mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4\" role=\"alert\"><p>${msg}</p></div>` : ''; },
        (val) => { isSubmitting = val; form.querySelector('button[type="submit"]').disabled = !!val; }
      ));
      form._handlerAttached = true;
    }
  }, 0);

  return `
    <div class="guest-form-container">
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900">Book Room #${room.room_no} - ${room.room_type}</h3>
          <button onclick="${onCancel}" class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div id="guestFormError">${errorDisplay}</div>
        <form id="guestForm">
          <div class="grid grid-cols-1 gap-4 mb-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="first_name" class="block text-sm font-medium text-gray-700">First Name *</label>
                <input type="text" name="first_name" id="first_name" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
              </div>
              <div>
                <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name *</label>
                <input type="text" name="last_name" id="last_name" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
              </div>
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
              <input type="email" name="email" id="email" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
            </div>
            <div>
              <label for="phone_number" class="block text-sm font-medium text-gray-700">Phone Number *</label>
              <input type="tel" name="phone_number" id="phone_number" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
            </div>
            <div>
              <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" name="address" id="address"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
            </div>
            <div>
              <label for="national_id_or_passport" class="block text-sm font-medium text-gray-700">National ID/Passport</label>
              <input type="text" name="national_id_or_passport" id="national_id_or_passport"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" onclick="${onCancel}"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              ${submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
`;
}

window.GuestForm = GuestForm;
