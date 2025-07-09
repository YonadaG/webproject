import { showAlert, getAuthToken, getCsrfToken } from './api.js';
import { fetchRooms as fetchRoomsAPI, API_URL as ROOMS_API_URL } from './fetch_rooms.js';
import { createRoom } from './create_room.js';

// API Base URL - Note: Don't include 'api' here as it's already in the endpoints
const API_BASE_URL = 'http://localhost:8000';

// Room Management State
let currentRoomId = null;

// Initialize Room Management Module
export function initRoomManagement() {
    // Check authentication
    const token = getAuthToken();
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Initialize the room list
    renderRoomList();
    
    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Add room button
    const addRoomBtn = document.getElementById('addRoomBtn');
    if (addRoomBtn) {
        addRoomBtn.addEventListener('click', () => showRoomForm());
    }
    
    // Modal close button
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('roomFormModal').classList.add('hidden');
        });
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('roomFormModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
    
    // Handle edit/delete room actions (delegated events)
    document.addEventListener('click', (e) => {
        // Edit room button
        if (e.target.closest('.edit-room')) {
            e.preventDefault();
            const roomId = e.target.closest('.edit-room').dataset.id;
            showRoomForm(roomId);
        }
        
        // Delete room button
        if (e.target.closest('.delete-room')) {
            e.preventDefault();
            const roomId = e.target.closest('.delete-room').dataset.id;
            deleteRoom(roomId);
        }
        
        // Back to list button
        if (e.target.closest('#backToList')) {
            e.preventDefault();
            renderRoomList();
        }
    });
    
    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            window.location.href = 'admin-login.html';
        });
    }
}

// Logging utility function
function logOperation(operation, data = {}, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        operation,
        ...data,
        userAgent: navigator.userAgent,
        path: window.location.pathname
    };

    // Log to console with appropriate level
    const logMethod = console[level] || console.log;
    logMethod(`[${timestamp}] ${operation.toUpperCase()}`, logEntry);

    // In a production environment, you might want to send this to a logging service
    // Example: sendToLoggingService(logEntry);
}

// Fetch rooms from API with authentication
async function fetchRooms() {
    const operation = 'fetch_rooms';
    logOperation(operation, { action: 'start' });
    
    try {
        // Use the enhanced fetchRoomsAPI function which handles auth and errors
        const rooms = await fetchRoomsAPI();
        logOperation(operation, { 
            action: 'success',
            count: rooms.length,
            roomIds: rooms.map(r => r.id)
        });
        return rooms;
    } catch (error) {
        logOperation(operation, {
            action: 'error',
            error: error.message,
            stack: error.stack
        }, 'error');
        console.error('Error loading rooms:', error);
        showAlert('Failed to load rooms. Please try again later.', 'error');
        return [];
    }
}

// Render Room Management Section
// function renderRoomManagement() {
//     roomManagementSection.innerHTML = `
//         <div class="bg-white shadow overflow-hidden sm:rounded-lg">
//             <div class="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
//                 <h2 class="text-lg font-medium text-gray-900">Room Management</h2>
//                 <button id="addRoomBtn" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
//                     Add New Room
//                 </button>
//             </div>
//             <div id="roomList">
//                 <!-- Room list will be rendered here -->
//             </div>
//         </div>
//     `;
    
//     // Add event listeners
//     document.getElementById('addRoomBtn')?.addEventListener('click', () => showRoomForm());
    
//     // Initial render
//     renderRoomList();
// }

// Render Room List
async function renderRoomList() {
    const roomList = document.getElementById('roomList');
    if (!roomList) return;
    
    // Show loading state
    roomList.innerHTML = `
        <div class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span class="ml-3">Loading rooms...</span>
        </div>
    `;
    
    try {
        const rooms = await fetchRooms();
        
        if (rooms.length === 0) {
            roomList.innerHTML = `
                <div class="text-center py-12">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No rooms found</h3>
                    <p class="mt-1 text-sm text-gray-500">Get started by adding a new room.</p>
                </div>
            `;
            return;
        }
        
        // Generate the rooms table
        roomList.innerHTML = generateRoomsTable(rooms);
        
    } catch (error) {
        console.error('Error rendering rooms:', error);
        roomList.innerHTML = `
            <div class="rounded-md bg-red-50 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">
                            Failed to load rooms
                        </h3>
                        <div class="mt-2 text-sm text-red-700">
                            <p>${error.message || 'An unknown error occurred'}</p>
                        </div>
                        <div class="mt-4">
                            <button onclick="window.location.reload()" class="text-sm font-medium text-red-800 hover:text-red-600">
                                Try again <span aria-hidden="true">&rarr;</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Generate rooms table HTML
function generateRoomsTable(rooms) {
    return `
        <div class="flex flex-col">
            <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Room Number
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Room Type
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price/Night
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Max Occupancy
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" class="relative px-6 py-3">
                                        <span class="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${rooms.map(room => `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="flex-shrink-0 h-10 w-10">
                                                    ${room.image_url ? `
                                                        <img class="h-10 w-10 rounded-full object-cover" src="${room.image_url}" alt="Room ${room.room_no}">
                                                    ` : `
                                                        <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </div>
                                                    `}
                                                </div>
                                                <div class="ml-4">
                                                    <div class="text-sm font-medium text-gray-900">Room ${room.room_no || 'N/A'}</div>
                                                    <div class="text-sm text-gray-500">ID: ${room.id || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">${room.room_type || 'Standard'}</div>
                                            <div class="text-sm text-gray-500">${room.bed_count || '1'} bed(s)</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">$${room.price_perNight || '0.00'}</div>
                                            <div class="text-sm text-gray-500">per night</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">${room.max_occupancy || '1'}</div>
                                            <div class="text-sm text-gray-500">max guests</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${room.is_available === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                                ${room.is_available === '1' ? 'Available' : 'Booked'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button class="text-indigo-600 hover:text-indigo-900 mr-4 edit-room" data-id="${room.id}">Edit</button>
                                            <button class="text-red-600 hover:text-red-900 delete-room" data-id="${room.id}">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show Room Form
async function showRoomForm(roomId = null) {
    const modal = document.getElementById('roomFormModal');
    const formContainer = document.getElementById('roomFormContainer');
    
    if (!modal || !formContainer) return;
    
    // Show loading state
    formContainer.innerHTML = `
        <div class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span class="ml-3">Loading room data...</span>
        </div>
    `;
    
    // Show the modal
    modal.classList.remove('hidden');
    
    try {
        let room = null;
        
        // If roomId is provided, fetch the room details
        if (roomId) {
            const token = getAuthToken();
            if (!token) {
                window.location.href = 'admin-login.html';
                return;
            }
            
            console.log('Fetching room details for ID:', roomId);
            const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                mode: 'cors'
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = 'admin-login.html';
                    return;
                }
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to fetch room details: ${response.status} ${response.statusText}`);
            }
            
            room = await response.json();
            console.log('Fetched room data:', room);
            
            // Debug: Log the room type and image URL
            console.log('Room type:', room.room_type, 'Image URL:', room.image_url);
        } else {
            console.log('Creating new room form');
        }
        
        // Render the form with room data (or empty for new room)
        formContainer.innerHTML = renderRoomForm(room);
        
        // If we have room data, make sure the form is pre-filled
        if (room) {
            // Set the room ID as a data attribute
            const form = document.getElementById('roomForm');
            if (form) {
                form.dataset.roomId = room.id;
            }
            
            // Ensure the room type dropdown is set correctly
            const roomTypeSelect = document.getElementById('room_type');
            if (roomTypeSelect) {
                // Convert room type to title case for comparison
                const roomTypeValue = room.room_type ? 
                    room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1).toLowerCase() : 
                    '';
                console.log('Setting room type to:', roomTypeValue);
                roomTypeSelect.value = roomTypeValue;
            }
            
            // Ensure the availability is set correctly
            const isAvailableSelect = document.getElementById('is_available');
            if (isAvailableSelect && room.is_available !== undefined) {
                isAvailableSelect.value = room.is_available === '1' || room.is_available === true ? '1' : '0';
            }
            
            // Ensure features are set correctly
            const featuresInput = document.getElementById('features');
            if (featuresInput && room.features) {
                featuresInput.value = room.features;
            }
        }
        
        // Initialize form event listeners
        initializeRoomForm(room);
        
        // Add event listener for remove image button
        const removeImageBtn = document.getElementById('removeImageBtn');
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', function() {
                const previewContainer = document.getElementById('imagePreviewContainer');
                const removeImageFlag = document.getElementById('removeImageFlag');
                
                if (confirm('Are you sure you want to remove this image?')) {
                    // Hide the preview and show the file input
                    previewContainer.style.display = 'none';
                    document.querySelector('input[name="image"]').value = '';
                    
                    // Set the flag to indicate the image should be removed
                    removeImageFlag.value = '1';
                    
                    // Show the file input more prominently
                    const fileInput = document.querySelector('input[name="image"]');
                    fileInput.classList.remove('hidden');
                    fileInput.required = true;
                }
            });
        }
        
    } catch (error) {
        console.error('Error loading room form:', error);
        formContainer.innerHTML = `
            <div class="rounded-md bg-red-50 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">
                            Failed to load room form
                        </h3>
                        <div class="mt-2 text-sm text-red-700">
                            <p>${error.message || 'An unknown error occurred'}</p>
                        </div>
                        <div class="mt-4">
                            <button onclick="window.location.reload()" class="text-sm font-medium text-red-800 hover:text-red-600">
                                Try again <span aria-hidden="true">&rarr;</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize Room Form
function initializeRoomForm(room = null) {
    // Handle form submission
    const form = document.getElementById('roomForm');
    if (form) {
        form.addEventListener('submit', handleRoomFormSubmit);
        
        // Set the room ID as a data attribute if editing
        if (room?.id) {
            form.dataset.roomId = room.id;
        }
    }
    
    // Handle cancel button
    const cancelBtn = document.getElementById('cancelFormBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('roomFormModal').classList.add('hidden');
        });
    }
    
    // Handle image preview
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('imagePreview');
                    if (preview) {
                        preview.src = event.target.result;
                        preview.classList.remove('hidden');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function renderRoomForm(room) {
    return `
        <div class="px-4 py-5 sm:p-6">
            <div class="mb-6 flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900">${room ? 'Edit Room' : 'Add New Room'}</h3>
                <button type="button" id="cancelFormBtn" class="text-sm text-gray-500 hover:text-gray-700">
                    Cancel
                </button>
            </div>
            <form id="roomForm" class="space-y-6">
                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <!-- Room Number -->
                    <div class="sm:col-span-2">
                        <label for="room_no" class="block text-sm font-medium text-gray-700">Room Number *</label>
                        <input type="text" name="room_no" id="room_no" required
                            value="${room?.room_no || ''}"
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>

                    <!-- Room Type -->
                    <div class="sm:col-span-2">
                        <label for="room_type" class="block text-sm font-medium text-gray-700">Room Type *</label>
                        <select id="room_type" name="room_type" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="">Select a type</option>
                            <option value="Single" ${room?.room_type === 'Single' ? 'selected' : ''}>Single</option>
                            <option value="Double" ${room?.room_type === 'Double' ? 'selected' : ''}>Double</option>
                            <option value="Deluxe" ${room?.room_type === 'Deluxe' ? 'selected' : ''}>Deluxe</option>
                            <option value="Suite" ${room?.room_type === 'Suite' ? 'selected' : ''}>Suite</option>
                        </select>
                    </div>

                    <!-- Bed Count -->
                    <div class="sm:col-span-2">
                        <label for="bed_count" class="block text-sm font-medium text-gray-700">Bed Count *</label>
                        <input type="number" name="bed_count" id="bed_count" min="1" required
                            value="${room?.bed_count || ''}"
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>

                    <!-- Price per Night -->
                    <div class="sm:col-span-2">
                        <label for="price_perNight" class="block text-sm font-medium text-gray-700">Price per Night ($) *</label>
                        <input type="number" name="price_perNight" id="price_perNight" min="0" step="0.01" required
                            value="${room?.price_perNight || ''}"
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>

                    <!-- Max Occupancy -->
                    <div class="sm:col-span-2">
                        <label for="max_occupancy" class="block text-sm font-medium text-gray-700">Max Occupancy *</label>
                        <input type="number" name="max_occupancy" id="max_occupancy" min="1" required
                            value="${room?.max_occupancy || ''}"
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>

                    <!-- Availability -->
                    <div class="sm:col-span-2">
                        <label for="is_available" class="block text-sm font-medium text-gray-700">Availability *</label>
                        <select id="is_available" name="is_available" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="1" ${room?.is_available ? 'selected' : ''}>Available</option>
                            <option value="0" ${!room?.is_available && room ? 'selected' : ''}>Unavailable</option>
                        </select>
                    </div>

                    <!-- Features -->
                    <div class="sm:col-span-6">
                        <label for="features" class="block text-sm font-medium text-gray-700">Features (comma separated)</label>
                        <input type="text" name="features" id="features"
                            value="${room?.features || ''}"
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="e.g., WiFi, TV, AC, Mini Bar">
                    </div>

                    <!-- Image Upload -->
                    <div class="sm:col-span-6">
                        <label class="block text-sm font-medium text-gray-700">Room Image</label>
                        ${room?.image_url || room?.image ? `
                            <div class="relative inline-block mt-2" id="imagePreviewContainer">
                                ${(() => {
                                    let imgUrl = room.image_url || room.image;
                                    // Ensure the URL is absolute
                                    if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:')) {
                                        // Remove leading slash if present to avoid double slashes
                                        imgUrl = imgUrl.startsWith('/') ? imgUrl.substring(1) : imgUrl;
                                        imgUrl = 'http://localhost:8000/' + imgUrl;
                                    }
                                    return `
                                        <img src="${imgUrl}" alt="Room" class="h-32 w-32 object-cover rounded" id="imagePreview">
                                        <button type="button" id="removeImageBtn" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <input type="hidden" name="remove_image" id="removeImageFlag" value="0">
                                    `;
                                })()}
                            </div>
                        ` : ''}
                        <div class="mt-1 flex items-center">
                            <input type="file" id="room_image" name="image" accept="image/jpeg,image/png,image/jpg"
                                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                        </div>
                        <p class="mt-1 text-xs text-gray-500">JPG, PNG up to 2MB</p>
                    </div>
                </div>

                <div class="flex justify-end space-x-4">
                    <button type="button" id="cancelRoomForm" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Cancel
                    </button>
                    <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        ${room ? 'Update Room' : 'Create Room'}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('backToList')?.addEventListener('click', () => renderRoomList());
    document.getElementById('cancelRoomForm')?.addEventListener('click', () => renderRoomList());
    
    const form = document.getElementById('roomForm');
    if (form) {
        form.addEventListener('submit', handleRoomFormSubmit);
    }
}

// Validate form fields
function validateRoomForm(formData) {
    const errors = [];
    const requiredFields = [
        'room_no',
        'room_type',
        'bed_count',
        'price_perNight',
        'max_occupancy',
        'is_available'
    ];

    // Check required fields
    requiredFields.forEach(field => {
        const value = formData.get(field);
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push(`The ${field.replace('_', ' ')} field is required`);
        }
    });

    // Validate number fields
    const numberFields = ['bed_count', 'price_perNight', 'max_occupancy'];
    numberFields.forEach(field => {
        const value = formData.get(field);
        if (value && isNaN(Number(value))) {
            errors.push(`The ${field.replace('_', ' ')} must be a valid number`);
        }
    });

    return errors;
}

// Handle Room Form Submission
async function handleRoomFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const roomId = form.dataset.roomId || null;
    const operation = roomId ? 'update_room' : 'create_room';
    
    // Get all checked amenities
    const amenities = [];
    document.querySelectorAll('input[name="amenities"]:checked').forEach(checkbox => {
        amenities.push(checkbox.value);
    });
    
    // Add amenities to form data
    if (amenities.length > 0) {
        formData.set('features', amenities.join(', '));
    }
    
    // Validate form
    const validationErrors = validateRoomForm(formData);
    if (validationErrors.length > 0) {
        showAlert(validationErrors.join('\n'), 'error');
        return;
    }
    
    logOperation(operation, {
        action: 'start',
        roomId: roomId || 'new',
        formData: Object.fromEntries(Array.from(formData.entries()).filter(([key]) => key !== 'image'))
    });
    
    try {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ${roomId ? 'Updating...' : 'Creating...'}
        `;
        
        // Prepare form data with expected backend fields
        const roomFormData = new FormData();
        
        // Get form values
        const roomNo = formData.get('room_no').trim();
        const roomType = formData.get('room_type');
        const bedCount = formData.get('bed_count');
        const pricePerNight = formData.get('price_perNight');
        const isAvailable = formData.get('is_available');
        const maxOccupancy = formData.get('max_occupancy');
        const features = formData.get('features') || '';
        
        // Add room data to form data with proper type conversion
        roomFormData.append('room_no', roomNo); // Keep as string for now
        roomFormData.append('room_type', roomType);
        roomFormData.append('bed_count', bedCount); // Keep as string for now
        roomFormData.append('price_perNight', pricePerNight); // Keep as string for now
        roomFormData.append('is_available', isAvailable === '1' ? '1' : '0');
        roomFormData.append('max_occupancy', maxOccupancy); // Keep as string for now
        roomFormData.append('features', features);
        
        // Handle image upload if a new file is selected
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            roomFormData.append('image', imageFile);
        }
        
        // Log the data being sent with types
        console.log('Submitting form data:');
        const formDataForLogging = {};
        for (let [key, value] of roomFormData.entries()) {
            console.log(`${key}:`, value, `(type: ${typeof value})`);
            formDataForLogging[key] = value;
        }
        
        logOperation('request_data', {
            action: 'sending',
            roomId: roomId || 'new',
            data: formDataForLogging,
            endpoint: roomId ? `PUT /api/admin/rooms/${roomId}` : 'POST /api/admin/rooms',
            userAgent: navigator.userAgent,
            path: window.location.pathname
        });
        
        let result;
        try {
            if (roomId) {
                result = await updateRoom(roomId, roomFormData);
                logOperation(operation, {
                    action: 'success',
                    roomId,
                    updatedFields: formData
                });
            } else {
                result = await createRoom(roomFormData);
                logOperation(operation, {
                    action: 'success',
                    roomId: result.id,
                    created: true
                });
            }
        } catch (error) {
            console.error('Error saving room data:', error);
            // Log the actual form data that was being sent
            console.error('Form data that caused the error:', formData);
            throw error; // Re-throw to be caught by the outer try-catch
        }
        
        // Show success message
        showAlert(`Room ${roomId ? 'updated' : 'created'} successfully!`, 'success');
        
        // Reset form and close modal on success
        form.reset();
        const modal = document.getElementById('roomFormModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Refresh room list
        await renderRoomList();
        
        return result;
        
    } catch (error) {
        logOperation(operation, {
            action: 'error',
            roomId: roomId || 'new',
            error: error.message,
            stack: error.stack
        }, 'error');
        console.error('Error saving room:', error);
        showAlert(`Failed to ${roomId ? 'update' : 'create'} room: ${error.message}`, 'error');
    } finally {
        // Reset button state
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = roomId ? 'Update Room' : 'Create Room';
        }
    }
}

// Create room functionality is imported from create_room.js

// Update Room
async function updateRoom(roomId, formData) {
    try {
        const csrfToken = await getCsrfToken();
        const authToken = getAuthToken();
        
        if (!authToken) {
            window.location.href = 'admin-login.html';
            return;
        }

        // If formData is not already FormData, convert it (should always be FormData in this flow)
        const requestData = formData instanceof FormData ? formData : new FormData();

        // Laravel compatibility: use POST with _method=PUT for FormData
        requestData.append('_method', 'PUT');

        // Handle remove_image flag if it exists (only for updates)
        const removeImageFlag = document.getElementById('removeImageFlag');
        if (removeImageFlag && removeImageFlag.value === '1') {
            requestData.append('remove_image', '1');
        }

        // Log the data being sent with types
        console.log('Updating room with form data:');
        for (let [key, value] of requestData.entries()) {
            console.log(`${key}:`, value, `(type: ${typeof value})`);
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/rooms/${roomId}`, {
            method: 'POST', 
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-XSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: requestData
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            throw new Error(errorData.message || `Failed to update room: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Room updated successfully:', result);
        showAlert('Room updated successfully!', 'success');
        return result;
        
    } catch (error) {
        console.error('Error updating room:', error);
        throw error;
    }
}

// Delete Room
async function deleteRoom(roomId) {
    const operation = 'delete_room';
    
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
        logOperation(operation, {
            action: 'cancelled',
            roomId
        });
        return;
    }
    
    logOperation(operation, {
        action: 'start',
        roomId
    });
    
    try {
        const token = getAuthToken();
        if (!token) {
            const error = new Error('Authentication token not found');
            logOperation(operation, {
                action: 'error',
                roomId,
                error: error.message
            }, 'error');
            window.location.href = 'admin-login.html';
            return;
        }
        
        const csrfToken = await getCsrfToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/rooms/${roomId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'admin-login.html';
                return;
            }
            
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || 'Failed to delete room');
            logOperation(operation, {
                action: 'error',
                roomId,
                status: response.status,
                error: error.message,
                response: errorData
            }, 'error');
            throw error;
        }

        logOperation(operation, {
            action: 'success',
            roomId,
            deletedAt: new Date().toISOString()
        });
        
        showAlert('Room deleted successfully!', 'success');
        renderRoomList();
    } catch (error) {
        logOperation(operation, {
            action: 'error',
            roomId,
            error: error.message,
            stack: error.stack
        }, 'error');
        console.error('Error deleting room:', error);
        showAlert(`Failed to delete room: ${error.message}`, 'error');
    }
}
