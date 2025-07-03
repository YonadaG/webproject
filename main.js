// // 
// document.addEventListener('DOMContentLoaded', function() {
//     // --- Code for the mobile navigation toggle (from hero section) ---
//     const navMenuToggle = document.getElementById('navMenuToggle');
//     const navWrapper = document.getElementById('navWrapper');

//     if (navMenuToggle && navWrapper) { // Add checks if these elements might not always be present
//         navMenuToggle.addEventListener('click', (event) => {
//             event.stopPropagation();
//             navWrapper.classList.toggle('active');
//             if (navWrapper.classList.contains('active')) {
//                 document.body.style.overflow = 'hidden';
//             } else {
//                 document.body.style.overflow = '';
//             }
//         });

//         const mobileNavLinks = document.querySelectorAll('#navWrapper .nav-links a, #navWrapper .login-button');
//         mobileNavLinks.forEach(link => {
//             link.addEventListener('click', () => {
//                 if (navWrapper.classList.contains('active')) {
//                     navWrapper.classList.remove('active');
//                     document.body.style.overflow = '';
//                 }
//             });
//         });

//         document.addEventListener('click', (event) => {
//             if (!navWrapper.contains(event.target) && !navMenuToggle.contains(event.target)) {
//                 if (navWrapper.classList.contains('active')) {
//                     navWrapper.classList.remove('active');
//                     document.body.style.overflow = '';
//                 }
//             }
//         });
//     }


//     // --- Code for the Room Details Modal (if you add its HTML) ---
//     // const roomModalOverlay = document.getElementById('roomModalOverlay');
//     // const modalCloseButton = document.getElementById('modalClose');
//     // ... (rest of your room modal code here)
//     // You MUST add the HTML for these elements if you want this code to run.


//     // --- Code for the Booking Form Modal (from show-panel immersive) ---
//     const bookNowBtn = document.getElementById('bookNowBtn');
//     const modalOverlay = document.getElementById('modalOverlay');
//     const infoPanel = document.getElementById('infoPanel');
//     const closeModalBtn = document.getElementById('closeModalBtn');
//     const bookingForm = document.getElementById('bookingForm');

//     // Ensure all elements exist before adding listeners
//     if (bookNowBtn && modalOverlay && infoPanel && closeModalBtn && bookingForm) {
//         function showModal() {
//             modalOverlay.classList.add('active');
//             document.body.style.overflow = 'hidden';
//         }

//         function hideModal() {
//             modalOverlay.classList.remove('active');
//             document.body.style.overflow = '';
//         }

//         bookNowBtn.addEventListener('click', showModal);
//         closeModalBtn.addEventListener('click', hideModal);

//         modalOverlay.addEventListener('click', (event) => {
//             if (event.target === modalOverlay) {
//                 hideModal();
//             }
//         });

//         document.addEventListener('keydown', (event) => {
//             if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
//                 hideModal();
//             }
//         });

//         bookingForm.addEventListener('submit', (event) => {
//             event.preventDefault();

//             const formData = {
//                 name: document.getElementById('name').value,
//                 email: document.getElementById('email').value,
//                 phone: document.getElementById('phone').value,
//                 passport: document.getElementById('passport').value,
//                 address: document.getElementById('address').value,
//                 roomType: document.getElementById('roomType').value
//                 // date data left out
//             };

//             console.log('Form Submitted:', formData);
//             hideModal();
//             // TODO: Replace alert with a custom message box UI
//             // Example: showCustomMessageBox('Booking submitted successfully!');
//             alert('Booking submitted successfully!');
//         });
//     } else {
//         console.error("One or more booking form elements not found. Check IDs: bookNowBtn, modalOverlay, infoPanel, closeModalBtn, bookingForm.");
//     }
// });
// Get references to the toggle button and the mobile navigation wrapper


// ...
document.addEventListener('DOMContentLoaded', function() {
    // --- Code for the mobile navigation toggle (from hero section) ---
    const navMenuToggle = document.getElementById('navMenuToggle');
    const navWrapper = document.getElementById('navWrapper');

    if (navMenuToggle && navWrapper) {
        navMenuToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            navWrapper.classList.toggle('active');
            if (navWrapper.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        const mobileNavLinks = document.querySelectorAll('#navWrapper .nav-links a, #navWrapper .login-button');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navWrapper.classList.contains('active')) {
                    navWrapper.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        document.addEventListener('click', (event) => {
            if (!navWrapper.contains(event.target) && !navMenuToggle.contains(event.target)) {
                if (navWrapper.classList.contains('active')) {
                    navWrapper.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }

    // --- Code for the Room Details Modal ---
    const roomModalOverlay = document.getElementById('roomModalOverlay');
    const modalCloseButton = document.getElementById('modalClose');
    const roomCardTriggers = document.querySelectorAll('.room-card');
    const modalRoomName = document.getElementById('modalRoomName');
    const modalRoomImage = document.getElementById('modalRoomImage');
    const modalRoomType = document.getElementById('modalRoomType');
    const modalRoomPrice = document.getElementById('modalRoomPrice');
    const modalRoomAvailable = document.getElementById('modalRoomAvailable');

    function openRoomModal(event) {
        const clickedCard = event.currentTarget;
        const name = clickedCard.dataset.roomName || 'N/A';
        const type = clickedCard.dataset.roomType || 'N/A';
        const price = clickedCard.dataset.roomPrice || 'N/A';
        const available = clickedCard.dataset.roomAvailable || 'N/A';
        const image = clickedCard.dataset.roomImage || '';
        modalRoomName.textContent = name;
        modalRoomImage.src = image;
        modalRoomImage.alt = name;
        modalRoomType.textContent = type;
        modalRoomPrice.textContent = `$${price}`;
        modalRoomAvailable.textContent = available;
        roomModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeRoomModal() {
        roomModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (roomCardTriggers.length > 0) {
        roomCardTriggers.forEach(card => {
            card.addEventListener('click', openRoomModal);
        });
    }

    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', closeRoomModal);
    }

    if (roomModalOverlay) {
        roomModalOverlay.addEventListener('click', function(event) {
            if (event.target === roomModalOverlay) {
                closeRoomModal();
            }
        });
    }

    // --- Code for the Booking Form Modal ---
    const bookNowBtn = document.getElementById('bookNowBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const infoPanel = document.getElementById('infoPanel');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const bookingForm = document.getElementById('bookingForm');

    if (bookNowBtn && modalOverlay && infoPanel && closeModalBtn && bookingForm) {
        function showModal() {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function hideModal() {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        bookNowBtn.addEventListener('click', showModal);
        closeModalBtn.addEventListener('click', hideModal);

        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                hideModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
                hideModal();
            }
        });

        bookingForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                passport: document.getElementById('passport').value,
                address: document.getElementById('address').value,
                roomType: document.getElementById('roomType').value
                // date data left out
            };
            console.log('Form Submitted:', formData);
            hideModal();
            alert('Booking submitted successfully!');
        });
    } else {
        console.error("One or more booking form elements not found. Check IDs: bookNowBtn, modalOverlay, infoPanel, closeModalBtn, bookingForm.");
    }
});
// ...existing code...