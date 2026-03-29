const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend/src/styles/amazon-ui.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Strip out the previous fix using regex to start fresh for the sidebar.
// The previous fix started at /* ==============================================================
//    SIDEBAR FIX - DESKTOP FIRST RESPONSIVE
//    ============================================================== */
const marker = "/* ==============================================================\n   SIDEBAR FIX - DESKTOP FIRST RESPONSIVE\n   ============================================================== */";

if (css.includes(marker)) {
  css = css.split(marker)[0];
}

// Ensure .amz-hamburger-btn is visible globally
css = css.replace(/\.amz-hamburger-btn\s*\{\s*display:\s*none;/g, '.amz-hamburger-btn {\n  /* display: none removed so visible on desktop */');

const newCSS = `
${marker}

/* STEP 1: DESKTOP SIDEBAR (DEFAULT) */
.amz-sub-nav.sidebar {
  width: 260px;
  height: 100vh;
  position: fixed; /* Using fixed as discussed instead of relative to preserve layout sanity */
  left: 0;
  top: 60px; /* Offset to not cover the navbar */
  background: #232f3e;
  transition: width 0.3s ease;
  z-index: 900;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent text overflow during transition */
}

.amz-sub-nav.sidebar.collapsed {
  width: 70px;
}

/* Hide texts and show icons cleanly when collapsed */
.amz-sub-nav.sidebar.collapsed .sidebar-item {
  color: transparent;
  white-space: nowrap;
}
.amz-sub-nav.sidebar.collapsed .sidebar-item::before {
  content: '🏷️ ';
  color: white;
  margin-right: -100px;
}
.amz-sub-nav.sidebar.collapsed h3 {
  color: transparent;
  white-space: nowrap;
}
.amz-sub-nav.sidebar.collapsed .sidebar-user-block,
.amz-sub-nav.sidebar.collapsed .sidebar-close {
  display: none !important;
}

/* MAIN-CONTENT LAYOUT (Requires App.jsx wrapper) */
.main-content {
  margin-left: 260px;
  transition: margin-left 0.3s ease;
  padding: 20px;
}

.main-content.expanded {
  margin-left: 70px;
}

/* STEP 4: SIDEBAR CONTENT STRUCTURE */
.sidebar-body { /* Maps to user's .sidebar-content */
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

/* STEP 5: TOUCH-FRIENDLY ITEMS */
.sidebar-item {
  padding: 14px 16px;
  font-size: 15px;
  display: block;
  border-bottom: 1px solid #3a4b5c; /* Subtler border for dark mode */
  color: white;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* STEP 6: CLOSE BUTTON (IMPORTANT UX) */
.sidebar-close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 20px;
  cursor: pointer;
  background: transparent;
  border: none;
  color: white;
  padding: 5px;
}

/* OVERLAY DEFAULT */
.amz-sidebar-overlay {
  display: none;
}

/* HEADER overrides for dark mode */
.sidebar-header {
  background: #131a22; /* darker shade for amazon feel */
  color: white;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  min-height: 50px;
  position: relative;
}

/* MOBILE RESPONSIVE OVERRIDES */
/* STEP 2 & 3: MOBILE SIDEBAR & OVERLAY */
@media (max-width: 768px) {
  .amz-sub-nav.sidebar {
    position: fixed;
    top: 0; /* Fully covers navbar on mobile */
    left: 0;
    width: 80% !important; /* 🔥 KEY FIX */
    max-width: 320px;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 2200; /* Must pop ABOVE navbar on mobile */
  }

  .amz-sub-nav.sidebar.open {
    transform: translateX(0);
  }

  .amz-sidebar-overlay {
    display: none; /* Let React strictly toggle if rendered, but we enforce fixed styles */
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 2199;
  }
  
  .amz-sidebar-overlay.open {
    display: block;
  }

  .main-content {
    margin-left: 0 !important;
  }
}
`;

fs.writeFileSync(cssPath, css + newCSS);
console.log('CSS refactoring completed.');
