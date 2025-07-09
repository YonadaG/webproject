// Import API utilities
import { getCsrfToken, API_BASE_URL } from './api.js';

// Simple alert function
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 p-4 rounded-md z-50 ${
        type === 'success' ? 'bg-green-100 text-green-800' : 
        type === 'error' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
    }`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}



document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('createGuestForm');
    const submitBtn = form?.querySelector('button[type="submit"]');
    const errorContainer = document.getElementById('errorContainer');
    
    if (!form) {
        console.error('Form not found');
        return;
    }

    // Get room ID from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room_id');
    
    // Add room ID to form if present
    if (roomId) {
        let roomIdInput = form.querySelector('input[name="room_id"]');
        if (!roomIdInput) {
            roomIdInput = document.createElement('input');
            roomIdInput.type = 'hidden';
            roomIdInput.name = 'room_id';
            form.appendChild(roomIdInput);
        }
        roomIdInput.value = roomId;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submission started');
        
        // Disable submit button and show loading state
        submitBtn.disabled = true;
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creating...';
        
        // Clear previous errors
        errorContainer.innerHTML = '';
        
        try {
            // Get form data
            const formData = new FormData(form);
            const formDataObj = {};
            formData.forEach((value, key) => {
                formDataObj[key] = value;
            });
            
            console.log('Form data:', formDataObj);
            
            // Get CSRF token
            const csrfToken = await getCsrfToken();
            console.log('CSRF Token:', csrfToken);
            
            // Make the API request
            const response = await fetch(`${API_BASE_URL}api/guests`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(formDataObj)
            });
            
            console.log('Response status:', response.status);
            
            let data;
            try {
                data = await response.json();
                console.log('Response data:', data);
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                throw new Error('Invalid response from server');
            }
            
            if (!response.ok) {
                const errorMsg = data.message || data.error || `HTTP error! status: ${response.status}`;
                throw new Error(errorMsg);
            }
            
            // Show success message and redirect to booking form
            showAlert('Guest created successfully! Redirecting to booking form...', 'success');
            
            // Redirect to booking form with guest_id and room_id
            setTimeout(() => {
                window.location.href = `create-booking.html?room_id=${roomId}&guest_id=${data.id}`;
            }, 1500);
            
        } catch (error) {
            console.error('Error creating guest:', error);
            
            // Show error message to user
            errorContainer.innerHTML = `
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p class="font-bold">Error</p>
                    <p>${error.message || 'Failed to create guest. Please try again.'}</p>
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
