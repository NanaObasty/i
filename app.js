// Replace these with your actual Supabase details
const SUPABASE_URL = 'https://bvzfdaboxrchrpmaxuht.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2emZkYWJveHJjaHJwbWF4dWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Njc2MTAsImV4cCI6MjA5MDE0MzYxMH0.HZ2_pFb7UcUFYulMx0liyu8WCDRS1oY20fyBphsjQ-c';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const adGrid = document.getElementById('ad-grid');

// 1. Function to Fetch Ads from Database
async function fetchAds() {
    const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching ads:', error);
        return;
    }

    displayAds(data);
}

// 2. Function to Display Ads in HTML
function displayAds(ads) {
    adGrid.innerHTML = ''; // Clear loading message

    if (ads.length === 0) {
        adGrid.innerHTML = '<p>No items for sale yet. Be the first!</p>';
        return;
    }

    ads.forEach(ad => {
        const adCard = `
            <div class="ad-card">
                <img src="${ad.image_url || 'https://via.placeholder.com/150'}" alt="${ad.title}">
                <div class="ad-info">
                    <h3>${ad.title}</h3>
                    <p class="price">GH₵ ${ad.price}</p>
                    <p class="category">${ad.category}</p>
                    <button onclick="viewDetails('${ad.id}')">View Details</button>
                </div>
            </div>
        `;
        adGrid.insertAdjacentHTML('beforeend', adCard);
    });
}

// Start the app
fetchAds();
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');

// This function filters the ads based on user input
function filterAds() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = filterCategory.value;

    const cards = document.querySelectorAll('.ad-card');

    cards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        const category = card.querySelector('.category').innerText;

        const matchesSearch = title.includes(searchTerm);
        const matchesCategory = selectedCategory === "All" || category === selectedCategory;

        if (matchesSearch && matchesCategory) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// Run the filter function whenever the user types or changes the dropdown
searchInput.addEventListener('input', filterAds);
filterCategory.addEventListener('change', filterAds);
