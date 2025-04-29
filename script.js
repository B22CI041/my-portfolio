document.addEventListener('DOMContentLoaded', function() {

    // --- Get Modal Elements ---
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const modalMediumEl = document.getElementById("modalMedium");
    const modalYearEl = document.getElementById("modalYear");
    const likeButton = document.querySelector(".like-button");
    const likeIcon = likeButton?.querySelector("i"); // Icon inside the like button
    const closeModal = document.querySelector(".close-button");
    const imageContainer = document.querySelector(".modal-image-container");
    // const likeCountEl = document.querySelector(".like-count"); // Uncomment if using like count

    // Safety check if modal elements don't exist
    if (!modal || !modalImg || !modalTitle || !modalDescription || !modalMediumEl || !modalYearEl || !closeModal || !imageContainer) {
        console.error("One or more modal elements were not found in the DOM!");
        return; // Stop script execution if essential elements are missing
    }

    // --- Get All Portfolio Images ---
    const portfolioImages = document.querySelectorAll(
        '#category1 .card img, #category2 .card img, #category3 .card img, #category3 .card-style-3 img'
    );

    // --- Like Button Logic ---

    // Function to update the like button's appearance based on liked status
    function updateLikeButtonVisuals(liked) {
        if (!likeButton || !likeIcon) return; // Safety check

        if (liked) {
            likeButton.classList.add('liked');
            likeIcon.classList.remove('fa-regular'); // Use regular heart class
            likeIcon.classList.add('fa-solid');     // Use solid heart class
            likeButton.setAttribute('aria-label', 'Unlike this artwork');
        } else {
            likeButton.classList.remove('liked');
            likeIcon.classList.remove('fa-solid');   // Use solid heart class
            likeIcon.classList.add('fa-regular');  // Use regular heart class
            likeButton.setAttribute('aria-label', 'Like this artwork');
        }
        // Optional: Update like count display
        // if (likeCountEl) { likeCountEl.textContent = liked ? '1' : '0'; }
    }

    // Attach click listener TO the like button itself
    if (likeButton) {
        likeButton.onclick = function() {
            const artworkId = modalImg.src; // Get ID of currently shown image from its src
            if (!artworkId) return; // Exit if no image source

            // Check current state FROM localStorage
            let isCurrentlyLiked = localStorage.getItem(artworkId) === 'true';

            // Toggle the state
            let newLikedState = !isCurrentlyLiked;

            // Update localStorage
            localStorage.setItem(artworkId, newLikedState);

            // Update the button's visuals
            updateLikeButtonVisuals(newLikedState);
        };
    }

    // --- Portfolio Image Click Logic ---

    // Add click event listener to each portfolio image
    portfolioImages.forEach(img => {
        // Check if the image element itself exists
        if (!img) {
            console.warn("A potential portfolio image target was null.");
            return; // Skip this iteration if img is null
        }

        img.style.cursor = 'pointer';

        img.onclick = function() { // 'this' refers to the clicked img element
            // --- Find Details from Card ---
            let card = this.closest('.card, .card-style-3'); // Find parent card
            let overlay = card?.querySelector('.card-overlay'); // Find overlay within the card

            // Check if overlay exists before trying to get children
            let title = overlay?.querySelector('h3')?.textContent || "Artwork";
            let description = overlay?.querySelector('p')?.textContent || "";

            // Get data attributes from the clicked image
            let medium = this.dataset.medium || "";
            let year = this.dataset.year || "";
            const artworkId = this.src; // Use image src as a unique key for likes

            // --- Handle Image Loading & Orientation ---
            // Define what happens AFTER the modal image has loaded its source
            modalImg.onload = function() {
                // Compare natural dimensions for orientation
                const isLandscape = modalImg.naturalWidth > modalImg.naturalHeight;

                // Add or remove the padding class on the CONTAINER
                if (isLandscape) {
                    imageContainer.classList.add('landscape-padding');
                } else {
                    imageContainer.classList.remove('landscape-padding');
                }
            };
            // Handle image loading errors
            modalImg.onerror = function() {
                 console.error("Modal image failed to load:", modalImg.src);
                 if (imageContainer) { // Ensure container exists before modifying classList
                    imageContainer.classList.remove('landscape-padding'); // Remove padding on error
                 }
            };

            // --- Populate Modal Content ---
            modalTitle.textContent = title;
            modalDescription.textContent = description;
            modalImg.alt = title;

            // Populate Metadata elements
            modalMediumEl.textContent = medium; // Set medium text
            modalYearEl.textContent = year;   // Set year text
            // Add separator class ONLY if both medium and year exist and are not empty
            if (medium && year) {
                 modalYearEl.classList.add('with-separator');
            } else {
                 modalYearEl.classList.remove('with-separator');
            }

            // --- Set Initial Like Button State ---
            let isLiked = localStorage.getItem(artworkId) === 'true';
            updateLikeButtonVisuals(isLiked);

            // --- Prepare Modal Display ---
            // Reset scroll position of details container
            const detailsContainer = document.querySelector('.modal-details-container');
            if (detailsContainer) detailsContainer.scrollTop = 0;

            // *** Set the image source LAST - this triggers the loading ***
            modalImg.src = this.src;

            // Show the modal AFTER setting src
            modal.style.display = "flex";
            document.body.classList.add('modal-open');

            // Remove landscape padding class immediately before onload might add it back
            imageContainer.classList.remove('landscape-padding');

        }; // End of img.onclick
    }); // End of portfolioImages.forEach

    // --- Modal Closing Logic ---

    // Function to close the modal
    function closeTheModal() {
        modal.style.display = "none";
        document.body.classList.remove('modal-open');

        // Clean up classes and potentially content
        if (imageContainer) {
             imageContainer.classList.remove('landscape-padding');
        }
        // Clear metadata text to prevent flash of old content
        modalMediumEl.textContent = "";
        modalYearEl.textContent = "";
        modalYearEl.classList.remove('with-separator');
        // Don't clear title/desc/img.src here usually, but you could if needed
        // modalTitle.textContent = "";
        // modalDescription.textContent = "";
        // modalImg.src = ""; // Setting src to "" can sometimes trigger onerror event
    }

    // Add click event listener to the close button
    closeModal.onclick = closeTheModal;

    // Add click event listener to close modal when clicking the OUTER overlay
    modal.onclick = function(event) {
        // Check if the click target is the modal overlay itself, not the content panel inside
        if (event.target === modal) {
            closeTheModal();
        }
    };

    // Add keyboard event listener to close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === "flex") {
            closeTheModal();
        }
    });

}); // End of DOMContentLoaded