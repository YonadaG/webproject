import { getCurrentUser } from './api.js';

/**
 * Fetches bookings from the server with enhanced logging
 * @returns {Promise<Array>} - Array of booking objects
 */
export async function fetchBookings() {
    const logPrefix = '[Bookings]';
    console.group(`${logPrefix} fetchBookings`);
    
    try {
        // Check authentication
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error(`${logPrefix} No authentication token found`);
            window.location.href = 'admin-login.html';
            return [];
        }

        console.log(`${logPrefix} Initiating fetch request to bookings endpoint`);
        const startTime = performance.now();
        
        const response = await fetch('http://localhost:8000/api/admin/bookings', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
        });

        const requestDuration = (performance.now() - startTime).toFixed(2);
        console.log(`${logPrefix} Request completed in ${requestDuration}ms`, {
            status: response.status,
            statusText: response.statusText,
            url: response.url
        });

        // Handle unauthorized response
        if (response.status === 401) {
            console.warn(`${logPrefix} Authentication failed - redirecting to login`);
            localStorage.removeItem('authToken');
            window.location.href = 'admin-login.html';
            return [];
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`${logPrefix} Server responded with error:`, {
                status: response.status,
                statusText: response.statusText,
                response: errorText
            });
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse and validate response
        let data;
        try {
            data = await response.json();
            console.log(`${logPrefix} Successfully parsed response data`, {
                itemCount: Array.isArray(data) ? data.length : 'invalid',
                dataType: Array.isArray(data) ? 'array' : typeof data,
                sample: Array.isArray(data) && data.length > 0 ? data[0] : 'N/A'
            });
        } catch (parseError) {
            console.error(`${logPrefix} Failed to parse JSON response:`, parseError);
            throw new Error('Invalid response format from server');
        }

        // Ensure we return an array
        const result = Array.isArray(data) ? data : [];
        console.log(`${logPrefix} Returning ${result.length} bookings`);
        return result;
        
    } catch (error) {
        console.error(`${logPrefix} Error in fetchBookings:`, {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        throw error;
    } finally {
        console.groupEnd();
    }
}

/**
 * Renders bookings into HTML with enhanced logging
 * @param {Array} bookings - Array of booking objects
 * @returns {string} - HTML string
 */
export function renderBookings(bookings) {
    const logPrefix = '[Bookings]';
    console.group(`${logPrefix} renderBookings`);
    
    try {
        // Input validation and empty state
        if (!Array.isArray(bookings)) {
            console.warn(`${logPrefix} Invalid bookings data:`, bookings);
            return renderError('Invalid bookings data');
        }

        if (bookings.length === 0) {
            console.log(`${logPrefix} No bookings to render`);
            return `
                <div class="text-center py-12">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
                    <p class="mt-1 text-sm text-gray-500">Get started by creating a new booking.</p>
                </div>
            `;
        }

        console.log(`${logPrefix} Rendering ${bookings.length} bookings`);
        
        // Log sample data for debugging
        if (bookings.length > 0) {
            console.log(`${logPrefix} Sample booking data:`, {
                firstBooking: bookings[0],
                lastBooking: bookings[bookings.length - 1],
                statuses: [...new Set(bookings.map(b => b.status))]
            });
        }

        const html = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" class="relative px-6 py-3">
                                <span class="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${bookings.map(booking => {
                            console.log(`${logPrefix} Rendering booking:`, booking.id);
                            return `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.id || 'N/A'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">${booking.guest_name || 'N/A'}</div>
                                        <div class="text-sm text-gray-500">${booking.guest_email || ''}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900">${booking.room_type || 'N/A'}</div>
                                        <div class="text-sm text-gray-500">${booking.room_number ? `Room ${booking.room_number}` : ''}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${booking.check_in ? new Date(booking.check_in).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${booking.check_out ? new Date(booking.check_out).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${(booking.status || '').toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                              (booking.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-gray-100 text-gray-800'}">
                                            ${booking.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href="#" class="text-indigo-600 hover:text-indigo-900 mr-4">View</a>
                                        <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        console.log(`${logPrefix} Successfully generated HTML for ${bookings.length} bookings`);
        return html;
        
    } catch (error) {
        console.error(`${logPrefix} Error in renderBookings:`, {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        return renderError('An error occurred while displaying bookings');
    } finally {
        console.groupEnd();
    }
}

export function renderError() {
    return `
        <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Error loading bookings</h3>
            <p class="mt-1 text-sm text-gray-500">Please try again later.</p>
        </div>
    `;
};
