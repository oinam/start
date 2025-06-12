// Sidebar management
class SidebarManager {
  constructor() {
    this.highlights = [];
    this.loadSidebarContent();
  }

  async loadSidebarContent() {
    try {
      const response = await fetch('sidebar.md');
      const markdownText = await response.text();
      this.highlights = this.parseSidebarMarkdown(markdownText);
      this.renderHighlights();
    } catch (error) {
      console.error('Error loading sidebar content:', error);
    }
  }

  parseSidebarMarkdown(markdownText) {
    const items = [];
    
    // Initialize marked parser
    if (!window.marked) {
      console.error('marked not loaded');
      return [];
    }
    
    // Parse markdown to tokens
    const tokens = marked.lexer(markdownText);
    
    // Process list tokens
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      if (token.type === 'list') {
        // Process each list item
        for (let j = 0; j < token.items.length; j++) {
          const listItem = token.items[j];
          const currentItem = {
            title: '',
            url: '',
            desc: ''
          };
          
          // Get the main text (title) from the first text token
          if (listItem.tokens && listItem.tokens.length > 0) {
            const firstToken = listItem.tokens[0];
            if (firstToken.type === 'text') {
              currentItem.title = firstToken.text.trim();
            }
          }
          
          // Process nested list for metadata
          for (let k = 0; k < listItem.tokens.length; k++) {
            const subToken = listItem.tokens[k];
            
            if (subToken.type === 'list' && subToken.items) {
              for (let l = 0; l < subToken.items.length; l++) {
                const metaItem = subToken.items[l];
                if (metaItem.tokens && metaItem.tokens.length > 0) {
                  const metaText = metaItem.tokens[0].text || '';
                  
                  if (metaText.startsWith('url:')) {
                    currentItem.url = metaText.replace('url:', '').trim();
                  } else if (metaText.startsWith('desc:')) {
                    currentItem.desc = metaText.replace('desc:', '').trim();
                  }
                }
              }
            }
          }
          
          if (this.isValidHighlight(currentItem)) {
            items.push(currentItem);
          }
        }
      }
    }
    
    return items;
  }

  isValidHighlight(item) {
    return item.title && item.url && item.desc;
  }

  renderHighlights() {
    const highlightsList = document.getElementById('highlights-list');
    if (!highlightsList) return;
    
    highlightsList.innerHTML = this.highlights.map(item => this.createHighlightHTML(item)).join('');
    
    // Add click handlers
    highlightsList.querySelectorAll('.highlight-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const url = e.currentTarget.getAttribute('data-url');
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }

  createHighlightHTML(item) {
    return `
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="highlight-item" data-url="${item.url}">
        <h4 class="highlight-title">${this.escapeHtml(item.title)}</h4>
        <p class="highlight-desc">${this.escapeHtml(item.desc)}</p>
      </a>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// View management
class ViewManager {
  constructor() {
    this.currentView = localStorage.getItem('view') || 'grid';
    this.init();
  }

  init() {
    this.applyView();
    this.updateViewIcon();
  }

  applyView() {
    const grid = document.getElementById('directory-grid');
    if (this.currentView === 'list') {
      grid.classList.add('list-view');
    } else {
      grid.classList.remove('list-view');
    }
  }

  toggle() {
    this.currentView = this.currentView === 'grid' ? 'list' : 'grid';
    localStorage.setItem('view', this.currentView);
    this.applyView();
    this.updateViewIcon();
  }

  updateViewIcon() {
    const gridIcon = document.querySelector('.grid-icon');
    const listIcon = document.querySelector('.list-icon');
    
    if (this.currentView === 'grid') {
      gridIcon.style.display = 'block';
      listIcon.style.display = 'none';
    } else {
      gridIcon.style.display = 'none';
      listIcon.style.display = 'block';
    }
  }
}

// Theme management
class ThemeManager {
  constructor() {
    this.themes = ['auto', 'light', 'dark'];
    this.currentThemeIndex = 0;
    this.init();
  }

  init() {
    // Load saved theme or default to auto
    const savedTheme = localStorage.getItem('theme') || 'auto';
    this.currentThemeIndex = this.themes.indexOf(savedTheme);
    if (this.currentThemeIndex === -1) this.currentThemeIndex = 0;
    
    this.applyTheme();
    this.updateThemeIcon();
  }

  applyTheme() {
    const theme = this.themes[this.currentThemeIndex];
    const root = document.documentElement;
    
    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
    
    localStorage.setItem('theme', theme);
  }

  toggle() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    this.applyTheme();
    this.updateThemeIcon();
  }

  updateThemeIcon() {
    const themeIcon = document.querySelector('.theme-icon');
    const theme = this.themes[this.currentThemeIndex];
    
    const svgIcons = {
      auto: '<svg class="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none"/></svg>',
      light: '<svg class="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
      dark: '<svg class="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
    };
    
    themeIcon.outerHTML = svgIcons[theme];
  }
}

// Listing data structure
class ListingManager {
  constructor() {
    this.currentCategory = 'all';
    this.data = [];
    this.filteredData = [];
    this.loadMarkdownData();
  }

  async loadMarkdownData() {
    try {
      const response = await fetch('content.md');
      const markdownText = await response.text();
      this.data = this.parseMarkdown(markdownText);
      this.filteredData = this.data;
      return true;
    } catch (error) {
      console.error('Error loading markdown content:', error);
      this.data = [];
      this.filteredData = [];
      return false;
    }
  }

  parseMarkdown(markdownText) {
    const items = [];
    
    // Initialize marked parser
    if (!window.marked) {
      console.error('marked not loaded');
      return [];
    }
    
    // Parse markdown to tokens
    const tokens = marked.lexer(markdownText);
    
    let currentSection = null;
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      // Check for section headings
      if (token.type === 'heading' && token.depth === 1) {
        currentSection = token.text;
      }
      
      // Process list tokens
      if (token.type === 'list' && currentSection) {
        // Process each list item
        for (let j = 0; j < token.items.length; j++) {
          const listItem = token.items[j];
          const currentItem = {
            category: currentSection,
            type: this.mapCategoryToType(currentSection),
            tags: [],
            title: '',
            url: '',
            created: '',
            description: ''
          };
          
          // Get the main text (title) from the first text token
          if (listItem.tokens && listItem.tokens.length > 0) {
            const firstToken = listItem.tokens[0];
            if (firstToken.type === 'text') {
              currentItem.title = firstToken.text.trim();
            }
          }
          
          // Process nested list for metadata
          for (let k = 0; k < listItem.tokens.length; k++) {
            const subToken = listItem.tokens[k];
            
            if (subToken.type === 'list' && subToken.items) {
              for (let l = 0; l < subToken.items.length; l++) {
                const metaItem = subToken.items[l];
                if (metaItem.tokens && metaItem.tokens.length > 0) {
                  const metaText = metaItem.tokens[0].text || '';
                  
                  if (metaText.startsWith('url:')) {
                    currentItem.url = metaText.replace('url:', '').trim();
                  } else if (metaText.startsWith('tags:')) {
                    const tagsString = metaText.replace('tags:', '').trim();
                    currentItem.tags = tagsString.split(',').map(tag => tag.trim());
                  } else if (metaText.startsWith('date:')) {
                    currentItem.created = metaText.replace('date:', '').trim();
                  } else if (metaText.startsWith('desc:')) {
                    currentItem.description = metaText.replace('desc:', '').trim();
                  }
                }
              }
            }
          }
          
          if (this.isValidItem(currentItem)) {
            items.push(currentItem);
          }
        }
      }
    }
    
    return items;
  }

  isValidItem(item) {
    return item.title && item.url && item.category && item.description;
  }

  mapCategoryToType(category) {
    const typeMap = {
      'projects': 'project',
      'articles': 'article',
      'tutorials': 'tutorial',
      'templates': 'template',
      'design': 'design',
      'resources': 'resource'
    };
    return typeMap[category] || 'project';
  }

  getCurrentItems() {
    if (this.currentCategory === 'all') {
      return this.data;
    }
    return this.data.filter(item => item.category === this.currentCategory);
  }

  navigateToCategory(category) {
    this.currentCategory = category;
    this.filteredData = this.getCurrentItems();
    return true;
  }

  search(query) {
    if (!query.trim()) {
      this.filteredData = this.getCurrentItems();
      return this.filteredData;
    }

    const searchTerm = query.toLowerCase();
    this.filteredData = this.getCurrentItems().filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    return this.filteredData;
  }

  getFilteredItems() {
    return this.filteredData;
  }

  getCategories() {
    const categories = [...new Set(this.data.map(item => item.category))];
    return ['all', ...categories];
  }
}

// UI Manager
class UIManager {
  constructor(listingManager) {
    this.listingManager = listingManager;
    this.searchInput = document.getElementById('search-input');
    this.listingGrid = document.getElementById('directory-grid');
    this.emptyState = document.getElementById('empty-state');
    this.categoryNav = document.querySelector('.breadcrumb');
    
    this.init();
    this.updateSidebarStats();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Search functionality
    this.searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      this.listingManager.search(query);
      this.render();
    });

    // Clear search when navigating
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.searchInput.value = '';
        this.listingManager.search('');
        this.render();
        this.searchInput.blur();
      }
    });

    // Global keyboard shortcut for search
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.searchInput.focus();
        this.searchInput.select();
      }
    });

    // Update shortcut display based on platform
    this.updateShortcutDisplay();
  }

  updateShortcutDisplay() {
    const shortcutElement = document.querySelector('.search-shortcut');
    const placeholder = document.querySelector('#search-input');
    
    if (shortcutElement && placeholder) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const shortcutText = isMac ? '⌘ K' : 'Ctrl + K';
      const placeholderText = isMac ? 
        'Search projects, articles, tutorials... (⌘ K)' : 
        'Search projects, articles, tutorials... (Ctrl + K)';
      
      shortcutElement.textContent = shortcutText;
      placeholder.placeholder = placeholderText;
    }
  }

  render() {
    this.renderCategoryNav();
    this.renderListingItems();
    
    // Apply current view mode
    if (window.viewManager) {
      window.viewManager.applyView();
    }
  }

  renderCategoryNav() {
    const categories = this.listingManager.getCategories();
    
    this.categoryNav.innerHTML = categories.map(category => {
      const isActive = category === this.listingManager.currentCategory;
      const displayName = category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1);
      
      return `
        <button class="breadcrumb-item ${isActive ? 'active' : ''}" data-category="${category}">
          ${displayName}
        </button>
      `;
    }).join('');

    // Add click handlers for category navigation
    this.categoryNav.querySelectorAll('.breadcrumb-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const category = e.currentTarget.getAttribute('data-category');
        if (this.listingManager.navigateToCategory(category)) {
          this.searchInput.value = '';
          this.listingManager.search('');
          this.render();
        }
      });
    });
  }



  renderListingItems() {
    const items = this.listingManager.getFilteredItems();
    
    if (items.length === 0) {
      this.listingGrid.style.display = 'none';
      this.emptyState.style.display = 'flex';
      return;
    }

    this.listingGrid.style.display = 'grid';
    this.emptyState.style.display = 'none';

    this.listingGrid.innerHTML = items.map(item => this.createItemHTML(item)).join('');

    // Add click handlers for listing items
    this.listingGrid.querySelectorAll('.listing-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const url = e.currentTarget.getAttribute('data-url');
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }

  createItemHTML(item) {
    // Use the ViewManager's current view state if available
    const viewMode = window.viewManager ? window.viewManager.currentView : (localStorage.getItem('view') || 'grid');
    
    if (viewMode === 'list') {
      return `
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="listing-item" data-url="${item.url}">
          <div class="item-content">
            <h3 class="item-title">${this.escapeHtml(item.title)}</h3>
            <p class="item-description">${this.escapeHtml(item.description)}</p>
            <span class="item-type">${this.escapeHtml(item.category)}</span>
            <span class="item-created">${item.created}</span>
          </div>
        </a>
      `;
    }
    
    return `
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="listing-item" data-url="${item.url}">
        <div class="item-content">
          <h3 class="item-title">${this.escapeHtml(item.title)}</h3>
          <p class="item-description">${this.escapeHtml(item.description)}</p>
          <div class="item-meta">
            <span class="item-type">${item.type}</span>
            <span class="item-created">${item.created}</span>
          </div>
        </div>
      </a>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize sidebar manager
  const sidebarManager = new SidebarManager();
  
  // Initialize view manager
  const viewManager = new ViewManager();
  window.viewManager = viewManager;
  
  // View toggle button
  const viewToggle = document.getElementById('view-toggle');
  viewToggle.addEventListener('click', () => {
    viewManager.toggle();
    // Re-render the items with the new view
    if (window.uiManager) {
      window.uiManager.render();
    }
  });

  // Initialize theme manager
  const themeManager = new ThemeManager();
  
  // Theme toggle button
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    themeManager.toggle();
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themeManager.themes[themeManager.currentThemeIndex] === 'auto') {
      themeManager.applyTheme();
    }
  });

  // Initialize listing manager and UI
  const listingManager = new ListingManager();
  
  // Wait for data to load before initializing UI
  listingManager.loadMarkdownData().then(() => {
    const uiManager = new UIManager(listingManager);
    
    // Make uiManager globally available
    window.uiManager = uiManager;
  });
});