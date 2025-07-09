import './index.css';
import { fetchRooms } from './fetch_rooms';
import { API_URL } from './fetch_rooms';

// Get the base URL for the API (remove /rooms from the rooms endpoint)
const API_BASE_URL = API_URL.replace('/rooms', '');
// Make API_BASE_URL available globally for components
window.API_BASE_URL = API_BASE_URL;

// Format price with commas
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Create room card HTML
function createRoomCard(room) {
  // Use image_url from API if available, otherwise fallback to default
  let imageUrl;
  if (room.image_url) {
    // If image_url is a full URL, use it as is
    if (room.image_url.startsWith('http')) {
      imageUrl = room.image_url;
    } 
    // If it's a path, prepend the backend URL
    else if (room.image_url.startsWith('/')) {
      imageUrl = `http://localhost:8000${room.image_url}`;
    }
    // Otherwise, use the default image
    else {
      imageUrl = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
    }
  } 
  // If we have an image path, construct the full URL
  else if (room.image) {
    const imagePath = room.image.startsWith('/') ? room.image : `/${room.image}`;
    imageUrl = `http://localhost:8000/storage${imagePath}`;
  } 
  // Fallback to default image
  else {
    imageUrl = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
  }

  // Format room type (capitalize first letter)
  const roomType = room.room_type ? room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1) : 'Room';
  
  // Handle features (treat as string or array)
  let features = room.features || '';
  if (typeof features === 'string' && features.trim().startsWith('[')) {
    try {
      features = JSON.parse(features);
    } catch (e) {
      features = [features];
    }
  } else if (typeof features === 'string') {
    features = [features];
  }
  if (Array.isArray(features)) {
    features = features.join(', ');
  }

  // Create features list if available
  let featuresHtml = '';
  if (features) {
    // Convert features to array if it's a string
    let featuresArray = [];
    if (typeof features === 'string') {
      try {
        // Try to parse as JSON array first
        featuresArray = JSON.parse(features);
      } catch (e) {
        // If not JSON, split by comma or newline
        featuresArray = features.split(/[,\n]/).map(f => f.trim()).filter(Boolean);
      }
    } else if (Array.isArray(features)) {
      featuresArray = features;
    }

    if (featuresArray.length > 0) {
      featuresHtml = `
        <div class="mt-4">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Room Features:</h4>
          <ul class="grid grid-cols-2 gap-2 text-sm text-gray-600">
            ${featuresArray.slice(0, 4).map(feature => `
              <li class="flex items-center">
                <svg class="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="truncate">${feature}</span>
              </li>
            `).join('')}
          </ul>
        </div>`;
    }
  }

  return `
    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div class="h-48 overflow-hidden">
        <img src="${imageUrl}" alt="${room.type}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
      </div>
      <div class="p-6 flex-1 flex flex-col">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">${roomType} ${room.room_no ? `#${room.room_no}` : ''}</h3>
            <p class="text-gray-500 mt-1">${room.max_occupancy} ${room.max_occupancy > 1 ? 'Guests' : 'Guest'}</p>
          </div>
          <span class="text-lg font-bold text-blue-600">${formatPrice(room.price_perNight || 0)}<span class="text-sm font-normal text-gray-500">/night</span></span>
        </div>
        
        <div class="mt-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${room.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
            ${room.is_available ? 'Available' : 'Booked'}
          </span>
        </div>
        
        <p class="mt-3 text-gray-600 flex-1">${room.features || 'Experience comfort and luxury in our well-appointed room.'}</p>
        
        ${featuresHtml}
        
        <div class="mt-6 pt-4 border-t border-gray-100">
          <a 
            href="create-guest.html?room_id=${room.id}"
            class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Book Now
          </a>
        </div>
      </div>
    </div>
  `;
}

let allRooms = [];

// Filter rooms based on search query
function filterRooms(query) {
  if (!query) {
    renderRooms(allRooms);
    return;
  }
  
  const filtered = allRooms.filter(room => {
    const queryLower = query.toLowerCase();
    return (
      (room.room_type && room.room_type.toLowerCase().includes(queryLower)) ||
      (room.features && room.features.toString().toLowerCase().includes(queryLower)) ||
      (room.room_no && room.room_no.toString() === query) ||
      (room.max_occupancy && room.max_occupancy.toString() === query)
    );
  });
  
  renderRooms(filtered);
}

// Load rooms from API
async function loadRooms() {
  const container = document.getElementById('rooms-container');
  if (!container) {
    console.error('Rooms container not found');
    return;
  }
  
  try {
    console.log('Fetching rooms...');
    const rooms = await fetchRooms();
    console.log('Rooms fetched successfully:', rooms);
    
    if (!Array.isArray(rooms)) {
      throw new Error('Invalid rooms data format: expected an array');
    }
    
    allRooms = rooms;
    console.log('Rendering', allRooms.length, 'rooms');
    renderRooms(allRooms);
  } catch (error) {
    console.error('Error in loadRooms:', error);
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">Something went wrong</h3>
        <p class="text-gray-600">${error.message || 'We couldn\'t load the rooms. Please try again later.'}</p>
        <div class="mt-4 space-y-2">
          <button 
            onclick="window.location.reload()" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retry
          </button>
          <button 
            onclick="console.log('All rooms:', allRooms); console.log('Error:', '${error.message}');" 
            class="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Show Debug Info
          </button>
        </div>
      </div>
    `;
  }
}

// Render rooms in the container
function renderRooms(rooms) {
  const container = document.getElementById('rooms-container');
  if (!container) return;
  
  if (!rooms || rooms.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">No rooms found</h3>
        <p class="mt-1 text-gray-500">We couldn't find any rooms matching your criteria.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = rooms.map(createRoomCard).join('');
  
  // Add event listeners to all book now buttons
  document.querySelectorAll('[data-room-id]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const roomId = e.currentTarget.getAttribute('data-room-id');
      const room = allRooms.find(r => r.id.toString() === roomId);
      if (room) {
        showGuestForm(room);
      }
    });
  });
}

// Function to handle booking submission
async function handleBooking(guestData) {
  try {
    const response = await fetch(`${API_BASE_URL}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
      },
      body: JSON.stringify(guestData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create booking');
    }

    // Show success message
    alert('Booking successful! Thank you for your reservation.');
    // Reload the page to show updated booking status
    window.location.reload();
  } catch (error) {
    console.error('Booking error:', error);
    alert(`Booking failed: ${error.message}`);
  }
}

// Function to show booking form (second step)
function showBookingForm(room, guest) {
  const formContainer = document.createElement('div');
  formContainer.id = 'booking-form-container';
  
  const onBack = `{
    const container = document.getElementById('booking-form-container');
    if (container) container.remove();
    showGuestForm(room);
  }`;
  
  const onBookingComplete = `(bookingData) => {
    alert('Booking successful! Your booking reference is: ' + bookingData.booking_reference);
    const container = document.getElementById('booking-form-container');
    if (container) container.remove();
    // Reload rooms to show updated availability
    loadRooms();
  }`;
  
  formContainer.innerHTML = window.BookingForm({ 
    room, 
    guest,
    onBack: `(${onBack})();`,
    onBookingComplete: onBookingComplete
  });
  
  document.body.appendChild(formContainer);
}

// Function to show guest form (first step)
function showGuestForm(room) {
  // Remove any existing forms
  const existingForm = document.getElementById('guest-form-container');
  if (existingForm) existingForm.remove();
  
  const formContainer = document.createElement('div');
  formContainer.id = 'guest-form-container';
  
  // Create a safe room object for JSON stringification
  const safeRoom = {
    id: room.id,
    room_no: room.room_no,
    room_type: room.room_type,
    price_perNight: room.price_perNight
  };
  
  // Create the form with proper event handlers
  formContainer.innerHTML = `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900">Guest Registration</h3>
          <button id="cancelGuestForm" class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
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
            <button type="button" id="cancelBtn"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Add event listeners after the form is rendered
  setTimeout(() => {
    const form = formContainer.querySelector('#guestForm');
    const cancelBtn = formContainer.querySelector('#cancelBtn');
    const closeBtn = formContainer.querySelector('#cancelGuestForm');
    
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const guestData = {
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          email: formData.get('email'),
          phone_number: formData.get('phone_number'),
          address: formData.get('address') || null,
          national_id_or_passport: formData.get('national_id_or_passport') || null
        };
        
        console.log('Submitting guest data:', guestData);
        
        try {
          const response = await fetch('http://localhost:8000/api/guests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify(guestData),
            credentials: 'include'
          });

          const data = await response.json();
          console.log('API Response:', data);
          
          if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
          }
          
          // Remove the guest form
          formContainer.remove();
          
          // Show the booking form with the registered guest
          showBookingForm(room, data);
          
        } catch (error) {
          console.error('Registration error:', error);
          alert(`Registration failed: ${error.message}`);
        }
      };
    }
    
    // Handle cancel/close buttons
    const removeForm = () => formContainer.remove();
    if (cancelBtn) cancelBtn.onclick = removeForm;
    if (closeBtn) closeBtn.onclick = removeForm;
    
  }, 0);
  
  document.body.appendChild(formContainer);
}

// Make functions available globally
window.showGuestForm = showGuestForm;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Search functionality
  const searchInput = document.getElementById('search-bar');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterRooms(e.target.value.trim());
    });
  }
  
  // Load rooms
  loadRooms();
  
  // Mobile menu toggle
  const mobileMenuButton = document.querySelector('[aria-controls="mobile-menu"]');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true' || false;
      this.setAttribute('aria-expanded', !expanded);
      mobileMenu.classList.toggle('hidden');
    });
  }
});
