// Accessible Dropdown Menu Implementation
// 508 Compliant and Keyboard Accessible

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all dropdown menus
  const dropdowns = document.querySelectorAll('[data-dropdown]');
  
  dropdowns.forEach(function(dropdown) {
    const trigger = dropdown.querySelector('[data-dropdown-trigger]');
    const menu = dropdown.querySelector('[data-dropdown-menu]');
    const menuItems = menu.querySelectorAll('a, button, [tabindex="0"]');
    
    if (!trigger || !menu) return;
    
    let isOpen = false;
    let currentFocusIndex = -1;
    
    // Set initial ARIA attributes
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-hidden', 'true');
    
    // Set menu items ARIA attributes
    menuItems.forEach(function(item, index) {
      item.setAttribute('role', 'menuitem');
      item.setAttribute('tabindex', '-1');
    });
    
    // Toggle dropdown function
    function toggleDropdown(show) {
      isOpen = show;
      trigger.setAttribute('aria-expanded', show.toString());
      menu.setAttribute('aria-hidden', (!show).toString());
      
      if (show) {
        menu.classList.add('dropdown-open');
        // Focus first menu item when opening
        if (menuItems.length > 0) {
          currentFocusIndex = 0;
          menuItems[0].focus();
        }
      } else {
        menu.classList.remove('dropdown-open');
        currentFocusIndex = -1;
        // Return focus to trigger when closing
        trigger.focus();
      }
    }
    
    // Handle trigger click
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(!isOpen);
    });
    
    // Handle trigger keyboard events
    trigger.addEventListener('keydown', function(e) {
      switch(e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          toggleDropdown(!isOpen);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            toggleDropdown(true);
          } else {
            // Move to first menu item
            currentFocusIndex = 0;
            menuItems[0].focus();
          }
          break;
        case 'Escape':
          if (isOpen) {
            toggleDropdown(false);
          }
          break;
      }
    });
    
    // Handle menu keyboard events
    menu.addEventListener('keydown', function(e) {
      if (!isOpen) return;
      
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          currentFocusIndex = (currentFocusIndex + 1) % menuItems.length;
          menuItems[currentFocusIndex].focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          currentFocusIndex = currentFocusIndex <= 0 ? menuItems.length - 1 : currentFocusIndex - 1;
          menuItems[currentFocusIndex].focus();
          break;
        case 'Home':
          e.preventDefault();
          currentFocusIndex = 0;
          menuItems[0].focus();
          break;
        case 'End':
          e.preventDefault();
          currentFocusIndex = menuItems.length - 1;
          menuItems[currentFocusIndex].focus();
          break;
        case 'Escape':
          e.preventDefault();
          toggleDropdown(false);
          break;
        case 'Tab':
          // Close dropdown on tab
          toggleDropdown(false);
          break;
      }
    });
    
    // Handle menu item click
    menuItems.forEach(function(item) {
      item.addEventListener('click', function() {
        toggleDropdown(false);
      });
      
      // Handle menu item focus
      item.addEventListener('focus', function() {
        currentFocusIndex = Array.from(menuItems).indexOf(item);
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!dropdown.contains(e.target)) {
        toggleDropdown(false);
      }
    });
    
    // Handle hover for mouse users (optional enhancement)
    let hoverTimeout;
    
    trigger.addEventListener('mouseenter', function() {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        if (!isOpen) toggleDropdown(true);
      }, 150);
    });
    
    dropdown.addEventListener('mouseleave', function() {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        if (isOpen) toggleDropdown(false);
      }, 150);
    });
  });
});


