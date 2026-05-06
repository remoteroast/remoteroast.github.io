// assets/js/tldr-map.js
// Initialises the Leaflet map on the TL;DR page.
// Expects window.__shops to be defined by the inline Liquid script in _pages/tldr.md

(function () {
  'use strict';

  var shops = (window.__shops || []).filter(function (s) {
    return s.lat && s.lng;
  });

  if (!window.L) {
    console.warn('Leaflet not loaded — TL;DR map unavailable.');
    return;
  }

  var mapEl = document.getElementById('tldr-map');
  if (!mapEl) return;

  // Init map centered on Minneapolis
  var map = L.map('tldr-map', {
    center: [44.98, -93.27],
    zoom: 12,
    zoomControl: true,
    attributionControl: true
  });

  // Light tile theme
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Custom gold pin icon
  var goldIcon = L.divIcon({
    className: '',
    html: '<div style="width:20px;height:20px;background:#D4AA20;border:2px solid #0D0D0D;border-radius:50%;box-shadow:2px 2px 0 #0D0D0D;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14]
  });

  var markers = {};

  shops.forEach(function (shop) {
    if (!shop.lat || !shop.lng) return;

    var popupContent = [
      '<div style="font-family:\'Newsreader\',serif;min-width:180px;">',
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:18px;margin-bottom:4px;">' + shop.title + '</div>',
      '<div style="font-family:\'DM Mono\',monospace;font-size:11px;color:#5C5A57;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">' + (shop.city || '') + '</div>',
      '<div style="margin-bottom:8px;">' + renderStars(shop.rating) + '</div>',
      shop.shortcut ? '<p style="font-size:13px;margin:0 0 10px;">' + shop.shortcut + '</p>' : '',
      '<a href="' + shop.url + '" style="font-family:\'DM Mono\',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0D0D0D;text-decoration:none;border-bottom:1px solid #D4AA20;">READ FULL REVIEW →</a>',
      '</div>'
    ].join('');

    var marker = L.marker([shop.lat, shop.lng], {
      icon: goldIcon,
      title: shop.title,
      alt: shop.title + ', ' + shop.rating + ' stars'
    }).bindPopup(popupContent);

    marker.on('click', function () {
      if (typeof rrTrack === 'function') rrTrack('map_pin_click', { shop: shop.title });
    });

    marker.addTo(map);
    markers[shop.title] = marker;
  });

  // Leaderboard row → fly to map pin
  document.querySelectorAll('.leaderboard-row').forEach(function (row, idx) {
    row.addEventListener('click', function (e) {
      // If they clicked the title link, let it navigate; don't fly
      if (e.target.tagName === 'A') return;

      var lat = parseFloat(row.dataset.lat);
      var lng = parseFloat(row.dataset.lng);
      var shop = row.dataset.shop;

      if (typeof rrTrack === 'function') {
        rrTrack('leaderboard_row_click', { shop: shop, rank: idx + 1 });
      }

      if (!lat || !lng) return;

      map.flyTo([lat, lng], 15, { duration: 1.2 });

      if (markers[shop]) {
        setTimeout(function () { markers[shop].openPopup(); }, 1300);
      }

      // Highlight active row
      document.querySelectorAll('.leaderboard-row').forEach(function (r) {
        r.classList.remove('is-active');
      });
      row.classList.add('is-active');
    });

    // Keyboard accessibility
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        row.click();
      }
    });
  });

  function renderStars(rating) {
    var html = '<span style="font-size:14px;">';
    for (var i = 1; i <= 5; i++) {
      if (i <= rating) {
        html += '<span style="color:#D4AA20;">★</span>';
      } else {
        html += '<span style="color:#0D0D0D;opacity:0.18;">★</span>';
      }
    }
    html += '</span>';
    return html;
  }
})();
