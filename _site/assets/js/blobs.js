// assets/js/blobs.js
// Blob/parallax system — ported verbatim from design_handoff_v2/designs/03-individual-review.html
// Blob configs from 01-homepage.html (13 shapes: 10 organic + 3 star).
// Colors: PORT_NOTES.md token values (not mock's prototype colors).

// ── Shape generators ─────────────────────────────────────────────────────────

function organicBlob(cx, cy, avgR, v, seed) {
  seed = seed || 0;
  var n = v.length;
  var pts = v.map(function (vv, i) {
    var a = (i / n) * Math.PI * 2 + seed;
    return [cx + Math.cos(a) * avgR * vv, cy + Math.sin(a) * avgR * vv];
  });
  function cp(a, b, c, t) {
    t = t || 0.35;
    var dx = c[0] - a[0], dy = c[1] - a[1];
    return [b[0] - dx * t, b[1] - dy * t, b[0] + dx * t, b[1] + dy * t];
  }
  var d = 'M ' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
  for (var i = 0; i < n; i++) {
    var prv  = pts[(i - 1 + n) % n];
    var cur  = pts[i];
    var nxt  = pts[(i + 1) % n];
    var nxt2 = pts[(i + 2) % n];
    var r1 = cp(prv, cur, nxt);
    var r2 = cp(cur, nxt, nxt2);
    d += ' C ' + r1[2].toFixed(1) + ',' + r1[3].toFixed(1) +
         ' '   + r2[0].toFixed(1) + ',' + r2[1].toFixed(1) +
         ' '   + nxt[0].toFixed(1) + ',' + nxt[1].toFixed(1);
  }
  return d + ' Z';
}

function starPath(cx, cy, R, w) {
  w = w || 0.38;
  var r = R * w;
  return 'M ' + cx + ',' + (cy - R) +
         ' C ' + (cx + r) + ',' + (cy - R) + ' ' + (cx + R) + ',' + (cy - r) + ' ' + (cx + R) + ',' + cy +
         ' C ' + (cx + R) + ',' + (cy + r) + ' ' + (cx + r) + ',' + (cy + R) + ' ' + cx + ',' + (cy + R) +
         ' C ' + (cx - r) + ',' + (cy + R) + ' ' + (cx - R) + ',' + (cy + r) + ' ' + (cx - R) + ',' + cy +
         ' C ' + (cx - R) + ',' + (cy - r) + ' ' + (cx - r) + ',' + (cy - R) + ' ' + cx + ',' + (cy - R) + ' Z';
}

// ── Blob configs — positions/speeds from 01-homepage.html, colors from PORT_NOTES ──

var BLOBS = [
  // organic blobs
  { cx:100,  r:180, seed:0.3, v:[1.2,0.6,1.4,0.7,1.1,0.5,1.3,0.8], color:'#C8311C', op:0.22, speed:0.18, base:60   },
  { cx:1180, r:140, seed:1.1, v:[0.7,1.3,0.9,1.5,0.6,1.2,0.8,1.4], color:'#2F6B3D', op:0.20, speed:0.28, base:40   },
  { cx:640,  r:90,  seed:2.2, v:[1.4,0.6,1.1,0.8,1.5,0.7,1.2],     color:'#1F3A6F', op:0.22, speed:0.38, base:360  },
  { cx:1080, r:120, seed:0.7, v:[0.8,1.4,0.6,1.3,0.9,1.5,0.7,1.1], color:'#5C2D7A', op:0.22, speed:0.22, base:480  },
  { cx:180,  r:160, seed:3.5, v:[1.1,0.7,1.5,0.6,1.3,0.8,1.0,1.4], color:'#E27A2A', op:0.20, speed:0.15, base:700  },
  { cx:820,  r:200, seed:1.8, v:[0.6,1.3,0.8,1.5,0.7,1.2,0.9,1.4], color:'#C8311C', op:0.18, speed:0.32, base:850  },
  { cx:350,  r:100, seed:4.1, v:[1.5,0.7,1.2,0.6,1.4,0.8,1.1],     color:'#1F3A6F', op:0.22, speed:0.42, base:1050 },
  { cx:1150, r:130, seed:2.9, v:[0.9,1.5,0.7,1.3,0.6,1.4,0.8,1.1], color:'#2F6B3D', op:0.18, speed:0.20, base:1200 },
  { cx:550,  r:170, seed:0.5, v:[1.3,0.6,1.5,0.8,1.1,0.7,1.4,0.9], color:'#C8311C', op:0.22, speed:0.16, base:1400 },
  { cx:130,  r:80,  seed:5.2, v:[0.7,1.4,0.9,1.2,0.6,1.5,0.8],     color:'#5C2D7A', op:0.20, speed:0.44, base:1550 },
  // star shapes
  { isStar:true, cx:900,  r:110, w:0.32, color:'#1F3A6F', op:0.22, speed:0.25, base:250  },
  { isStar:true, cx:400,  r:80,  w:0.40, color:'#E27A2A', op:0.20, speed:0.35, base:1100 },
  { isStar:true, cx:1000, r:55,  w:0.30, color:'#1F3A6F', op:0.20, speed:0.48, base:650  }
];

// ── Build SVG ────────────────────────────────────────────────────────────────

function buildBg() {
  var svg = document.getElementById('parallax-svg');
  if (!svg) return;
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  var ns = 'http://www.w3.org/2000/svg';

  BLOBS.forEach(function (b) {
    var g = document.createElementNS(ns, 'g');
    g.dataset.speed = b.speed;
    g.dataset.base  = b.base;
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', b.isStar
      ? starPath(b.cx, 0, b.r, b.w)
      : organicBlob(b.cx, 0, b.r, b.v, b.seed));
    p.setAttribute('fill',    b.color);
    p.setAttribute('opacity', b.op);
    g.appendChild(p);
    g.style.transform = 'translateY(' + b.base + 'px)';
    svg.appendChild(g);
  });
}

// ── Parallax engine — verbatim from mock ─────────────────────────────────────

function startParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var fn = function () {
    var sy  = window.scrollY;
    var svg = document.getElementById('parallax-svg');
    if (!svg) return;
    svg.querySelectorAll('g[data-speed]').forEach(function (g) {
      var base  = parseFloat(g.dataset.base);
      var speed = parseFloat(g.dataset.speed);
      g.style.transform = 'translateY(' + (base - sy * speed).toFixed(1) + 'px)';
    });
  };
  window.addEventListener('scroll', fn, { passive: true });
}

document.addEventListener('DOMContentLoaded', function () {
  buildBg();
  startParallax();
});
