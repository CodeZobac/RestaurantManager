(function() {
  const WIDGET_CONTAINER_ID = 'restaurant-reservation-widget';

  const styles = `
    :root {
      --widget-primary-orange: #f97316;
      --widget-primary-red: #ef4444;
      --widget-text-white: #ffffff;
      --widget-bg-white: #ffffff;
      --widget-border-gray: #e5e7eb;
      --widget-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      --widget-shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .rm-fab {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      height: 4rem;
      width: 4rem;
      border-radius: 9999px;
      background-image: linear-gradient(to right, var(--widget-primary-orange), var(--widget-primary-red));
      color: var(--widget-text-white);
      box-shadow: var(--widget-shadow-lg);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s;
    }

    .rm-fab:hover {
      transform: scale(1.1);
    }

    .rm-fab-icon {
      height: 2rem;
      width: 2rem;
    }

    .rm-widget-form-container {
      position: fixed;
      bottom: 6rem;
      right: 2rem;
      width: 24rem;
      background-color: var(--widget-bg-white);
      border-radius: 0.5rem;
      box-shadow: var(--widget-shadow-lg);
      border: 1px solid var(--widget-border-gray);
      z-index: 50;
      font-family: sans-serif;
    }

    .rm-widget-form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--widget-border-gray);
    }

    .rm-widget-form-header h3 {
      font-weight: 600;
      margin: 0;
    }
    
    .rm-widget-form-close-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
    }

    .rm-widget-form {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .rm-widget-form-group {
      display: flex;
      flex-direction: column;
    }

    .rm-widget-form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .rm-widget-form-label {
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #374151;
    }

    .rm-widget-form-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--widget-border-gray);
      border-radius: 0.375rem;
      width: 100%;
      box-sizing: border-box;
    }

    .rm-widget-form-input:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      border-color: var(--widget-primary-orange);
    }

    .rm-widget-form-submit-btn {
      background-image: linear-gradient(to right, var(--widget-primary-orange), var(--widget-primary-red));
      color: var(--widget-text-white);
      border: none;
      padding: 0.75rem;
      border-radius: 0.375rem;
      cursor: pointer;
      width: 100%;
      font-weight: 600;
    }
    
    .rm-widget-form-submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .rm-widget-form-error, .rm-widget-form-success {
      padding: 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    .rm-widget-form-error {
      background-color: #fee2e2;
      border: 1px solid #f87171;
      color: #b91c1c;
    }
    
    .rm-widget-form-success {
        padding: 1.5rem;
        text-align: center;
    }

    .rm-widget-form-success h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #065f46;
        margin: 0 0 0.5rem 0;
    }

    .rm-widget-form-success p {
        font-size: 0.875rem;
        color: #4b5563;
        margin: 0;
    }
    
    .rm-widget-form-success-btn {
        margin-top: 1rem;
        background-color: #d1d5db;
        color: #1f2937;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
    }

    .rm-hidden {
      display: none;
    }
  `;

  function getFabHTML() {
    return `
      <button class="rm-fab" id="rm-fab">
        <svg class="rm-fab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
      </button>
    `;
  }

  function getFormHTML(restaurantName) {
    return `
      <div class="rm-widget-form-container rm-hidden" id="rm-form-container">
        <div class="rm-widget-form-header">
          <h3>Reserve at ${restaurantName}</h3>
          <button class="rm-widget-form-close-btn" id="rm-form-close-btn">
            <svg height="16" width="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path></svg>
          </button>
        </div>
        <div id="rm-form-wrapper">
            <form class="rm-widget-form" id="rm-reservation-form">
              <div id="rm-form-error-msg" class="rm-widget-form-error rm-hidden"></div>
              <div class="rm-widget-form-group">
                <label for="rm-customer_name" class="rm-widget-form-label">Name</label>
                <input type="text" id="rm-customer_name" name="customer_name" class="rm-widget-form-input" required>
              </div>
              <div class="rm-widget-form-group">
                <label for="rm-customer_email" class="rm-widget-form-label">Email</label>
                <input type="email" id="rm-customer_email" name="customer_email" class="rm-widget-form-input" required>
              </div>
              <div class="rm-widget-form-group">
                <label for="rm-customer_phone" class="rm-widget-form-label">Phone</label>
                <input type="tel" id="rm-customer_phone" name="customer_phone" class="rm-widget-form-input" required>
              </div>
              <div class="rm-widget-form-grid">
                <div class="rm-widget-form-group">
                  <label for="rm-reservation_date" class="rm-widget-form-label">Date</label>
                  <input type="date" id="rm-reservation_date" name="reservation_date" class="rm-widget-form-input" required>
                </div>
                <div class="rm-widget-form-group">
                  <label for="rm-reservation_time" class="rm-widget-form-label">Time</label>
                  <input type="time" id="rm-reservation_time" name="reservation_time" class="rm-widget-form-input" required>
                </div>
              </div>
              <div class="rm-widget-form-group">
                <label for="rm-party_size" class="rm-widget-form-label">Party Size</label>
                <input type="number" id="rm-party_size" name="party_size" class="rm-widget-form-input" required min="1">
              </div>
              <button type="submit" class="rm-widget-form-submit-btn" id="rm-form-submit-btn">Reserve</button>
            </form>
        </div>
        <div id="rm-form-success-msg" class="rm-widget-form-success rm-hidden">
            <h3>Reservation Successful!</h3>
            <p>Your table has been booked. You will receive a confirmation email shortly.</p>
            <button id="rm-form-success-close-btn" class="rm-widget-form-success-btn">Close</button>
        </div>
      </div>
    `;
  }

  function init() {
    const widgetContainer = document.getElementById(WIDGET_CONTAINER_ID);
    if (!widgetContainer) {
      console.error(`[Restaurant Widget] Container with id #${WIDGET_CONTAINER_ID} not found.`);
      return;
    }

    const restaurantId = widgetContainer.dataset.restaurantId;
    if (!restaurantId) {
      console.error('[Restaurant Widget] data-restaurant-id attribute not found on widget container.');
      return;
    }

    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Fetch restaurant data
    fetch(`/api/restaurants?id=${restaurantId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Restaurant not found');
        }
        return response.json();
      })
      .then(restaurant => {
        renderWidget(widgetContainer, restaurant, restaurantId);
      })
      .catch(error => {
        console.error('[Restaurant Widget] Failed to load restaurant data:', error);
        widgetContainer.innerHTML = '<p>Error loading widget.</p>';
      });
  }

  function renderWidget(container, restaurant, restaurantId) {
    container.innerHTML = getFabHTML() + getFormHTML(restaurant.name);

    const fab = document.getElementById('rm-fab');
    const formContainer = document.getElementById('rm-form-container');
    const closeBtn = document.getElementById('rm-form-close-btn');
    const reservationForm = document.getElementById('rm-reservation-form');
    const successCloseBtn = document.getElementById('rm-form-success-close-btn');

    const toggleForm = () => formContainer.classList.toggle('rm-hidden');

    fab.addEventListener('click', toggleForm);
    closeBtn.addEventListener('click', toggleForm);
    successCloseBtn.addEventListener('click', () => {
        toggleForm();
        showForm();
    });

    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleFormSubmit(reservationForm, restaurantId);
    });
  }
  
  function showSuccessMessage() {
      document.getElementById('rm-form-wrapper').classList.add('rm-hidden');
      document.getElementById('rm-form-success-msg').classList.remove('rm-hidden');
  }
  
  function showForm() {
      document.getElementById('rm-form-wrapper').classList.remove('rm-hidden');
      document.getElementById('rm-form-success-msg').classList.add('rm-hidden');
      document.getElementById('rm-reservation-form').reset();
  }

  function handleFormSubmit(form, restaurantId) {
    const submitBtn = form.querySelector('#rm-form-submit-btn');
    const errorMsgDiv = form.querySelector('#rm-form-error-msg');
    
    const originalButtonText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Reserving...';
    errorMsgDiv.classList.add('rm-hidden');

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.restaurant_id = restaurantId;
    data.party_size = parseInt(data.party_size, 10);

    fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json().then(body => ({ ok: response.ok, status: response.status, body })))
    .then(({ ok, status, body }) => {
      if (ok) {
        showSuccessMessage();
      } else {
        throw new Error(body.error || `Request failed with status ${status}`);
      }
    })
    .catch(error => {
      errorMsgDiv.innerText = error.message || 'An unknown error occurred.';
      errorMsgDiv.classList.remove('rm-hidden');
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalButtonText;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();