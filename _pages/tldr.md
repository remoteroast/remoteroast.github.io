---
layout: default
title: TL;DR
permalink: /tldr
leaflet: true
---

{% assign review_posts = site.posts | where_exp: "p", "p.tags contains 'review'" %}

<script>
window.__shops = [
{% for post in review_posts %}
  {
    title: {{ post.title | jsonify }},
    url: {{ post.url | relative_url | jsonify }},
    img: {% if post.image %}{{ post.image | prepend: '/' | relative_url | jsonify }}{% else %}null{% endif %},
    rating: {{ post.rating | default: 0 }},
    wifi: {{ post.wifi | jsonify }},
    drip: {{ post.drip | jsonify }},
    meeting: {{ post.meeting | jsonify }},
    lat: {{ post.lat | default: "null" }},
    lng: {{ post.lng | default: "null" }},
    scores: {{ post.scores | jsonify }},
    bestfor: {{ post.bestfor | jsonify }},
    shortcut: {{ post.shortcut | jsonify }},
    city: {{ post.categories[0] | jsonify }},
    maps: {{ post.maps | jsonify }}
  }{% unless forloop.last %},{% endunless %}
{% endfor %}
];
</script>

<!-- Hero -->
<section class="tldr-hero">
  <div class="tldr-hero__left">
    <div class="tldr-hero__label">The Shortcut</div>
    <h1 class="tldr-hero__title">TL;DR</h1>
    <p class="tldr-hero__sub">All {{ review_posts.size }} reviews. Ranked. Mapped. So you don't have to read the whole thing — though you should.</p>
  </div>
  <div class="tldr-hero__stats">
    <div class="tldr-hero__stat">
      <div class="tldr-hero__stat-n">{{ review_posts.size }}</div>
      <div class="tldr-hero__stat-label">Reviews</div>
    </div>
    <div class="tldr-hero__stat">
      <div class="tldr-hero__stat-n">100%</div>
      <div class="tldr-hero__stat-label">Opinions</div>
    </div>
    <div class="tldr-hero__stat">
      <div class="tldr-hero__stat-n">0</div>
      <div class="tldr-hero__stat-label">Chill</div>
    </div>
  </div>
</section>

<!-- Map + Leaderboard -->
<section class="tldr-main">
  <div class="tldr-map-panel">
    <div id="tldr-map" aria-label="Map of reviewed coffee shops" role="application"></div>
    <div class="tldr-map-panel__hint">Click a pin to explore</div>
  </div>
  <div class="tldr-leaderboard">
    <div class="tldr-leaderboard__header">Leaderboard</div>
    <div class="tldr-leaderboard__body">
      {% assign rank = 0 %}
      {% for post in review_posts %}
        {% assign rank = rank | plus: 1 %}
        {% include leaderboard-row.html post=post rank=rank %}
      {% endfor %}
    </div>
  </div>
</section>

<!-- Shop detail — hidden until row/pin clicked -->
<section class="tldr-detail" id="tldr-detail" style="display:none;" aria-live="polite">
  <div class="tldr-detail__image-col">
    <img id="det-img" class="tldr-detail__image" src="" alt="">
    <div class="tldr-detail__overlay">
      <div id="det-hood" class="tldr-detail__hood"></div>
      <h2 id="det-name" class="tldr-detail__name"></h2>
      <div id="det-bestfor" class="tldr-detail__bestfor" style="display:none;"></div>
      <a id="det-link" href="#" class="tldr-detail__cta">Read Full Review →</a>
    </div>
  </div>
  <div class="tldr-detail__bars-col">
    <div class="tldr-detail__section-label">Breakdown</div>
    <div id="det-bars"></div>
  </div>
  <div class="tldr-detail__radar-col">
    <div class="tldr-detail__section-label">Profile</div>
    <div id="det-radar"></div>
    <div id="det-author" style="display:flex;align-items:center;gap:8px;margin-top:12px;"></div>
  </div>
</section>

<!-- Best For -->
<section class="tldr-bestfor">
  <div class="tldr-bestfor__label">Best For...</div>
  <div class="tldr-bestfor__grid">
    <div class="tldr-bestfor__card">
      <div class="tldr-bestfor__card-label">Best Coffee</div>
      <div class="tldr-bestfor__card-winner">Wesley Andrews</div>
      <div class="tldr-bestfor__card-reason">Pineapple espresso. Iconic. Weird. Perfect.</div>
    </div>
    <div class="tldr-bestfor__card">
      <div class="tldr-bestfor__card-label">Best Seating</div>
      <div class="tldr-bestfor__card-winner">FRGMNT</div>
      <div class="tldr-bestfor__card-reason">Freaking huge. Freaking seated. Never kicked out.</div>
    </div>
    <div class="tldr-bestfor__card">
      <div class="tldr-bestfor__card-label">Best Vibe</div>
      <div class="tldr-bestfor__card-winner">Wesley Andrews</div>
      <div class="tldr-bestfor__card-reason">The playlist was doing something. We don't ask questions.</div>
    </div>
    <div class="tldr-bestfor__card">
      <div class="tldr-bestfor__card-label">Most Caffeinated Trip</div>
      <div class="tldr-bestfor__card-winner">Roots Roasting</div>
      <div class="tldr-bestfor__card-reason">The beans hit different. We didn't sleep for 11 hours. 10/10.</div>
    </div>
  </div>
</section>

<!-- Data table -->
<div class="container" style="margin-top:48px;">
  {% include tilted-tag.html text="THE NUMBERS" idx=3 %}
  <div class="table-responsive" style="margin-top:16px;">
    <table class="table">
      <thead>
        <tr>
          <th>Coffee Shop</th>
          <th>City</th>
          <th>Stars</th>
          <th>Wifi (mbps)</th>
          <th>Meetings?</th>
          <th>$ Drip</th>
        </tr>
      </thead>
      <tbody>
        {% for post in review_posts %}
        <tr>
          <td><a href="{{ post.url | relative_url }}">{{ post.title }}</a></td>
          <td>{% if post.maps %}<a href="{{ post.maps }}" target="_blank" rel="noopener">{{ post.categories[0] }}</a>{% else %}{{ post.categories[0] }}{% endif %}</td>
          <td>{% include stars.html rating=post.rating %}</td>
          <td>{{ post.wifi }}</td>
          <td>{{ post.meeting }}</td>
          <td>{% if post.drip %}${{ post.drip }}{% endif %}</td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>

  <div class="cta-block" style="margin:48px 0;">
    <div class="cta-block__title">Buy our next coffee!</div>
    <p class="cta-block__sub">Help us keep rating. No paywalls, no sponsored content, just data.</p>
    <div class="cta-block__actions">
      <a href="https://account.venmo.com/u/juliet-kelson" target="_blank" rel="noopener" class="btn"
         onclick="if(typeof rrTrack==='function') rrTrack('venmo_click', {author: 'juliet'})">Buy Juliet a coffee</a>
      <a href="https://account.venmo.com/u/osmar-delrio" target="_blank" rel="noopener" class="btn btn--secondary"
         onclick="if(typeof rrTrack==='function') rrTrack('venmo_click', {author: 'osmar'})">Buy Osmar a coffee</a>
    </div>
  </div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<script src="{{ '/assets/js/tldr-map.js' | relative_url }}"></script>
