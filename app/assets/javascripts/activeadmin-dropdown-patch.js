// ActiveAdmin Dropdown Accessibility Patch
// Makes ActiveAdmin dropdown menus 508 compliant and keyboard accessible
// This can be included in ActiveAdmin's application.js or as a separate file

(function() {
  'use strict';
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Patch ActiveAdmin dropdown menus
    patchActiveAdminDropdowns();
  });
  
  function patchActiveAdminDropdowns() {
    // Target ActiveAdmin's dropdown containers
    // These selectors should match ActiveAdmin's dropdown structure
    const dropdownSelectors = [
      '.dropdown_menu',           // Standard ActiveAdmin dropdown
      '.dropdown-menu',           // Alternative class name
      '.header .tabs .dropdown',  // Header dropdown menus
      '.header .tabs .dropdown_menu',
      '.header .tabs .dropdown-menu',
      '.header .meta .dropdown',
      '.header .meta .dropdown_menu',
      '.header .meta .dropdown-menu'
    ];
    
    dropdownSelectors.forEach(function(selector) {
      const dropdowns = document.querySelectorAll(selector);
      dropdowns.forEach(function(dropdown) {
        makeDropdownAccessible(dropdown);
      });
    });
    
    // Also patch any dynamically added dropdowns
    observeForNewDropdowns();
  }
  
  function makeDropdownAccessible(dropdown) {
    // Skip if already patched
    if (dropdown.dataset.accessiblePatched) return;
    
    const trigger = findDropdownTrigger(dropdown);
    const menu = findDropdownMenu(dropdown);
    
    if (!trigger || !menu) return;
    
    // Mark as patched
    dropdown.dataset.accessiblePatched = 'true';
    
    let isOpen = false;
    let currentFocusIndex = -1;
    let menuItems = [];
    
    // Initialize accessibility attributes
    function initializeAccessibility() {
      // Set ARIA attributes on trigger
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      
      // Set ARIA attributes on menu
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-hidden', 'true');
      
      // Get menu items and set their attributes
      menuItems = menu.querySelectorAll('a, button, [role="menuitem"]');
      menuItems.forEach(function(item, index) {
        item.setAttribute('role', 'menuitem');
        item.setAttribute('tabindex', '-1');
      });
    }
    
    // Toggle dropdown function
    function toggleDropdown(show) {
      isOpen = show;
      
      // Update ARIA attributes
      trigger.setAttribute('aria-expanded', show.toString());
      menu.setAttribute('aria-hidden', (!show).toString());
      
      if (show) {
        // Show menu (ActiveAdmin might have its own show logic)
        if (typeof dropdown.show === 'function') {
          dropdown.show();
        } else {
          menu.style.display = 'block';
          menu.style.visibility = 'visible';
        }
        
        // Focus first menu item
        if (menuItems.length > 0) {
          currentFocusIndex = 0;
          menuItems[0].focus();
        }
      } else {
        // Hide menu (ActiveAdmin might have its own hide logic)
        if (typeof dropdown.hide === 'function') {
          dropdown.hide();
        } else {
          menu.style.display = 'none';
          menu.style.visibility = 'hidden';
        }
        
        currentFocusIndex = -1;
        // Return focus to trigger
        trigger.focus();
      }
    }
    
    // Handle trigger events
    function handleTriggerEvents() {
      // Click event
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown(!isOpen);
      });
      
      // Keyboard events
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
    }
    
    // Handle menu keyboard events
    function handleMenuEvents() {
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
            toggleDropdown(false);
            break;
        }
      });
      
      // Handle menu item events
      menuItems.forEach(function(item) {
        item.addEventListener('click', function() {
          toggleDropdown(false);
        });
        
        item.addEventListener('focus', function() {
          currentFocusIndex = Array.from(menuItems).indexOf(item);
        });
      });
    }
    
    // Close dropdown when clicking outside
    function handleOutsideClicks() {
      document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
          toggleDropdown(false);
        }
      });
    }
    
    // Initialize everything
    initializeAccessibility();
    handleTriggerEvents();
    handleMenuEvents();
    handleOutsideClicks();
  }
  
  // Helper functions to find dropdown elements
  function findDropdownTrigger(dropdown) {
    // Common ActiveAdmin trigger selectors
    const triggerSelectors = [
      '.dropdown_button',
      '.dropdown-button',
      '.dropdown-toggle',
      'button',
      'a[href="#"]',
      '[data-toggle="dropdown"]'
    ];
    
    for (let selector of triggerSelectors) {
      const trigger = dropdown.querySelector(selector);
      if (trigger) return trigger;
    }
    
    // Fallback: first clickable element
    return dropdown.querySelector('button, a, [onclick]');
  }
  
  function findDropdownMenu(dropdown) {
    // Common ActiveAdmin menu selectors
    const menuSelectors = [
      '.dropdown_menu',
      '.dropdown-menu',
      '.dropdown_list',
      '.dropdown-list',
      'ul',
      '.menu'
    ];
    
    for (let selector of menuSelectors) {
      const menu = dropdown.querySelector(selector);
      if (menu) return menu;
    }
    
    // Fallback: any element that might be a menu
    return dropdown.querySelector('ul, .menu, [role="menu"]');
  }
  
  // Observe for dynamically added dropdowns
  function observeForNewDropdowns() {
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is a dropdown
              if (node.matches && node.matches('.dropdown, .dropdown_menu, .dropdown-menu')) {
                makeDropdownAccessible(node);
              }
              
              // Check for dropdowns within the added node
              const dropdowns = node.querySelectorAll && node.querySelectorAll('.dropdown, .dropdown_menu, .dropdown-menu');
              if (dropdowns) {
                dropdowns.forEach(function(dropdown) {
                  makeDropdownAccessible(dropdown);
                });
              }
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
  
  // Export for use in other scripts
  window.ActiveAdminDropdownPatch = {
    patch: patchActiveAdminDropdowns,
    makeAccessible: makeDropdownAccessible
  };
  
})();

