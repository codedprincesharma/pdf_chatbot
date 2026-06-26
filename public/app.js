// API Endpoints (auto-detects if running via Live Server or other port, defaulting to 5000)
const API_URL = window.location.port !== '5000' ? 'http://localhost:5000' : '';

// Application State
let activePdfId = null;
let pdfsList = [];

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadStatus = document.getElementById('upload-status');
const statusText = document.getElementById('status-text');
const statusPercent = document.getElementById('status-percent');
const progressBar = document.getElementById('progress-bar');
const docCount = document.getElementById('doc-count');
const docList = document.getElementById('doc-list');
const welcomeView = document.getElementById('welcome-view');
const chatView = document.getElementById('chat-view');
const activeDocTitle = document.getElementById('active-doc-title');
const activeDocMeta = document.getElementById('active-doc-meta');
const messagesArea = document.getElementById('messages-area');
const inputForm = document.getElementById('input-form');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const toastContainer = document.getElementById('toast-container');
const suggestionsContainer = document.getElementById('suggestions-container');
const appContainer = document.getElementById('app-container');
const sidebar = document.getElementById('sidebar');
const sidebarResizer = document.getElementById('sidebar-resizer');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Auth DOM Elements
const authOverlay = document.getElementById('auth-overlay');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authSubtitle = document.getElementById('auth-subtitle');
const authToggleBtn = document.getElementById('auth-toggle-btn');
const authToggleText = document.getElementById('auth-toggle-text');
const userProfileSection = document.getElementById('user-profile-section');
const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');

// Auth State Variables
let accessToken = null;
let isSignUpMode = false;

// Wrap native fetch to include bearer token and handle token expiration/rotation
async function authFetch(url, options = {}) {
  options.headers = options.headers || {};
  if (accessToken) {
    options.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  options.credentials = 'include'; // Send cookies (like refreshToken)
  
  try {
    let response = await fetch(url, options);
    
    // If access token is expired (401), attempt to refresh it
    if (response.status === 401 && accessToken) {
      console.log('Access token expired, attempting refresh...');
      const refreshed = await refreshToken();
      if (refreshed) {
        options.headers['Authorization'] = `Bearer ${accessToken}`;
        response = await fetch(url, options);
      } else {
        // Session expired, show login modal
        showAuthModal(true);
        throw new Error('Session expired. Please log in again.');
      }
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Refresh access token using HttpOnly cookie refresh token
async function refreshToken() {
  try {
    const response = await fetch(API_URL + '/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    const result = await response.json();
    if (result.success && result.data && result.data.accessToken) {
      accessToken = result.data.accessToken;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}

// Check if user is logged in on load
async function checkAuthState() {
  const refreshed = await refreshToken();
  if (refreshed) {
    const email = localStorage.getItem('userEmail') || 'User';
    onLoginSuccess(email);
  } else {
    showAuthModal(true);
  }
}

function showAuthModal(show) {
  authOverlay.style.display = show ? 'flex' : 'none';
  if (show) {
    authEmail.value = '';
    authPassword.value = '';
    authEmail.focus();
  }
}

function toggleAuthMode() {
  isSignUpMode = !isSignUpMode;
  authSubtitle.textContent = isSignUpMode ? 'Create your DocuMind account' : 'Login to chat with your documents';
  authSubmitBtn.querySelector('span').textContent = isSignUpMode ? 'Sign Up' : 'Log In';
  authToggleText.textContent = isSignUpMode ? 'Already have an account?' : "Don't have an account?";
  authToggleBtn.textContent = isSignUpMode ? 'Log In' : 'Sign Up';
}

async function handleAuthSubmit(e) {
  if (e) e.preventDefault();
  const email = authEmail.value.trim();
  const password = authPassword.value;
  
  if (!email || !password) return;
  
  const endpoint = isSignUpMode ? '/auth/signup' : '/auth/login';
  
  try {
    authSubmitBtn.disabled = true;
    authSubmitBtn.querySelector('span').textContent = isSignUpMode ? 'Signing up...' : 'Logging in...';
    
    const response = await fetch(API_URL + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (result.success) {
      if (isSignUpMode) {
        showToast('Success', 'Account created successfully! Logging in...', 'success');
        // Auto-login after signup
        isSignUpMode = false;
        authPassword.value = password; // Preserve password for login attempt
        await handleAuthSubmit();
      } else {
        accessToken = result.data.accessToken;
        localStorage.setItem('userEmail', result.data.user.email);
        onLoginSuccess(result.data.user.email);
        showToast('Success', 'Logged in successfully!', 'success');
      }
    } else {
      showToast('Authentication Failed', result.message || 'Operation failed', 'error');
    }
  } catch (error) {
    console.error('Auth error:', error);
    showToast('Error', 'Connection to authentication server failed', 'error');
  } finally {
    authSubmitBtn.disabled = false;
    authSubmitBtn.querySelector('span').textContent = isSignUpMode ? 'Sign Up' : 'Log In';
  }
}

function onLoginSuccess(email) {
  showAuthModal(false);
  appContainer.style.display = 'flex';
  
  // Show user profile in sidebar
  userProfileSection.style.display = 'flex';
  userEmailSpan.textContent = email;
  userEmailSpan.setAttribute('title', email);
  
  // Load library
  fetchPdfs();
}

async function handleLogout() {
  try {
    await fetch(API_URL + '/auth/logout', {
      method: 'POST',
      headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    accessToken = null;
    localStorage.removeItem('userEmail');
    
    // Hide main UI
    appContainer.style.display = 'none';
    
    // Hide user profile
    userProfileSection.style.display = 'none';
    
    // Clear state
    activePdfId = null;
    pdfsList = [];
    docList.innerHTML = '';
    welcomeView.style.display = 'flex';
    chatView.style.display = 'none';
    
    showToast('Logged Out', 'You have been logged out.', 'info');
    showAuthModal(true);
  }
}

function setupAuthEventListeners() {
  authForm.addEventListener('submit', handleAuthSubmit);
  authToggleBtn.addEventListener('click', toggleAuthMode);
  logoutBtn.addEventListener('click', handleLogout);
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  setupAuthEventListeners();
  await checkAuthState();
});

// Setup Event Listeners
function setupEventListeners() {
  // Drag and Drop files
  dropZone.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  ['dragleave', 'dragend'].forEach(type => {
    dropZone.addEventListener(type, () => {
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  // Auto-grow textarea
  chatInput.addEventListener('input', autoGrowTextarea);

  // Form submission
  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleQuestionSubmit();
  });

  // Enter to submit (Shift+Enter for newline)
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      inputForm.dispatchEvent(new Event('submit'));
    }
  });

  // Suggestion buttons
  suggestionsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.suggestion-btn');
    if (btn) {
      const prompt = btn.getAttribute('data-prompt');
      chatInput.value = prompt;
      autoGrowTextarea();
      chatInput.focus();
    }
  });

  // Resizable Sidebar & Theme Toggle
  setupSidebarResizer();
  setupThemeToggle();
}

// Sidebar Drag-to-Resize Logic
function setupSidebarResizer() {
  // Load saved sidebar width from localStorage
  const savedWidth = localStorage.getItem('sidebarWidth');
  if (savedWidth) {
    sidebar.style.width = savedWidth + 'px';
    sidebar.style.minWidth = savedWidth + 'px';
  }

  sidebarResizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    document.body.classList.add('resizing');

    const startX = e.clientX;
    const startWidth = sidebar.getBoundingClientRect().width;

    function handleMouseMove(moveEvent) {
      const currentX = moveEvent.clientX;
      const deltaX = currentX - startX;
      let newWidth = startWidth + deltaX;

      // Impose boundaries: min 240px, max 480px
      if (newWidth < 240) {
        newWidth = 240;
      } else if (newWidth > 480) {
        newWidth = 480;
      }

      sidebar.style.width = newWidth + 'px';
      sidebar.style.minWidth = newWidth + 'px';
    }

    function handleMouseUp() {
      document.body.classList.remove('resizing');
      const finalWidth = sidebar.getBoundingClientRect().width;
      localStorage.setItem('sidebarWidth', finalWidth);
      
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  });
}

// Light/Dark Theme Toggle Logic
function setupThemeToggle() {
  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-theme');
    const newTheme = isLight ? 'dark' : 'light';
    setTheme(newTheme);
  });

  function setTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      document.body.classList.remove('light-theme');
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
    localStorage.setItem('theme', theme);
  }
}


// Fetch list of uploaded PDFs from backend
async function fetchPdfs() {
  try {
    const response = await authFetch(API_URL + '/pdf/list');
    const result = await response.json();
    
    if (result.success) {
      pdfsList = result.data;
      renderPdfsList();
    } else {
      showToast('Error', result.message || 'Failed to fetch library list', 'error');
    }
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    showToast('Connection Error', 'Could not reach the server', 'error');
  }
}

// Render PDF list in sidebar
function renderPdfsList() {
  docCount.textContent = `${pdfsList.length} file${pdfsList.length === 1 ? '' : 's'}`;
  
  if (pdfsList.length === 0) {
    docList.innerHTML = `
      <div class="empty-library">
        <i data-lucide="files" class="empty-icon"></i>
        <p>No documents uploaded yet</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  docList.innerHTML = pdfsList.map(pdf => `
    <div class="doc-item ${pdf.id === activePdfId ? 'active' : ''}" data-id="${pdf.id}">
      <div class="doc-icon-container">
        <i data-lucide="file-text"></i>
      </div>
      <div class="doc-details">
        <div class="doc-name" title="${pdf.originalName}">${pdf.originalName}</div>
        <div class="doc-meta">${pdf.chunkCount} chunks • ${new Date(pdf.createdAt).toLocaleDateString()}</div>
      </div>
    </div>
  `).join('');

  // Re-initialize Lucide Icons
  lucide.createIcons();

  // Add click events to items
  document.querySelectorAll('.doc-item').forEach(item => {
    item.addEventListener('click', () => {
      const pdfId = item.getAttribute('data-id');
      selectPdf(pdfId);
    });
  });
}

// Select a PDF and load its conversation history
async function selectPdf(pdfId) {
  if (activePdfId === pdfId) return;
  
  activePdfId = pdfId;
  
  // Highlight active document in sidebar
  document.querySelectorAll('.doc-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-id') === pdfId);
  });

  const activePdf = pdfsList.find(p => p.id === pdfId);
  if (!activePdf) return;

  // Show Chat View and Hide Welcome View
  welcomeView.style.display = 'none';
  chatView.style.display = 'flex';
  
  // Set header details
  activeDocTitle.textContent = activePdf.originalName;
  activeDocTitle.setAttribute('title', activePdf.originalName);
  activeDocMeta.textContent = `${activePdf.chunkCount} chunks • Vector ID: ${activePdf.vectorCollectionId.substring(0, 15)}...`;

  // Fetch conversation history
  await fetchHistory(pdfId);
}

// Fetch chat history for selected PDF
async function fetchHistory(pdfId) {
  messagesArea.innerHTML = '';
  
  // Show standard start message
  appendSystemMessage('Connected. Ask me anything about this document!');

  try {
    const response = await authFetch(API_URL + `/chat/history/${pdfId}`);
    const result = await response.json();
    
    if (result.success && result.data && result.data.messages) {
      const messages = result.data.messages;
      messages.forEach(msg => {
        appendMessageBubble(msg.role, msg.content);
      });
      scrollToBottom();
    }
  } catch (error) {
    console.error('Error fetching history:', error);
    showToast('Error', 'Failed to retrieve conversation history', 'error');
  }
}

// Handle File Upload with XHR (for progress reporting)
function handleFileUpload(file) {
  if (!file) return;
  
  if (file.type !== 'application/pdf') {
    showToast('Invalid File Type', 'Please upload a PDF file only', 'error');
    return;
  }

  // Prep form data
  const formData = new FormData();
  formData.append('pdf', file);

  // Show progress bar
  uploadStatus.style.display = 'block';
  statusText.textContent = 'Uploading...';
  statusPercent.textContent = '0%';
  progressBar.style.width = '0%';

  const xhr = new XMLHttpRequest();
  
  // Track upload progress
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = `${percent}%`;
      statusPercent.textContent = `${percent}%`;
      if (percent === 100) {
        statusText.textContent = 'Processing PDF (Extracting text & creating embeddings)...';
        statusPercent.textContent = '';
      }
    }
  });

  // Track completion
  xhr.addEventListener('load', async () => {
    if (xhr.status === 401) {
      console.log('Access token expired during upload, attempting refresh...');
      const refreshed = await refreshToken();
      if (refreshed) {
        handleFileUpload(file);
      } else {
        showAuthModal(true);
        showToast('Session Expired', 'Please log in again to upload files', 'error');
        uploadStatus.style.display = 'none';
      }
      return;
    }
    if (xhr.status === 201) {
      try {
        const response = JSON.parse(xhr.responseText);
        showToast('Success', 'PDF uploaded and processed successfully!', 'success');
        
        // Hide upload status
        uploadStatus.style.display = 'none';
        
        // Refresh documents list
        fetchPdfs().then(() => {
          // Auto select newly uploaded PDF
          if (response.success && response.data && response.data.id) {
            selectPdf(response.data.id);
          }
        });
      } catch (err) {
        showToast('Processing Error', 'Server returned unexpected response', 'error');
        uploadStatus.style.display = 'none';
      }
    } else {
      let errMsg = 'PDF upload failed';
      try {
        const errObj = JSON.parse(xhr.responseText);
        errMsg = errObj.message || errMsg;
      } catch(e) {}
      showToast('Upload Failed', errMsg, 'error');
      uploadStatus.style.display = 'none';
    }
  });

  // Track error
  xhr.addEventListener('error', () => {
    showToast('Connection Error', 'Network error occurred during file upload', 'error');
    uploadStatus.style.display = 'none';
  });

  xhr.open('POST', API_URL + '/pdf/upload');
  if (accessToken) {
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  }
  xhr.withCredentials = true;
  xhr.send(formData);
}

// Handle question submit
async function handleQuestionSubmit() {
  const question = chatInput.value.trim();
  if (!question || !activePdfId) return;

  // Clear input and reset height
  chatInput.value = '';
  autoGrowTextarea();

  // Append user message bubble
  appendMessageBubble('user', question);
  scrollToBottom();

  // Append thinking bubble
  const thinkingBubble = appendThinkingBubble();
  scrollToBottom();

  try {
    const response = await authFetch(API_URL + '/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: question,
        pdfId: activePdfId
      })
    });

    const result = await response.json();
    
    // Remove thinking indicator
    removeThinkingBubble(thinkingBubble);

    if (result.success && result.data) {
      appendMessageBubble('assistant', result.data.answer, result.data.sources);
    } else {
      appendMessageBubble('assistant', result.message || 'Sorry, I encountered an issue processing your request.');
    }
    scrollToBottom();
  } catch (error) {
    console.error('Error sending question:', error);
    removeThinkingBubble(thinkingBubble);
    appendMessageBubble('assistant', 'Sorry, I am having trouble connecting to the server. Please check your connection.');
    scrollToBottom();
  }
}

// Append message bubbles to chat area
function appendMessageBubble(role, content, sources = null) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  
  if (role === 'assistant') {
    bubble.innerHTML = parseMarkdown(content);
  } else {
    bubble.textContent = content;
  }
  
  messageElement.appendChild(bubble);

  // Add metadata if applicable
  const meta = document.createElement('div');
  meta.className = 'message-meta';
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  meta.innerHTML = `<span>${time}</span>`;
  
  if (role === 'assistant' && sources !== null) {
    meta.innerHTML += `
      <span class="sources-pill" title="Retrieved ${sources} relevant chunks from PDF">
        <i data-lucide="quote" style="width: 10px; height: 10px;"></i>
        ${sources} sources
      </span>
    `;
  }
  
  messageElement.appendChild(meta);
  messagesArea.appendChild(messageElement);
  
  // Re-create icons for any new lucide elements in the metadata
  lucide.createIcons();
}

// Append AI Thinking bubble
function appendThinkingBubble() {
  const messageElement = document.createElement('div');
  messageElement.className = 'message assistant thinking-bubble';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  
  bubble.innerHTML = `
    <div class="thinking-indicator">
      <div class="thinking-dot"></div>
      <div class="thinking-dot"></div>
      <div class="thinking-dot"></div>
    </div>
  `;
  
  messageElement.appendChild(bubble);
  messagesArea.appendChild(messageElement);
  return messageElement;
}

// Remove thinking bubble
function removeThinkingBubble(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

// Append System notification to chat area
function appendSystemMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'system-status-msg';
  msg.innerHTML = `
    <i data-lucide="info" style="width: 13px; height: 13px; color: var(--accent-purple);"></i>
    <span>${text}</span>
  `;
  messagesArea.appendChild(msg);
  lucide.createIcons();
}

// Scroll chat to bottom
function scrollToBottom() {
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Auto grow input textarea height
function autoGrowTextarea() {
  chatInput.style.height = 'auto';
  chatInput.style.height = (chatInput.scrollHeight) + 'px';
}

// Light markdown-to-HTML parser with XSS mitigation
function parseMarkdown(text) {
  if (!text) return '';
  
  // Escape HTML tags to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // Bold text: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Inline code: `code` -> <code>code</code>
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Handle lists and paragraphs
  const lines = html.split('\n');
  let inList = false;
  let result = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      // strip symbol and render list item
      result.push(`<li>${trimmed.substring(2)}</li>`);
    } else if (trimmed.match(/^\d+\.\s/)) {
      // Handle ordered list
      if (!inList) {
        result.push('<ol>');
        inList = true;
      }
      const itemContent = trimmed.replace(/^\d+\.\s/, '');
      result.push(`<li>${itemContent}</li>`);
    } else {
      if (inList) {
        // close list tag (detecting if it was ol or ul by looking at the last tag)
        const lastOpenTag = result.lastIndexOf('<ul>') > result.lastIndexOf('<ol>') ? '</ul>' : '</ol>';
        result.push(lastOpenTag);
        inList = false;
      }
      result.push(line ? `<p>${line}</p>` : '');
    }
  }
  
  if (inList) {
    const lastOpenTag = result.lastIndexOf('<ul>') > result.lastIndexOf('<ol>') ? '</ul>' : '</ol>';
    result.push(lastOpenTag);
  }
  
  return result.join('\n');
}

// Toast notification system
function showToast(title, desc, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info';
  
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${desc}</div>
    </div>
  `;

  toastContainer.appendChild(toast);
  lucide.createIcons();

  // Slide-out and remove toast
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4000);
}
