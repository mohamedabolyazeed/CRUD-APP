/**
 * Main Client-Side JavaScript
 * Handles common functionality across the application
 */

// Utility Functions
const Utils = {
  // Show notification
  showNotification: (message, type = "info") => {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  },

  // Confirm action
  confirmAction: (message) => {
    return confirm(message);
  },

  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString();
  },

  // Validate email
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

// Form Handling
const FormHandler = {
  // Initialize form validation
  init: () => {
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      form.addEventListener("submit", FormHandler.handleSubmit);
    });
  },

  // Handle form submission
  handleSubmit: (e) => {
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing...";
    }
  },

  // Reset form
  reset: (formId) => {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
  },

  // Validate required fields
  validateRequired: (form) => {
    const requiredFields = form.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.classList.add("error");
        isValid = false;
      } else {
        field.classList.remove("error");
      }
    });

    return isValid;
  },
};

// Table Handling
const TableHandler = {
  // Initialize table functionality
  init: () => {
    const tables = document.querySelectorAll(".data-table");
    tables.forEach((table) => {
      TableHandler.addSorting(table);
      TableHandler.addSearch(table);
    });
  },

  // Add sorting functionality
  addSorting: (table) => {
    const headers = table.querySelectorAll("th[data-sort]");
    headers.forEach((header) => {
      header.addEventListener("click", () => {
        TableHandler.sortTable(table, header.dataset.sort);
      });
    });
  },

  // Sort table
  sortTable: (table, column) => {
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      const aValue = a.querySelector(`td[data-${column}]`).textContent;
      const bValue = b.querySelector(`td[data-${column}]`).textContent;
      return aValue.localeCompare(bValue);
    });

    rows.forEach((row) => tbody.appendChild(row));
  },

  // Add search functionality
  addSearch: (table) => {
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search...";
    searchInput.className = "table-search";

    table.parentNode.insertBefore(searchInput, table);

    searchInput.addEventListener(
      "input",
      Utils.debounce(() => {
        TableHandler.filterTable(table, searchInput.value);
      }, 300)
    );
  },

  // Filter table
  filterTable: (table, searchTerm) => {
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      const match = text.includes(searchTerm.toLowerCase());
      row.style.display = match ? "" : "none";
    });
  },
};

// Modal Handling
const ModalHandler = {
  // Show modal
  show: (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "block";
      modal.classList.add("show");
    }
  },

  // Hide modal
  hide: (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("show");
      setTimeout(() => {
        modal.style.display = "none";
      }, 300);
    }
  },

  // Initialize modals
  init: () => {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      const closeBtn = modal.querySelector(".modal-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          ModalHandler.hide(modal.id);
        });
      }

      // Close on outside click
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          ModalHandler.hide(modal.id);
        }
      });
    });
  },
};

// Animation Handler
const AnimationHandler = {
  // Initialize animations
  init: () => {
    AnimationHandler.observeElements();
    AnimationHandler.addScrollAnimations();
  },

  // Observe elements for animations
  observeElements: () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    });

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));
  },

  // Add scroll animations
  addScrollAnimations: () => {
    window.addEventListener(
      "scroll",
      Utils.debounce(() => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector(".parallax");

        if (parallax) {
          const speed = scrolled * 0.5;
          parallax.style.transform = `translateY(${speed}px)`;
        }
      }, 10)
    );
  },
};

// API Handler
const APIHandler = {
  // Make API request
  request: async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  },

  // GET request
  get: (url) => APIHandler.request(url),

  // POST request
  post: (url, data) =>
    APIHandler.request(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // PUT request
  put: (url, data) =>
    APIHandler.request(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // DELETE request
  delete: (url) =>
    APIHandler.request(url, {
      method: "DELETE",
    }),
};

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Client-side JavaScript initialized");

  // Initialize all handlers
  FormHandler.init();
  TableHandler.init();
  ModalHandler.init();
  AnimationHandler.init();

  // Add global event listeners
  document.addEventListener("click", (e) => {
    // Handle delete confirmations
    if (e.target.classList.contains("delete-btn")) {
      if (!Utils.confirmAction("Are you sure you want to delete this item?")) {
        e.preventDefault();
      }
    }
  });

  // Handle flash messages
  const flashMessages = document.querySelectorAll(".alert");
  flashMessages.forEach((message) => {
    setTimeout(() => {
      message.style.opacity = "0";
      setTimeout(() => message.remove(), 300);
    }, 5000);
  });

  // Add loading states to buttons
  const buttons = document.querySelectorAll('button[type="submit"]');
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.form && FormHandler.validateRequired(button.form)) {
        button.disabled = true;
        button.textContent = "Processing...";
      }
    });
  });
});

// Export for use in other scripts
window.AppUtils = Utils;
window.AppFormHandler = FormHandler;
window.AppTableHandler = TableHandler;
window.AppModalHandler = ModalHandler;
window.AppAnimationHandler = AnimationHandler;
window.AppAPIHandler = APIHandler;
