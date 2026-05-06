// assets/js/tldr-map.js
(function () {
  'use strict';

  var allShops = window.__shops || [];
  var mappable = allShops.filter(function (s) { return s.lat && s.lng; });
  var map = null;
  var markers = {};
  var activeMarker = null;

  function pinSvg(size, fill, stroke) {
    size = size || 28;
    fill = fill || '#D4AA20';
    stroke = stroke || '#0D0D0D';
    var r = Math.round(size / 2);
    return '<svg width="' + size + '" height="' + Math.round(size * 1.25) + '" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 18 12 18s12-9 12-18C24 5.4 18.6 0 12 0z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.5"/>' +
      '<circle cx="12" cy="12" r="4" fill="' + stroke + '"/>' +
      '</svg>';
  }

  function makeIcon(active) {
    var size = active ? 32 : 24;
    return L.divIcon({
      className: '',
      html: pinSvg(size, '#D4AA20', '#0D0D0D'),
      iconSize: [size, Math.round(size * 1.25)],
      iconAnchor: [Math.round(size / 2), Math.round(size * 1.25)],
      popupAnchor: [0, -Math.round(size * 1.25)]
    });
  }

  function setActiveMarker(m) {
    if (activeMarker && activeMarker !== m) activeMarker.setIcon(makeIcon(false));
    m.setIcon(makeIcon(true));
    activeMarker = m;
  }

  // Map init
  if (window.L) {
    var mapEl = document.getElementById('tldr-map');
    if (mapEl) {
      map = L.map('tldr-map', {
        center: [44.965, -93.22],
        zoom: 12,
        scrollWheelZoom: true
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mappable.forEach(function (shop) {
        var popup = L.popup({ closeButton: false }).setContent(
          '<div style="font-family:\'DM Mono\',monospace;min-width:160px;padding:4px;">' +
          '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:18px;line-height:1;margin-bottom:4px;color:#0D0D0D;">' + shop.title + '</div>' +
          '<div style="font-size:10px;color:#D4AA20;letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;">' + (shop.city || '') + '</div>' +
          '<div style="margin-bottom:8px;">' + renderStars(shop.rating) + '</div>' +
          (shop.bestfor ? '<div style="font-family:\'DM Mono\',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#5C5A57;margin-bottom:8px;">Best For · ' + shop.bestfor + '</div>' : '') +
          '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">' +
          '<a href="' + shop.url + '" style="font-family:\'DM Mono\',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#0D0D0D;border-bottom:1px solid #D4AA20;text-decoration:none;">Read Review →</a>' +
          (shop.maps ? '<a href="' + shop.maps + '" target="_blank" rel="noopener" style="font-family:\'DM Mono\',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#D4AA20;border-bottom:1px solid #D4AA20;text-decoration:none;">Directions →</a>' : '') +
          '</div>' +
          '</div>'
        );
        var marker = L.marker([shop.lat, shop.lng], { icon: makeIcon(false), title: shop.title })
          .bindPopup(popup)
          .addTo(map);
        marker.on('click', function () {
          if (typeof rrTrack === 'function') rrTrack('map_pin_click', { shop: shop.title });
          setActiveMarker(marker);
          selectShop(shop);
        });
        markers[shop.title] = marker;
      });

      // Auto-select top-rated shop on load
      if (allShops.length > 0) {
        var top = allShops[0];
        selectShop(top);
        if (markers[top.title]) {
          setActiveMarker(markers[top.title]);
          setTimeout(function () { markers[top.title].openPopup(); }, 400);
        }
      }
    }
  }

  // Select shop — populates detail section below map
  function selectShop(shop) {
    var detail = document.getElementById('tldr-detail');
    if (!detail) return;

    // Image
    var img = document.getElementById('det-img');
    if (shop.img) {
      img.src = shop.img;
      img.alt = shop.title;
      img.style.display = 'block';
    } else {
      img.style.display = 'none';
    }

    // Text
    document.getElementById('det-hood').textContent = shop.city || '';
    document.getElementById('det-name').textContent = shop.title;

    // Best For
    var bestforEl = document.getElementById('det-bestfor');
    if (bestforEl) {
      if (shop.bestfor) {
        bestforEl.textContent = 'Best For · ' + shop.bestfor;
        bestforEl.style.display = '';
      } else {
        bestforEl.style.display = 'none';
      }
    }

    document.getElementById('det-link').href = shop.url;

    // Score bars
    var barsEl = document.getElementById('det-bars');
    barsEl.innerHTML = '';
    if (shop.scores) {
      var cats = [
        { key: 'coffee', label: 'Coffee' },
        { key: 'wifi',   label: 'Wifi' },
        { key: 'vibe',   label: 'Vibe' },
        { key: 'seating',label: 'Seating' },
        { key: 'outlet', label: 'Outlets' },
        { key: 'quiet',  label: 'Quiet' }
      ];
      cats.forEach(function (c) {
        var val = shop.scores[c.key] || 0;
        var bar = document.createElement('div');
        bar.className = 'score-bar';
        bar.innerHTML =
          '<div class="score-bar__header">' +
            '<span class="score-bar__label">' + c.label + '</span>' +
            '<span class="score-bar__value">' + val + '/5</span>' +
          '</div>' +
          '<div class="score-bar__track">' +
            '<div class="score-bar__fill" style="width:0%"></div>' +
          '</div>';
        barsEl.appendChild(bar);
      });
      setTimeout(function () {
        barsEl.querySelectorAll('.score-bar__fill').forEach(function (fill, i) {
          var val = shop.scores[cats[i].key] || 0;
          fill.style.width = ((val / 5) * 100) + '%';
        });
      }, 80);
    } else {
      barsEl.innerHTML = '<p style="font-family:\'DM Mono\',monospace;font-size:10px;color:#5C5A57;">No breakdown data yet.</p>';
    }

    // Radar
    var radarEl = document.getElementById('det-radar');
    radarEl.innerHTML = shop.scores ? buildRadar(shop.scores) : '';

    detail.style.display = 'grid';

    // Sync leaderboard highlight
    document.querySelectorAll('.leaderboard-row').forEach(function (r) {
      r.classList.toggle('is-active', r.dataset.shop === shop.title);
    });
  }

  // Leaderboard clicks
  document.querySelectorAll('.leaderboard-row').forEach(function (row, idx) {
    row.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') return;
      var shopTitle = row.dataset.shop;
      var lat = parseFloat(row.dataset.lat);
      var lng = parseFloat(row.dataset.lng);
      if (typeof rrTrack === 'function') rrTrack('leaderboard_row_click', { shop: shopTitle, rank: idx + 1 });
      var shop = null;
      for (var i = 0; i < allShops.length; i++) {
        if (allShops[i].title === shopTitle) { shop = allShops[i]; break; }
      }
      if (shop) selectShop(shop);
      if (lat && lng && map) {
        map.flyTo([lat, lng], 15, { duration: 1.2 });
        if (markers[shopTitle]) {
          setActiveMarker(markers[shopTitle]);
          setTimeout(function () { markers[shopTitle].openPopup(); }, 1300);
        }
      }
    });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); }
    });
  });

  function renderStars(rating) {
    var html = '<span style="font-size:15px;display:inline-flex;gap:3px;">';
    for (var i = 1; i <= 5; i++) {
      var filled = i <= rating;
      html += '<svg width="13" height="13" viewBox="0 0 14 14">' +
        '<polygon points="7,1 8.8,5.2 13.3,5.5 10,8.4 11,13 7,10.5 3,13 4,8.4 0.7,5.5 5.2,5.2" ' +
        'fill="' + (filled ? '#D4AA20' : 'transparent') + '" ' +
        'stroke="' + (filled ? '#D4AA20' : 'rgba(13,13,13,0.25)') + '" stroke-width="0.8"/>' +
        '</svg>';
    }
    return html + '</span>';
  }

  function buildRadar(scores) {
    var labels = ['COFFEE','WIFI','SEATING','VIBE','OUTLET','QUIET'];
    var vals = [scores.coffee||0, scores.wifi||0, scores.seating||0, scores.vibe||0, scores.outlet||0, scores.quiet||0];
    var cx = 90, cy = 90, rMax = 62;
    var out = ['<svg width="180" height="180" viewBox="0 0 180 180" style="display:block;margin:0 auto;" aria-hidden="true">'];
    for (var ring = 1; ring <= 5; ring++) {
      var rr = (ring / 5) * rMax, pts = [];
      for (var j = 0; j < 6; j++) {
        var a = (j * 60 - 90) * Math.PI / 180;
        pts.push((cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1));
      }
      out.push('<polygon points="' + pts.join(' ') + '" fill="none" stroke="rgba(13,13,13,' + (ring===5?'0.2':'0.08') + ')" stroke-width="1"/>');
    }
    for (var i = 0; i < 6; i++) {
      var ang = (i * 60 - 90) * Math.PI / 180;
      var x2 = (cx + Math.cos(ang) * rMax).toFixed(1), y2 = (cy + Math.sin(ang) * rMax).toFixed(1);
      out.push('<line x1="'+cx+'" y1="'+cy+'" x2="'+x2+'" y2="'+y2+'" stroke="rgba(13,13,13,0.12)" stroke-width="1"/>');
      var lx = (cx + Math.cos(ang) * (rMax + 14)).toFixed(1), ly = (cy + Math.sin(ang) * (rMax + 14)).toFixed(1);
      out.push('<text x="'+lx+'" y="'+ly+'" text-anchor="middle" dominant-baseline="middle" font-family="\'DM Mono\',monospace" font-size="7" fill="#5C5A57">'+labels[i]+'</text>');
    }
    var dp = vals.map(function (s, i) {
      var a = (i * 60 - 90) * Math.PI / 180, r = (Math.min(5, Math.max(0, s)) / 5) * rMax;
      return (cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1);
    }).join(' ');
    out.push('<polygon points="'+dp+'" fill="#D4AA20" fill-opacity="0.2" stroke="#D4AA20" stroke-width="1.5"/>');
    vals.forEach(function (s, i) {
      var a = (i * 60 - 90) * Math.PI / 180, r = (Math.min(5, Math.max(0, s)) / 5) * rMax;
      out.push('<circle cx="'+(cx+Math.cos(a)*r).toFixed(1)+'" cy="'+(cy+Math.sin(a)*r).toFixed(1)+'" r="3" fill="#D4AA20"/>');
    });
    out.push('</svg>');
    return out.join('');
  }
})();
