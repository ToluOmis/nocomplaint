// Main app state
const appState = {
  isStarted: false,
  startDate: null,
  
  // Complaint tracking
  complaintStreak: 0,
  bestComplaintStreak: 0,
  totalComplaints: 0,
  lastComplaintTime: null,
  
  // Excuse tracking
  excuseStreak: 0,
  bestExcuseStreak: 0,
  totalExcuses: 0,
  lastExcuseTime: null,
  
  // Common tracking
  cleanDays: 0,
  lastCheckDate: null,
  
  // Categories
  complaintCategories: {
    interpersonal: 0,
    delays: 0,
    quality: 0,
    pricing: 0,
    communication: 0,
    process: 0,
    emotional: 0,
    other: 0
  },
  
  excuseCategories: {
    blame: 0,
    trauma: 0,
    control: 0,
    accountability: 0,
    other: 0
  },
  
  // Journal entries
  journalEntries: []
};

// DOM elements
const elements = {
  // Buttons
  startBtn: document.getElementById('startBtn'),
  complaintBtn: document.getElementById('complaintBtn'),
  excuseBtn: document.getElementById('excuseBtn'),
  analysisBtn: document.getElementById('analysisBtn'),
  resetBtn: document.getElementById('resetBtn'),
  
  // Progress bar
  combinedProgressBar: document.getElementById('combinedProgressBar'),
  combinedProgressCount: document.getElementById('combinedProgressCount'),
  
  // Stats
  complaintStreak: document.getElementById('complaintStreak'),
  excuseStreak: document.getElementById('excuseStreak'),
  bestComplaintStreak: document.getElementById('bestComplaintStreak'),
  bestExcuseStreak: document.getElementById('bestExcuseStreak'),
  totalComplaints: document.getElementById('totalComplaints'),
  totalExcuses: document.getElementById('totalExcuses'),
  startDate: document.getElementById('startDate'),
  cleanDays: document.getElementById('cleanDays'),
  
  // Timers
  complaintCountdown: document.getElementById('complaintCountdown'),
  excuseCountdown: document.getElementById('excuseCountdown'),
  
  // Categories
  complaintCategoriesContainer: document.getElementById('complaintCategoriesContainer'),
  excuseCategoriesContainer: document.getElementById('excuseCategoriesContainer'),
  complaintCategoryCheckboxes: document.querySelectorAll('#complaintCategoriesContainer .category-checkbox'),
  excuseCategoryCheckboxes: document.querySelectorAll('#excuseCategoriesContainer .category-checkbox'),
  submitComplaintCategoryBtn: document.getElementById('submitComplaintCategoryBtn'),
  submitExcuseCategoryBtn: document.getElementById('submitExcuseCategoryBtn'),
  complaintCategoryTimer: document.getElementById('complaintCategoryTimer'),
  excuseCategoryTimer: document.getElementById('excuseCategoryTimer'),
  
  // Journal
  journalEntryContainer: document.getElementById('journalEntryContainer'),
  journalText: document.getElementById('journalText'),
  submitJournalBtn: document.getElementById('submitJournalBtn'),
  
  // Analysis popup
  analysisOverlay: document.getElementById('analysisOverlay'),
  closeAnalysis: document.getElementById('closeAnalysis'),
  
  // Notification
  notification: document.getElementById('notification'),
  notificationClose: document.getElementById('notificationClose'),
  notificationText: document.getElementById('notificationText')
};

// Timer variables
let complaintTimerInterval;
let excuseTimerInterval;
let complaintCategoryTimer;
let excuseCategoryTimer;
let categorySelectionTimeLeft = 180; // 3 minutes in seconds

// Start the challenge
function startChallenge() {
  const now = new Date();
  
  appState.isStarted = true;
  appState.startDate = now.toLocaleDateString();
  appState.lastCheckDate = now.toISOString();
  appState.lastComplaintTime = now.getTime();
  appState.lastExcuseTime = now.getTime();
  
  // Update button states
  elements.startBtn.disabled = true;
  elements.complaintBtn.disabled = false;
  elements.excuseBtn.disabled = false;
  elements.analysisBtn.disabled = false;
  
  // Start timers
  startComplaintTimer();
  startExcuseTimer();
  
  // Update UI
  updateDisplay();
  
  // Save state
  saveState();
  
  // Show notification
  showNotification('Challenge started! Good luck!');
}

// Handle complaint button press
function handleComplaint() {
  showCategorySelection('complaint');
}

// Handle excuse button press
function handleExcuse() {
  showCategorySelection('excuse');
}

// Show category selection
function showCategorySelection(type) {
  if (type === 'complaint') {
    elements.complaintCategoriesContainer.style.display = 'block';
    resetCategorySelection(elements.complaintCategoryCheckboxes);
    startCategorySelectionTimer(type);
  } else if (type === 'excuse') {
    elements.excuseCategoriesContainer.style.display = 'block';
    resetCategorySelection(elements.excuseCategoryCheckboxes);
    startCategorySelectionTimer(type);
  }
}

// Hide category selection
function hideCategorySelection(type) {
  if (type === 'complaint') {
    elements.complaintCategoriesContainer.style.display = 'none';
    clearInterval(complaintCategoryTimer);
  } else if (type === 'excuse') {
    elements.excuseCategoriesContainer.style.display = 'none';
    clearInterval(excuseCategoryTimer);
  }
}

// Reset category checkboxes
function resetCategorySelection(checkboxes) {
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
}

// Start category selection timer
function startCategorySelectionTimer(type) {
  categorySelectionTimeLeft = 180; // 3 minutes
  updateCategoryTimer(type);
  
  if (type === 'complaint') {
    if (complaintCategoryTimer) clearInterval(complaintCategoryTimer);
    
    complaintCategoryTimer = setInterval(() => {
      categorySelectionTimeLeft--;
      updateCategoryTimer(type);
      
      if (categorySelectionTimeLeft <= 0) {
        clearInterval(complaintCategoryTimer);
        hideCategorySelection(type);
      }
    }, 1000);
  } else if (type === 'excuse') {
    if (excuseCategoryTimer) clearInterval(excuseCategoryTimer);
    
    excuseCategoryTimer = setInterval(() => {
      categorySelectionTimeLeft--;
      updateCategoryTimer(type);
      
      if (categorySelectionTimeLeft <= 0) {
        clearInterval(excuseCategoryTimer);
        hideCategorySelection(type);
      }
    }, 1000);
  }
}

// Update category timer display
function updateCategoryTimer(type) {
  const minutes = Math.floor(categorySelectionTimeLeft / 60);
  const seconds = categorySelectionTimeLeft % 60;
  const timeDisplay = `Time remaining to select: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  if (type === 'complaint') {
    elements.complaintCategoryTimer.textContent = timeDisplay;
  } else if (type === 'excuse') {
    elements.excuseCategoryTimer.textContent = timeDisplay;
  }
}

// Submit complaint category selection
function submitComplaintCategory() {
  const selectedCategories = [];
  
  elements.complaintCategoryCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      const category = checkbox.dataset.category;
      selectedCategories.push(category);
      appState.complaintCategories[category]++;
    }
  });
  
  if (selectedCategories.length === 0) {
    // If no category selected, default to "other"
    appState.complaintCategories.other++;
  }
  
  hideCategorySelection('complaint');
  appState.totalComplaints++;
  
  // Reset complaint streak
  if (appState.complaintStreak > 0) {
    if (appState.complaintStreak > appState.bestComplaintStreak) {
      appState.bestComplaintStreak = appState.complaintStreak;
    }
    appState.complaintStreak = 0;
  }
  
  // Reset the complaint timer start time to now
  appState.lastComplaintTime = new Date().getTime();
  
  // Reset clean days
  appState.cleanDays = 0;
  
  // Update UI
  updateDisplay();
  
  // Save state
  saveState();
  
  // Show journal entry
  showJournalEntry('complaint', selectedCategories.length > 0 ? selectedCategories : ['other']);
  
  // Restart the complaint timer
  if (complaintTimerInterval) {
    clearInterval(complaintTimerInterval);
  }
  startComplaintTimer();
  
  // Show notification
  showNotification('Complaint recorded. Your streak has been reset.');
}

// Submit excuse category selection
function submitExcuseCategory() {
  const selectedCategories = [];
  
  elements.excuseCategoryCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      const category = checkbox.dataset.category;
      selectedCategories.push(category);
      appState.excuseCategories[category]++;
    }
  });
  
  if (selectedCategories.length === 0) {
    // If no category selected, default to "other"
    appState.excuseCategories.other++;
  }
  
  hideCategorySelection('excuse');
  appState.totalExcuses++;
  
  // Reset excuse streak
  if (appState.excuseStreak > 0) {
    if (appState.excuseStreak > appState.bestExcuseStreak) {
      appState.bestExcuseStreak = appState.excuseStreak;
    }
    appState.excuseStreak = 0;
  }
  
  // Reset the excuse timer start time to now
  appState.lastExcuseTime = new Date().getTime();
  
  // Reset clean days
  appState.cleanDays = 0;
  
  // Update UI
  updateDisplay();
  
  // Save state
  saveState();
  
  // Show journal entry
  showJournalEntry('excuse', selectedCategories.length > 0 ? selectedCategories : ['other']);
  
  // Restart the excuse timer
  if (excuseTimerInterval) {
    clearInterval(excuseTimerInterval);
  }
  startExcuseTimer();
  
  // Show notification
  showNotification('Excuse recorded. Your streak has been reset.');
}

// Show journal entry
function showJournalEntry(type, categories) {
  elements.journalEntryContainer.style.display = 'block';
  elements.journalText.value = '';
  elements.journalText.dataset.type = type;
  elements.journalText.dataset.categories = categories.join(',');
  elements.journalText.focus();
}

// Hide journal entry
function hideJournalEntry() {
  elements.journalEntryContainer.style.display = 'none';
}

// Submit journal entry
function submitJournalEntry() {
  const text = elements.journalText.value.trim();
  
  if (text) {
    const entry = {
      date: new Date().toISOString(),
      text: text,
      type: elements.journalText.dataset.type,
      categories: elements.journalText.dataset.categories.split(',')
    };
    
    appState.journalEntries.unshift(entry);
    saveState();
  }
  
  hideJournalEntry();
}

// Reset everything
function resetChallenge() {
  if (confirm('Are you sure you want to reset the challenge? All progress will be lost.')) {
    // Clear intervals
    if (complaintTimerInterval) clearInterval(complaintTimerInterval);
    if (excuseTimerInterval) clearInterval(excuseTimerInterval);
    if (complaintCategoryTimer) clearInterval(complaintCategoryTimer);
    if (excuseCategoryTimer) clearInterval(excuseCategoryTimer);
    
    // Reset state
    appState.isStarted = false;
    appState.startDate = null;
    appState.complaintStreak = 0;
    appState.bestComplaintStreak = 0;
    appState.totalComplaints = 0;
    appState.lastComplaintTime = null;
    appState.excuseStreak = 0;
    appState.bestExcuseStreak = 0;
    appState.totalExcuses = 0;
    appState.lastExcuseTime = null;
    appState.cleanDays = 0;
    appState.lastCheckDate = null;
    
    // Reset categories
    Object.keys(appState.complaintCategories).forEach(key => {
      appState.complaintCategories[key] = 0;
    });
    
    Object.keys(appState.excuseCategories).forEach(key => {
      appState.excuseCategories[key] = 0;
    });
    
    // Clear journal entries
    appState.journalEntries = [];
    
    // Update button states
    elements.startBtn.disabled = false;
    elements.complaintBtn.disabled = true;
    elements.excuseBtn.disabled = true;
    elements.analysisBtn.disabled = true;
    
    // Update UI
    elements.combinedProgressBar.style.width = '0%';
    elements.complaintCountdown.textContent = '00:00:00';
    elements.excuseCountdown.textContent = '00:00:00';
    
    updateDisplay();
    
    // Save state
    saveState();
    
    // Hide sections
    hideCategorySelection('complaint');
    hideCategorySelection('excuse');
    hideJournalEntry();
    hideAnalysis();
    
    // Show notification
    showNotification('Challenge has been reset. You can start fresh.');
  }
}

// Start complaint timer
function startComplaintTimer() {
  if (complaintTimerInterval) {
    clearInterval(complaintTimerInterval);
  }
  
  updateComplaintTime();
  
  complaintTimerInterval = setInterval(() => {
    updateComplaintTime();
    checkProgressAndUpdate();
  }, 1000);
}

// Start excuse timer
function startExcuseTimer() {
  if (excuseTimerInterval) {
    clearInterval(excuseTimerInterval);
  }
  
  updateExcuseTime();
  
  excuseTimerInterval = setInterval(() => {
    updateExcuseTime();
    checkProgressAndUpdate();
  }, 1000);
}

// Update complaint timer display
function updateComplaintTime() {
  if (!appState.lastComplaintTime) return;
  
  const now = new Date().getTime();
  const elapsed = now - appState.lastComplaintTime;
  
  // Calculate elapsed time
  const totalSeconds = Math.floor(elapsed / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  elements.complaintCountdown.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Check if a new day has passed based on elapsed time
  const daysPassed = Math.floor(elapsed / (1000 * 60 * 60 * 24));
  if (daysPassed > appState.complaintStreak) {
    // Update streak for each day passed
    for (let i = appState.complaintStreak; i < daysPassed; i++) {
      appState.complaintStreak++;
      
      if (appState.complaintStreak > appState.bestComplaintStreak) {
        appState.bestComplaintStreak = appState.complaintStreak;
      }
      
      // Update display with each day increment
      updateDisplay();
      
      if (appState.complaintStreak === 21 && appState.excuseStreak >= 21) {
        showNotification('Congratulations! You have completed the 21-day challenge!', 10000);
      }
    }
    
    saveState();
  }
}

// Update excuse timer display
function updateExcuseTime() {
  if (!appState.lastExcuseTime) return;
  
  const now = new Date().getTime();
  const elapsed = now - appState.lastExcuseTime;
  
  // Calculate elapsed time
  const totalSeconds = Math.floor(elapsed / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  elements.excuseCountdown.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Check if a new day has passed based on elapsed time
  const daysPassed = Math.floor(elapsed / (1000 * 60 * 60 * 24));
  if (daysPassed > appState.excuseStreak) {
    // Update streak for each day passed
    for (let i = appState.excuseStreak; i < daysPassed; i++) {
      appState.excuseStreak++;
      
      if (appState.excuseStreak > appState.bestExcuseStreak) {
        appState.bestExcuseStreak = appState.excuseStreak;
      }
      
      // Update display with each day increment
      updateDisplay();
      
      if (appState.complaintStreak >= 21 && appState.excuseStreak === 21) {
        showNotification('Congratulations! You have completed the 21-day challenge!', 10000);
      }
    }
    
    saveState();
  }
}

// Check progress and update
function checkProgressAndUpdate() {
  // Update clean days - min of both streaks
  const cleanDays = Math.min(appState.complaintStreak, appState.excuseStreak);
  
  if (cleanDays > appState.cleanDays) {
    appState.cleanDays = cleanDays;
  }
  
  // Update combined progress bar
  const progress = Math.min(appState.cleanDays / 21 * 100, 100);
  
  elements.combinedProgressBar.style.width = `${progress}%`;
  elements.combinedProgressCount.textContent = `${Math.min(appState.cleanDays, 21)}/21`;
}

// Update display
function updateDisplay() {
  elements.complaintStreak.textContent = appState.complaintStreak;
  elements.excuseStreak.textContent = appState.excuseStreak;
  elements.bestComplaintStreak.textContent = appState.bestComplaintStreak;
  elements.bestExcuseStreak.textContent = appState.bestExcuseStreak;
  elements.totalComplaints.textContent = appState.totalComplaints;
  elements.totalExcuses.textContent = appState.totalExcuses;
  elements.startDate.textContent = appState.startDate || 'Not started yet';
  elements.cleanDays.textContent = appState.cleanDays;
  
  checkProgressAndUpdate();
}

// Show notification
function showNotification(message, duration = 5000) {
  elements.notificationText.textContent = message;
  elements.notification.classList.add('show');
  
  setTimeout(() => {
    elements.notification.classList.remove('show');
  }, duration);
}

// Show analysis popup
function showAnalysis() {
  elements.analysisOverlay.style.display = 'flex';
  // In a real implementation, you would generate the charts here
}

// Hide analysis popup
function hideAnalysis() {
  elements.analysisOverlay.style.display = 'none';
}

// Load saved state from localStorage
function loadState() {
  const savedState = localStorage.getItem('noComplaintChallengeApp');
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      Object.assign(appState, parsedState);
      
      // Check if challenge is started
      if (appState.isStarted) {
        elements.startBtn.disabled = true;
        elements.complaintBtn.disabled = false;
        elements.excuseBtn.disabled = false;
        elements.analysisBtn.disabled = false;
        
        updateDisplay();
        startComplaintTimer();
        startExcuseTimer();
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
      // Reset to default if there's an error
      appState.isStarted = false;
    }
  }
}

// Save state to localStorage
function saveState() {
  try {
    localStorage.setItem('noComplaintChallengeApp', JSON.stringify(appState));
  } catch (error) {
    console.error('Error saving state:', error);
    showNotification('Error saving your progress. Please check your browser storage settings.');
  }
}

// Initialize the app
function init() {
  // Add event listeners
  elements.startBtn.addEventListener('click', startChallenge);
  elements.complaintBtn.addEventListener('click', handleComplaint);
  elements.excuseBtn.addEventListener('click', handleExcuse);
  elements.analysisBtn.addEventListener('click', showAnalysis);
  elements.resetBtn.addEventListener('click', resetChallenge);
  
  elements.submitComplaintCategoryBtn.addEventListener('click', submitComplaintCategory);
  elements.submitExcuseCategoryBtn.addEventListener('click', submitExcuseCategory);
  elements.submitJournalBtn.addEventListener('click', submitJournalEntry);
  
  elements.closeAnalysis.addEventListener('click', hideAnalysis);
  elements.notificationClose.addEventListener('click', () => {
    elements.notification.classList.remove('show');
  });
  
  // Tab switching
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Remove active class from all tabs
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Add active class to target tab
      this.classList.add('active');
      document.getElementById(tabId + 'Tab').classList.add('active');
    });
  });
  
  // Load saved state
  loadState();
  
  // Update display
  updateDisplay();
  
  // Show welcome notification after a short delay
  setTimeout(() => {
    showNotification("Welcome to your 21-day challenge! Ready to start?");
  }, 1000);
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);