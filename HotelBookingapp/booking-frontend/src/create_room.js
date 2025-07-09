import { showAlert, getCsrfToken } from './api.js';

export async function createRoom(roomData) {
    try {
        const csrfToken = await getCsrfToken();
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
            throw new Error('Authentication token not found');
        }
        
        // If roomData is already a FormData object, use it directly
        const formData = roomData instanceof FormData ? roomData : new FormData();
        
        // If roomData is a regular object, append its fields to formData
        if (!(roomData instanceof FormData)) {
            // Append all fields to formData
            Object.keys(roomData).forEach(key => {
                if (key !== 'image' && roomData[key] !== undefined && roomData[key] !== null) {
                    formData.append(key, roomData[key]);
                }
            });
            
            // Append image file if it exists
            if (roomData.image) {
                formData.append('image', roomData.image);
            }
        }

        const response = await fetch('http://localhost:8000/api/admin/rooms', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-XSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            throw new Error(errorData.message || `Failed to create room: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating room:', error);
        throw error;
    }
}

export function renderRoomForm() {
    return `
        <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">Add New Room</h2>
            </div>
            <div class="px-4 py-5 sm:p-6">
                <form id="createRoomForm" class="space-y-6">
                    <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <!-- Room Number -->
                        <div class="sm:col-span-2">
                            <label for="room_no" class="block text-sm font-medium text-gray-700">Room Number *</label>
                            <input type="text" name="room_no" id="room_no" required
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>

                        <!-- Room Type -->
                        <div class="sm:col-span-2">
                            <label for="room_type" class="block text-sm font-medium text-gray-700">Room Type *</label>
                            <select id="room_type" name="room_type" required
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="">Select a type</option>
                                <option value="Single">Single</option>
                                <option value="Double">Double</option>
                                <option value="Deluxe">Deluxe</option>
                                <option value="Suite">Suite</option>
                            </select>
                        </div>

                        <!-- Bed Count -->
                        <div class="sm:col-span-2">
                            <label for="bed_count" class="block text-sm font-medium text-gray-700">Bed Count *</label>
                            <input type="number" name="bed_count" id="bed_count" min="1" required
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>

                        <!-- Price per Night -->
                        <div class="sm:col-span-2">
                            <label for="price_perNight" class="block text-sm font-medium text-gray-700">Price per Night ($) *</label>
                            <input type="number" name="price_perNight" id="price_perNight" min="0" step="0.01" required
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>

                        <!-- Max Occupancy -->
                        <div class="sm:col-span-2">
                            <label for="max_occupancy" class="block text-sm font-medium text-gray-700">Max Occupancy *</label>
                            <input type="number" name="max_occupancy" id="max_occupancy" min="1" required
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        </div>

                        <!-- Availability -->
                        <div class="sm:col-span-2">
                            <label for="is_available" class="block text-sm font-medium text-gray-700">Availability *</label>
                            <select id="is_available" name="is_available" required
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="1">Available</option>
                                <option value="0">Unavailable</option>
                            </select>
                        </div>

                        <!-- Features -->
                        <div class="sm:col-span-6">
                            <label for="features" class="block text-sm font-medium text-gray-700">Features (comma separated)</label>
                            <input type="text" name="features" id="features"
                                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="e.g., WiFi, TV, AC, Mini Bar">
                        </div>

                        <!-- Image Upload -->
                        <div class="sm:col-span-6">
                            <label class="block text-sm font-medium text-gray-700">Room Image</label>
                            <div class="mt-1 flex items-center">
                                <input type="file" id="room_image" name="image" accept="image/jpeg,image/png,image/jpg"
                                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                            </div>
                            <p class="mt-1 text-xs text-gray-500">JPG, PNG up to 2MB</p>
                        </div>
                    </div>

                    <div class="flex justify-end">
                        <button type="submit"
                            class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Create Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

export function initializeRoomForm() {
    const form = document.getElementById('createRoomForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const roomData = {
            room_no: formData.get('room_no'),
            room_type: formData.get('room_type'),
            bed_count: formData.get('bed_count'),
            price_perNight: formData.get('price_perNight'),
            max_occupancy: formData.get('max_occupancy'),
            is_available: formData.get('is_available') === '1',
            features: formData.get('features') || '',
            image: document.getElementById('room_image').files[0] || null
        };

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Creating...';
            
            const newRoom = await createRoom(roomData);
            showAlert('Room created successfully!', 'success');
            form.reset();
            
            // Optional: Refresh the rooms list or redirect
            // window.location.reload();
        } catch (error) {
            console.error('Error creating room:', error);
            showAlert(error.message || 'Failed to create room', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}
