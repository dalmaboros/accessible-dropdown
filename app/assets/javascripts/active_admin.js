//= require active_admin/base

// ActiveAdmin Dropdown Accessibility Patch
// Makes ActiveAdmin dropdown menus 508 compliant and keyboard accessible

(function() {
  'use strict';
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('ActiveAdmin Accessibility Patch: DOM ready');
    // Patch ActiveAdmin dropdown menus
    patchActiveAdminDropdowns();
    
    // Safari-specific tab handling
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      console.log('ActiveAdmin Accessibility Patch: Safari detected, applying Safari-specific fixes');
      applySafariFixes();
    }
  });
  
  function applySafariFixes() {
    // Safari needs explicit tabindex attributes for proper tab navigation
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    
    focusableElements.forEach(function(element) {
      // Ensure all focusable elements have proper tabindex
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
      
      // Add Safari-specific focus handling
      element.addEventListener('focus', function(e) {
        // Ensure focus is visible in Safari
        this.style.outline = '2px solid #007bff';
        this.style.outlineOffset = '2px';
      });
      
      element.addEventListener('blur', function(e) {
        // Remove focus styling when element loses focus
        this.style.outline = '';
        this.style.outlineOffset = '';
      });
    });
    
    // Fix Safari's issue with programmatic focus
    const originalFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function(options) {
      // Ensure focus works properly in Safari
      if (this.setActive) {
        this.setActive();
      }
      return originalFocus.call(this, options);
    };
    
    // Additional Safari fixes for ActiveAdmin specific elements
    const activeAdminElements = document.querySelectorAll('.header a, .header button, #sidebar a, #sidebar button, .tabs a, .meta a');
    activeAdminElements.forEach(function(element) {
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
    });
    
    // Fix Safari's issue with keyboard navigation in dropdowns
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        // Ensure tab navigation works in Safari
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('dropdown')) {
          // Handle tab navigation within dropdowns
          e.preventDefault();
          const nextElement = activeElement.nextElementSibling || activeElement.parentElement.nextElementSibling;
          if (nextElement) {
            nextElement.focus();
          }
        }
      }
    });
  }
  
  function patchActiveAdminDropdowns() {
    console.log('ActiveAdmin Accessibility Patch: Starting patch');
    
    // First, try to patch ActiveAdmin's specific menu structure
    patchActiveAdminMenus();
    
    // Target ActiveAdmin's dropdown containers - expanded selectors
    const dropdownSelectors = [
      // Standard ActiveAdmin dropdowns
      '.dropdown_menu',
      '.dropdown-menu',
      '.dropdown',
      
      // Header dropdown menus
      '.header .tabs .dropdown',
      '.header .tabs .dropdown_menu',
      '.header .tabs .dropdown-menu',
      '.header .meta .dropdown',
      '.header .meta .dropdown_menu',
      '.header .meta .dropdown-menu',
      
      // Sidebar dropdown menus
      '#sidebar .dropdown',
      '#sidebar .dropdown_menu',
      '#sidebar .dropdown-menu',
      
      // Any element with dropdown behavior
      '[data-dropdown]',
      '[class*="dropdown"]',
      
      // ActiveAdmin specific dropdowns
      '.tabs .dropdown',
      '.meta .dropdown',
      '.header .dropdown'
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
    
    console.log('ActiveAdmin Accessibility Patch: Making dropdown accessible', dropdown);
    
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
    
    // Special handling for ActiveAdmin sidebar dropdowns
    if (dropdown.closest('#sidebar')) {
      handleActiveAdminSidebarDropdown(dropdown, trigger, menu);
    }
  }
  
  function handleActiveAdminSidebarDropdown(dropdown, trigger, menu) {
    console.log('ActiveAdmin Accessibility Patch: Handling sidebar dropdown');
    
    // Make the dropdown container focusable
    dropdown.setAttribute('tabindex', '0');
    
    // Show menu items when dropdown is focused
    dropdown.addEventListener('focus', function() {
      console.log('ActiveAdmin Accessibility Patch: Dropdown focused, showing menu');
      showDropdownMenu(menu);
    });
    
    // Hide menu items when dropdown loses focus
    dropdown.addEventListener('blur', function(e) {
      // Check if focus is moving to a child element
      if (!dropdown.contains(e.relatedTarget)) {
        console.log('ActiveAdmin Accessibility Patch: Dropdown lost focus, hiding menu');
        hideDropdownMenu(menu);
      }
    });
    
    // Handle keyboard navigation within the dropdown
    dropdown.addEventListener('keydown', function(e) {
      const menuItems = menu.querySelectorAll('a, li a');
      
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (menuItems.length > 0) {
            menuItems[0].focus();
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (menuItems.length > 0) {
            menuItems[0].focus();
          }
          break;
      }
    });
  }
  
  function showDropdownMenu(menu) {
    menu.style.display = 'block';
    menu.style.visibility = 'visible';
    menu.style.opacity = '1';
    menu.setAttribute('aria-hidden', 'false');
  }
  
  function hideDropdownMenu(menu) {
    menu.style.display = 'none';
    menu.style.visibility = 'hidden';
    menu.style.opacity = '0';
    menu.setAttribute('aria-hidden', 'true');
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
  
  function patchActiveAdminMenus() {
    console.log('ActiveAdmin Accessibility Patch: Patching ActiveAdmin menus');
    
    // Debug: Log all elements with dropdown-related classes
    const allElements = document.querySelectorAll('*');
    const dropdownElements = [];
    
    allElements.forEach(function(element) {
      if (element.className && typeof element.className === 'string') {
        if (element.className.includes('dropdown') || 
            element.className.includes('menu') ||
            element.className.includes('nav')) {
          dropdownElements.push({
            element: element,
            className: element.className,
            tagName: element.tagName,
            id: element.id
          });
        }
      }
    });
    
    console.log('ActiveAdmin Accessibility Patch: Found dropdown-related elements:', dropdownElements);
    
    // Look for ActiveAdmin's menu structure
    const sidebar = document.querySelector('#sidebar');
    if (!sidebar) {
      console.log('ActiveAdmin Accessibility Patch: No sidebar found');
      return;
    }
    
    // Find all menu items that have children (dropdowns)
    const menuItems = sidebar.querySelectorAll('li');
    console.log('ActiveAdmin Accessibility Patch: Found menu items:', menuItems.length);
    
    menuItems.forEach(function(menuItem, index) {
      console.log('ActiveAdmin Accessibility Patch: Menu item', index, menuItem);
      const submenu = menuItem.querySelector('ul');
      if (submenu) {
        console.log('ActiveAdmin Accessibility Patch: Found menu with submenu', menuItem);
        makeActiveAdminMenuAccessible(menuItem, submenu);
      }
    });
  }
  
  function makeActiveAdminMenuAccessible(menuItem, submenu) {
    // Make the menu item focusable
    menuItem.setAttribute('tabindex', '0');
    menuItem.setAttribute('role', 'menuitem');
    menuItem.setAttribute('aria-haspopup', 'true');
    menuItem.setAttribute('aria-expanded', 'false');
    
    // Set up the submenu
    submenu.setAttribute('role', 'menu');
    submenu.setAttribute('aria-hidden', 'true');
    submenu.style.display = 'none';
    
    // Make submenu items focusable
    const submenuItems = submenu.querySelectorAll('a');
    submenuItems.forEach(function(item) {
      item.setAttribute('tabindex', '-1');
      item.setAttribute('role', 'menuitem');
    });
    
    // Handle focus events
    menuItem.addEventListener('focus', function() {
      console.log('ActiveAdmin Accessibility Patch: Menu item focused');
      showSubmenu(submenu);
      menuItem.setAttribute('aria-expanded', 'true');
    });
    
    menuItem.addEventListener('blur', function(e) {
      // Only hide if focus is not moving to a child
      if (!menuItem.contains(e.relatedTarget)) {
        console.log('ActiveAdmin Accessibility Patch: Menu item lost focus');
        hideSubmenu(submenu);
        menuItem.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Handle keyboard navigation
    menuItem.addEventListener('keydown', function(e) {
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (submenuItems.length > 0) {
            submenuItems[0].focus();
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (submenuItems.length > 0) {
            submenuItems[0].focus();
          }
          break;
      }
    });
    
    // Handle submenu keyboard navigation
    submenu.addEventListener('keydown', function(e) {
      const currentIndex = Array.from(submenuItems).indexOf(document.activeElement);
      
      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % submenuItems.length;
          submenuItems[nextIndex].focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = currentIndex <= 0 ? submenuItems.length - 1 : currentIndex - 1;
          submenuItems[prevIndex].focus();
          break;
        case 'Escape':
          e.preventDefault();
          menuItem.focus();
          hideSubmenu(submenu);
          menuItem.setAttribute('aria-expanded', 'false');
          break;
      }
    });
  }
  
  function showSubmenu(submenu) {
    submenu.style.display = 'block';
    submenu.setAttribute('aria-hidden', 'false');
  }
  
  function hideSubmenu(submenu) {
    submenu.style.display = 'none';
    submenu.setAttribute('aria-hidden', 'true');
  }
  
  // Export for use in other scripts
  window.ActiveAdminDropdownPatch = {
    patch: patchActiveAdminDropdowns,
    makeAccessible: makeDropdownAccessible
  };
  
})();
