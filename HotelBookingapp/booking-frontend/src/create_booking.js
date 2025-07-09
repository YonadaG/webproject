// Import API utilities
import { getCsrfToken, API_BASE_URL, showAlert } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('createBookingForm');
    const submitBtn = form?.querySelector('button[type="submit"]');
    const errorContainer = document.getElementById('errorContainer');
    
    if (!form) {
        console.error('Form not found');
        return;
    }

    // Get room_id and guest_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room_id');
    const guestId = urlParams.get('guest_id');

    // Validate required parameters
    if (!roomId || !guestId) {
        errorContainer.innerHTML = `
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p class="font-bold">Error</p>
                <p>Missing required parameters. Please start the booking process again.</p>
            </div>
        `;
        return;
    }

    // Set min date for check-in to today
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const checkInInput = document.getElementById('check_in_date');
    const checkOutInput = document.getElementById('check_out_date');
    
    // Set initial min date for check-in (today)
    checkInInput.min = formatDate(today);
    
    // Update check-out date when check-in date changes
    checkInInput.addEventListener('change', function() {
        // Enable check-out date only after check-in is selected
        checkOutInput.disabled = !this.value;
        
        // Set min check-out date to day after check-in
        if (this.value) {
            const nextDay = new Date(this.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkOutInput.min = formatDate(nextDay);
            
            // Reset check-out date if it's before the new check-in date
            if (checkOutInput.value && new Date(checkOutInput.value) <= new Date(this.value)) {
                checkOutInput.value = '';
            }
            
            // Update helper text
            document.querySelector('#check_out_date + .text-xs').textContent = 'Select check-out date';
        } else {
            checkOutInput.disabled = true;
            checkOutInput.value = '';
            document.querySelector('#check_out_date + .text-xs').textContent = 'Select check-in date first';
        }
    });
    
    // Set guest ID in the hidden field
    const guestIdInput = document.getElementById('guest_id');
    if (guestIdInput) {
        guestIdInput.value = guestId;
    } else {
        console.error('Guest ID input field not found');
    }
    
    // Set room ID in the hidden field
    const roomIdInput = document.getElementById('room_id');
    if (roomIdInput) {
        roomIdInput.value = roomId;
    } else {
        console.error('Room ID input field not found');
    }

    // Fetch room details and store the room data
    try {
        const roomResponse = await fetch(`${API_BASE_URL}api/rooms/${roomId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
        });

        if (roomResponse.ok) {
            const room = await roomResponse.json();
            document.getElementById('room_id_display').value = room.room_number || `Room #${roomId}`;
            
            // Store the room data including price_per_night
            window.currentRoomData = room;
            console.log('Room data loaded:', room);
            
            // Debug: Check price_perNight value and type
            if (room.price_perNight !== undefined) {
                console.log('price_perNight value:', room.price_perNight, 'type:', typeof room.price_perNight);
            } else {
                console.warn('price_perNight is undefined in room data');
            }
            // Set maximum number of guests based on room capacity
            const guestsInput = document.getElementById('number_of_guests');
            guestsInput.max = room.capacity || 4; // Default to 4 if capacity is not set
            guestsInput.placeholder = `1-${room.capacity || 4} guests`;
            guestsInput.nextElementSibling.textContent = `Maximum: ${room.capacity || 4} guests`;
        } else {
            throw new Error('Failed to load room information');
        }
    } catch (error) {
        console.error('Error loading room data:', error);
        errorContainer.innerHTML = `
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p class="font-bold">Error</p>
                <p>${error.message || 'Failed to load room information. Please try again.'}</p>
            </div>
        `;
        form.style.opacity = '0.5';
        form.querySelectorAll('input, button').forEach(el => el.disabled = true);
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Booking form submission started');
        
        // Disable submit button and show loading state
        submitBtn.disabled = true;
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        
        // Clear previous errors
        errorContainer.innerHTML = '';
        
        try {
            // Get form data and ensure all required fields are included
            if (!window.currentRoomData) {
                throw new Error('Room data not loaded. Please refresh the page and try again.');
            }

            // Format dates to YYYY-MM-DD to match Laravel's expected format
            const formatDate = (dateString) => {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    throw new Error('Invalid date format');
                }
                return date.toISOString().split('T')[0];
            };

            const formDataObj = {
                room_id: roomId,
                guest_id: guestId,
                check_in_date: formatDate(form.check_in_date.value),
                check_out_date: formatDate(form.check_out_date.value),
                number_of_guests: parseInt(form.number_of_guests.value, 10),
                price: parseFloat(window.currentRoomData.price_perNight)
            };
            
            // Validate price
            if (isNaN(formDataObj.price)) {
                throw new Error('Invalid room price. Please try again.');
            }
            
            // Ensure check-out date is after check-in date
            const checkInDate = new Date(formDataObj.check_in_date);
            const checkOutDate = new Date(formDataObj.check_out_date);
            if (checkOutDate <= checkInDate) {
                throw new Error('Check-out date must be after check-in date');
            }

            console.log('Booking form data:', formDataObj);
            
            // Get CSRF token
            const csrfToken = await getCsrfToken();
            
            // Make the API request
            const response = await fetch(`${API_BASE_URL}api/booking`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(formDataObj)
            });
            
            console.log('Booking response status:', response.status);
            
            let data;
            try {
                data = await response.json();
                console.log('Booking response data:', data);
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                throw new Error('Invalid response from server');
            }
            
            if (!response.ok) {
                const errorMsg = data.message || data.error || `HTTP error! status: ${response.status}`;
                throw new Error(errorMsg);
            }
            
            // Show success message and redirect
            showAlert('Booking created successfully!', 'success');
            
            // Redirect to booking details or dashboard
            setTimeout(() => {
                window.location.href = `booking-details.html?booking_id=${data.id}`;
            }, 1500);
            
        } catch (error) {
            console.error('Error creating booking:', error);
            
            // Show error message to user
            errorContainer.innerHTML = `
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p class="font-bold">Error</p>
                    <p>${error.message || 'Failed to create booking. Please try again.'}</p>
                </div>
            `;
            
            // Scroll to error message
            errorContainer.scrollIntoView({ behavior: 'smooth' });
            
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
});
