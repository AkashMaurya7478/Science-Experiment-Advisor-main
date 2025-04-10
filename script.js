// Authentication state
let currentUser = null;
let chatHistory = [];

// DOM Elements
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const historySidebar = document.getElementById('history-sidebar');
const historyList = document.getElementById('history-list');
const themeToggle = document.getElementById('theme-toggle');
const historyToggle = document.getElementById('history-toggle');
const logoutButton = document.getElementById('logout-button');

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        showChat();
    } else {
        showAuth();
    }
}

// Show authentication screen
function showAuth() {
    authContainer.classList.remove('hidden');
    chatContainer.classList.add('hidden');
}

// Show chat screen
function showChat() {
    authContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    loadChatHistory();
}

// Handle login
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // In a real app, you would validate credentials with a backend
    if (email && password) {
        currentUser = { email, name: email.split('@')[0] };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showChat();
    }
}

// Handle registration
async function register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // In a real app, you would create a new user in your backend
    if (name && email && password) {
        currentUser = { email, name };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showChat();
    }
}

// Handle logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuth();
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
}

// Update theme icon
function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Toggle history sidebar
function toggleHistory() {
    historySidebar.classList.toggle('hidden');
}

// Load chat history
function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem(`chatHistory_${currentUser.email}`) || '[]');
    chatHistory = history;
    updateHistoryList();
}

// Save chat history
function saveChatHistory() {
    localStorage.setItem(`chatHistory_${currentUser.email}`, JSON.stringify(chatHistory));
}

// Update history list
function updateHistoryList() {
    historyList.innerHTML = '';
    chatHistory.forEach((chat, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = chat.title || `Chat ${index + 1}`;
        item.onclick = () => loadChat(chat);
        historyList.appendChild(item);
    });
}

// Load a specific chat
function loadChat(chat) {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    chat.messages.forEach(msg => {
        addMessage(msg.content, msg.sender);
    });
}

// Modified askNVIDIA function
async function askNVIDIA() {
    const userInput = document.getElementById('user-input');
    const input = userInput.value.trim();
    
    if (!input) return;
    
    // Add user message to chat
    addMessage(input, 'user');
    
    // Clear input
    userInput.value = '';
    
    try {
        const response = await fetch('/get-response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: input
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const experiment = data.response;
        
        // Add bot response to chat
        addMessage(experiment, 'bot');
        
        // Save to history
        const chatMessages = document.getElementById('chat-messages');
        const messages = Array.from(chatMessages.children).map(msg => ({
            content: msg.querySelector('.message-content').textContent,
            sender: msg.classList.contains('user-message') ? 'user' : 'bot'
        }));
        
        chatHistory.push({
            title: input,
            messages: messages
        });
        
        saveChatHistory();
        updateHistoryList();
        
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, there was an error generating the experiment. Please try again.', 'bot');
    }
}

// Modified addMessage function
function addMessage(content, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = marked.parse(content);
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    checkAuth();
    
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
    
    // Add event listeners
    themeToggle.addEventListener('click', toggleTheme);
    historyToggle.addEventListener('click', toggleHistory);
    logoutButton.addEventListener('click', logout);
    
    // Auth tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.tab === 'login') {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            }
        });
    });
    
    // Enter key for input
    document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            askNVIDIA();
        }
    });
});
