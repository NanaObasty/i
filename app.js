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
            <div class="ad-card" id="ad-${ad.id}">
                <img src="${ad.image_url || 'https://via.placeholder.com/150'}" alt="${ad.title}">
                <div class="ad-info">
                    <h3>${ad.title}</h3>
                    <p class="price">GH₵ ${ad.price}</p>
                    <p class="category">${ad.category}</p>
                    <button class="delete-btn" onclick="deleteAd('${ad.id}')">Delete</button>
                </div>
            </div>
            ads.forEach(ad => {
    const adCard = `
        <div class="ad-card">
            <div class="image-container">
                <img 
                    src="${ad.image_url}" 
                    alt="${ad.title}" 
                    loading="lazy" 
                    decoding="async"
                    onclick="openImage('${ad.image_url}')"
                >
                <span class="time-badge">${timeAgo(ad.created_at)}</span>
            </div>
            </div>
    `;
    adGrid.insertAdjacentHTML('beforeend', adCard);
});
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
async function deleteAd(id) {
    const confirmation = confirm("Are you sure you want to delete this ad?");
    if (!confirmation) return;

    const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

    if (error) {
        alert("Error deleting ad: " + error.message);
    } else {
        alert("Ad deleted successfully!");
        // Remove the card from the screen immediately
        document.getElementById(`ad-${id}`).remove();
    }
}
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const loginNavBtn = document.getElementById('loginNavBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmailSpan = document.getElementById('userEmail');
async function registerAsSeller() {
    const user = supabase.auth.user();
    if (!user) return showNotification("Please login first!", "error");

    const shopName = document.getElementById('shopName').value;
    const phone = document.getElementById('sellerPhone').value;
    const bio = document.getElementById('shopDesc').value;

    const { error } = await supabase
        .from('profiles')
        .update({ 
            is_seller: true, 
            shop_name: shopName, 
            phone_number: phone,
            bio: bio 
        })
        .eq('id', user.id);

    if (error) {
        showNotification("Registration failed!", "error");
    } else {
        showNotification("You are now a Verified Seller! ✅", "success");
        // Hide the registration form and show the "Post Ad" button
        document.getElementById('seller-registration').style.display = 'none';
        document.getElementById('post-ad-btn').style.display = 'block';
    }
}
async function syncProfileData() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // 1. Get Google metadata
        const fullName = user.user_metadata.full_name;
        const avatarUrl = user.user_metadata.avatar_url;
        const email = user.email;

        // 2. Update the HTML elements we created
        document.getElementById('user-name').innerText = fullName || "Marketplace User";
        document.getElementById('user-email').innerText = email;
        
        const avatarImg = document.getElementById('user-avatar');
        if (avatarUrl) {
            avatarImg.src = avatarUrl;
        }

        // 3. Hide the "Login" button and show "Logout"
        console.log("User synced:", fullName);
    } else {
        // Reset to guest if no one is logged in
        document.getElementById('user-name').innerText = "Guest User";
        document.getElementById('user-avatar').src = "https://via.placeholder.com/100";
    }
}
async function updateSellerUI() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_seller, shop_name')
        .eq('id', user.id)
        .single();

    const promoCard = document.getElementById('seller-promo');

    if (profile && profile.is_seller) {
        // Change the look for existing sellers
        promoCard.style.background = "var(--card-bg)";
        promoCard.style.border = "1px solid #00b53f";
        promoCard.innerHTML = `
            <h3 style="color: var(--text-color)">Shop: ${profile.shop_name}</h3>
            <p style="color: #666">You are a Verified Seller ✅</p>
            <button onclick="showMyAds()" style="background: #00b53f; color: white;">Manage My Ads</button>
        `;
    }
}
// Call this function inside your window.onload
window.onload = () => {
    syncProfileData();
    fetchAds();
};
// 1. Check Login Status on Load
async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        userEmailSpan.innerText = user.email;
        loginNavBtn.style.display = 'none';
        logoutBtn.style.display = 'inline';
    }
}

// 2. Handle Login/Signup
authForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const isLoggingIn = document.getElementById('authTitle').innerText === "Login";

    let result;
    if (isLoggingIn) {
        result = await supabase.auth.signInWithPassword({ email, password });
    } else {
        result = await supabase.auth.signUp({ email, password });
        alert("Check your email for a confirmation link!");
    }

    if (result.error) {
        alert(result.error.message);
    } else {
        location.reload();
    }
};

// 3. Logout Logic
logoutBtn.onclick = async () => {
    await supabase.auth.signOut();
    location.reload();
};

// Open Auth Modal
loginNavBtn.onclick = () => authModal.style.display = "block";
document.getElementById('closeAuth').onclick = () => authModal.style.display = "none";

checkUser();
const myAdsBtn = document.getElementById('myAdsBtn');
const allAdsBtn = document.getElementById('allAdsBtn');

// 1. Show the "My Ads" button only if logged in
async function updateUIForUser(user) {
    if (user) {
        myAdsBtn.style.display = 'inline';
        userEmailSpan.innerText = user.email;
        loginNavBtn.style.display = 'none';
        logoutBtn.style.display = 'inline';
    }
}

// 2. Function to show ONLY the current user's ads
myAdsBtn.onclick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id); // Filter by the logged-in user's ID

    if (!error) {
        displayAds(data);
        myAdsBtn.style.display = 'none';
        allAdsBtn.style.display = 'inline';
        document.querySelector('h1').innerText = "My Listings";
    }
};

// 3. Function to go back to the full marketplace
allAdsBtn.onclick = () => {
    fetchAds(); // This calls the original function that gets everything
    allAdsBtn.style.display = 'none';
    myAdsBtn.style.display = 'inline';
    document.querySelector('h1').innerText = "Marketplace";
};
const imageUrlInput = document.getElementById('image_url');
const imgPreview = document.getElementById('imgPreview');

imageUrlInput.addEventListener('input', () => {
    const url = imageUrlInput.value;
    if (url) {
        imgPreview.src = url;
        imgPreview.style.display = 'block';
    } else {
        imgPreview.style.display = 'none';
    }
});
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Check if user previously chose dark mode
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    darkModeToggle.innerText = "☀️ Light Mode";
}

darkModeToggle.onclick = () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        darkModeToggle.innerText = "☀️ Light Mode";
    } else {
        localStorage.setItem('theme', 'light');
        darkModeToggle.innerText = "🌙 Dark Mode";
    }
};
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', function() {
        // Remove 'active' from all
        navItems.forEach(i => i.classList.remove('active'));
        // Add to the clicked one
        this.classList.add('active');
    });
});
function filterByCategory(category) {
    // 1. Update the UI (the green circles)
    const items = document.querySelectorAll('.category-item');
    items.forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('p').innerText === category) {
            item.classList.add('active');
        }
    });

    // 2. Actually filter the ads
    // We can reuse your existing filterCategory dropdown logic or 
    // simply trigger the filterAds function after setting the dropdown value
    const dropdown = document.getElementById('filterCategory');
    if (dropdown) {
        dropdown.value = category;
        filterAds(); // This is the function we built earlier!
    }
}
const googleBtn = document.getElementById('googleLoginBtn');

googleBtn.onclick = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin // Takes them back to your site after login
        }
    });

    if (error) {
        showNotification("Error logging in: " + error.message, "error");
    }
};
// Wait for the page to load fully
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // 1. Check if user has a saved preference
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        darkModeToggle.innerText = "☀️ Light Mode";
    }

    // 2. Add the click event
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        // 3. Save the preference and update text
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            darkModeToggle.innerText = "☀️ Light Mode";
        } else {
            localStorage.setItem('theme', 'light');
            darkModeToggle.innerText = "🌙 Dark Mode";
        }
    });
});
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

// Apply this to every ad card created
function observeCards() {
    document.querySelectorAll('.ad-card').forEach(card => {
        observer.observe(card);
    });
}
function showView(viewId) {
    // Hide all main views
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    
    // Show the selected one
    document.getElementById(viewId + '-view').style.display = 'block';

    // Scroll to the top automatically
    window.scrollTo(0, 0);

    // Optional: Add an "active" class to your bottom nav icons
    updateBottomNav(viewId);
}
// Add this inside your syncProfileData function
OneSignalDeferred.push(async function(OneSignal) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        // This links the notification ID to your Supabase User ID
        await OneSignal.login(user.id); 
        console.log("Notifications synced for user:", user.id);
    }
});
let activeChatAdId = null;
let activeReceiverId = null;

// 1. Listen for new messages in Realtime
supabase
  .channel('public:messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
    const newMessage = payload.new;
    // Only show if the message belongs to the current open chat
    if (newMessage.ad_id === activeChatAdId) {
        appendMessageToUI(newMessage);
    }
  })
  .subscribe();

// 2. Function to send a message
async function sendMessage() {
    const content = document.getElementById('msgInput').value;
    const { data: { user } } = await supabase.auth.getUser();

    if (!content || !user) return;

    const { error } = await supabase.from('messages').insert([{
        sender_id: user.id,
        receiver_id: activeReceiverId,
        ad_id: activeChatAdId,
        content: content
    }]);

    if (!error) document.getElementById('msgInput').value = '';
}
async function handleUpload(event) {
    event.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerText = "Uploading...";
    btn.disabled = true;

    const file = document.getElementById('itemPhoto').files[0];
    const title = document.getElementById('itemTitle').value;
    const price = document.getElementById('itemPrice').value;
    const category = document.getElementById('itemCategory').value;
    const desc = document.getElementById('itemDesc').value;

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Upload Image to Storage
    const fileName = `${Date.now()}_${file.name}`;
    const { data: imgData, error: imgError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file);

    if (imgError) return alert("Image upload failed!");

    // 2. Get the Public URL of the image
    const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);

    // 3. Save Ad details to Database
    const { error: dbError } = await supabase
        .from('listings')
        .insert([{
            title: title,
            price: price,
            category: category,
            description: desc,
            image_url: publicUrl,
            seller_id: user.id
        }]);

    if (dbError) {
        alert("Error saving ad: " + dbError.message);
    } else {
        alert("Ad Posted Successfully! 🎉");
        showView('home');
        fetchAds(); // Refresh the home feed
    }
    
    btn.innerText = "Post Ad Now";
    btn.disabled = false;
}
async function loadMyAds() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return showView('profile');

    const { data: ads, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

    const container = document.getElementById('my-ads-grid');
    container.innerHTML = '';

    if (ads.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px;'>You haven't posted any ads yet.</p>";
    }

    ads.forEach(ad => {
        container.innerHTML += `
            <div class="ad-card" id="ad-${ad.id}">
                <img src="${ad.image_url}" alt="${ad.title}">
                <div class="ad-info">
                    <h4>${ad.title}</h4>
                    <p class="price">GHS ${ad.price}</p>
                    <button class="btn-delete" onclick="deleteAd('${ad.id}', '${ad.image_url}')">🗑️ Delete Ad</button>
                </div>
            </div>
        `;
    });
    showView('my-ads');
}

async function deleteAd(adId, imageUrl) {
    if (!confirm("Are you sure you want to delete this ad? This cannot be undone.")) return;

    // 1. Delete from Database
    const { error: dbError } = await supabase.from('listings').delete().eq('id', adId);

    if (!dbError) {
        // 2. Pro Move: Delete the image from Storage too to save space!
        const fileName = imageUrl.split('/').pop();
        await supabase.storage.from('listing-images').remove([fileName]);

        // 3. Remove from UI
        document.getElementById(`ad-${adId}`).remove();
        showNotification("Ad deleted successfully", "success");
    }
    const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// TEST: Add this line to see if it's connected
console.log("Supabase initialized:", supabase);
}
async function handleLogin() {
    console.log("Login button clicked!"); // If this doesn't show in Console (F12), your HTML isn't calling the function.

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin // Automatically detects if you are on localhost or Vercel
            }
        });

        if (error) throw error;
        console.log("Login data:", data);
    } catch (err) {
        console.error("Login failed:", err.message);
        alert("Error: " + err.message);
    }
}
