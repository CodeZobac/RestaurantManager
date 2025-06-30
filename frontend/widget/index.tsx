import React from 'react';
import ReactDOM from 'react-dom/client';
import { Widget } from '../components/widget/widget';

const widgetDiv = document.getElementById('restaurant-reservation-widget');

if (widgetDiv) {
  const restaurantId = widgetDiv.dataset.restaurantId;
  if (restaurantId) {
    const root = ReactDOM.createRoot(widgetDiv);
    root.render(
      <React.StrictMode>
        <Widget restaurantId={restaurantId} />
      </React.StrictMode>
    );
  } else {
    console.error('Restaurant ID not found on widget container.');
  }
} else {
  console.error('Widget container not found.');
}
