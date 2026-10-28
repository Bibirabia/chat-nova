// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAZmT5oRnitVTfDlxOUTx8a1_wJI85CQ9Q",
  authDomain: "chat-app-2a7c6.firebaseapp.com",
  projectId: "chat-app-2a7c6",
  storageBucket: "chat-app-2a7c6.firebasestorage.app",
  messagingSenderId: "54407938911",
  appId: "1:54407938911:web:a9d215d77f7e551a4e6cea",
  measurementId: "G-WXCQ7VRVY6"
};

// Initialize Firebase (Fallback to mock data if dummy keys are used)
let auth, db, storage;
let isFirebaseConfigured = false;

try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    isFirebaseConfigured = true;
} catch (e) {
    console.warn("Firebase not configured. Running application in Local Mock Mode.");
}

// --- APP STATE ---
let currentUser = null;
let activeChatId = null;
let currentLanguage = 'en';

// Translations Dictionary
const translations = {
    en: { chats: "Chats", my_status: "My Status", appearance: "Appearance", language: "Language", welcome_title: "Welcome to ChatHub", type_message: "Type a message..." },
    es: { chats: "Chats", my_status: "Mi Estado", appearance: "Apariencia", language: "Idioma", welcome_title: "Bienvenido a ChatHub", type_message: "Escribe un mensaje..." },
    fr: { chats: "Discussions", my_status: "Mon Statut", appearance: "Apparence", language: "Langue", welcome_title: "Bienvenue sur ChatHub", type_message: "Écrivez un message..." },
    ar: { chats: "المحادثات", my_status: "حالتي", appearance: "المظهر", language: "اللغة", welcome_title: "ChatHub مرحباً بك في", type_message: "اكتب رسالة..." }
};

// --- DOM ELEMENTS ---
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const authForm = document.getElementById('auth-form');
const authToggleBtn = document.getElementById('auth-toggle-btn');
let isSignUp = false;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    if (isFirebaseConfigured) {
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                showAppScreen();
            } else {
                showAuthScreen();
            }
        });
    } else {
        // Auto-login mock user for local demonstration
        currentUser = { uid: "user_123", displayName: "Demo User", email: "demo@chathub.com" };
        showAppScreen();
    }
});

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Auth Toggle Sign In / Up
    authToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isSignUp = !isSignUp;
        document.getElementById('name-group').style.display = isSignUp ? 'block' : 'none';
        document.getElementById('auth-btn').innerText = isSignUp ? 'Sign Up' : 'Sign In';
        authToggleBtn.innerText = isSignUp ? 'Sign In' : 'Sign Up';
    });

    // Auth Form Submission
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        if (isFirebaseConfigured) {
            if (isSignUp) {
                auth.createUserWithEmailAndPassword(email, password);
            } else {
                auth.signInWithEmailAndPassword(email, password);
            }
        } else {
            showAppScreen();
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (isFirebaseConfigured) auth.signOut();
        showAuthScreen();
    });

    // Navigation Tabs Switcher
    document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            document.getElementById('panel-title').innerText = btn.title;
        });
    });

    // Theme Selector
    document.getElementById('theme-toggle').addEventListener('change', (e) => {
        document.body.classList.toggle('dark-mode', e.target.checked);
    });

    // Color Accent Dots
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            document.body.className = document.body.className.replace(/theme-\w+/g, '');
            document.body.classList.add(`theme-${dot.dataset.color}`);
        });
    });

    // Font Switcher
    document.getElementById('font-select').addEventListener('change', (e) => {
        document.body.className = document.body.className.replace(/font-\w+/g, '');
        document.body.classList.add(e.target.value);
    });

    // Language Selector
    document.getElementById('language-select').addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        document.body.classList.toggle('rtl', currentLanguage === 'ar');
        applyTranslations();
    });

    // Message Actions
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Location Sharing Feature
    document.getElementById('send-location-btn').addEventListener('click', shareLocation);

    // Call Modals
    document.getElementById('start-voice-call').addEventListener('click', () => openCallModal(false));
    document.getElementById('start-video-call').addEventListener('click', () => openCallModal(true));
    document.getElementById('end-call').addEventListener('click', closeCallModal);

    // QR Code Modal
    document.getElementById('show-qr-btn').addEventListener('click', generateQRCode);
    document.querySelector('#qr-modal .close-modal').addEventListener('click', () => {
        document.getElementById('qr-modal').classList.add('hidden');
    });
}

// --- SCREEN SWITCHING ---
function showAuthScreen() {
    authScreen.classList.add('active');
    appScreen.classList.remove('active');
}

function showAppScreen() {
    authScreen.classList.remove('active');
    appScreen.classList.add('active');
    loadChats();
}

// --- CHAT LOGIC ---
function loadChats() {
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = `
        <div class="chat-item" onclick="openChat('chat_1', 'Jane Doe')">
            <img src="https://via.placeholder.com/40" alt="Avatar">
            <div class="chat-item-info">
                <div class="chat-item-header">
                    <h4>Jane Doe</h4>
                    <span class="time">10:42 AM</span>
                </div>
                <p class="last-msg">Hey! Are we still meeting today?</p>
            </div>
        </div>
    `;
}

function openChat(chatId, title) {
    activeChatId = chatId;
    document.getElementById('no-chat-selected').classList.add('hidden');
    document.getElementById('active-chat-container').classList.remove('hidden');
    document.getElementById('chat-target-name').innerText = title;
    
    // Clear and render demo messages
    const container = document.getElementById('messages-container');
    container.innerHTML = `
        <div class="message received">
            <div class="message-bubble">Hey there! Welcome to the new app.</div>
            <span class="message-info">10:40 AM</span>
        </div>
    `;
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (!text) return;

    renderMessage(text, 'sent');
    input.value = '';
}

function renderMessage(content, type) {
    const container = document.getElementById('messages-container');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerHTML = `
        <div class="message-bubble">${content}</div>
        <span class="message-info">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// --- LOCATION SHARING ---
function shareLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const locUrl = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
            renderMessage(`<a href="${locUrl}" target="_blank" style="color: inherit;"><i class="fa-solid fa-map-location-dot"></i> My Current Location</a>`, 'sent');
        });
    }
}

// --- CALL HANDLING (WEBRTC STUB) ---
function openCallModal(isVideo) {
    const modal = document.getElementById('call-modal');
    modal.classList.remove('hidden');
    navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true })
        .then(stream => {
            document.getElementById('local-video').srcObject = stream;
        }).catch(err => console.error("Media access error:", err));
}

function closeCallModal() {
    const modal = document.getElementById('call-modal');
    modal.classList.add('hidden');
    const localVideo = document.getElementById('local-video');
    if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(track => track.stop());
    }
}

// --- QR CODE GENERATION ---
function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: `https://chathub.app/join?group=${activeChatId || 'default'}`,
        width: 128,
        height: 128
    });
    document.getElementById('qr-modal').classList.remove('hidden');
}

// --- TRANSLATION HELPER ---
function applyTranslations() {
    const lang = translations[currentLanguage] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (lang[key]) el.innerText = lang[key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (lang[key]) el.placeholder = lang[key];
    });
}