---
layout: default
title: TL;DR
permalink: /tldr
---

<div class="container">
  <div class="tldr-hero">
    {% include tilted-tag.html text="THE SHORTCUT" idx=1 %}
    <h1 class="tldr-hero__title">TL;DR</h1>
    <p class="meta" style="margin-top:16px;">All our reviews, ranked. Click a row to find it on the map.</p>
  </div>

  <!-- Shop data for map + leaderboard -->
  <script>
  window.__shops = [
  {% assign review_posts = site.posts | where_exp: "p", "p.tags contains 'review'" %}
  {% for post in review_posts %}
    {
      title: {{ post.title | jsonify }},
      url: {{ post.url | jsonify }},
      img: {{ post.image | prepend: '/' | jsonify }},
      rating: {{ post.rating | default: 0 }},
      wifi: {{ post.wifi | default: 0 }},
      drip: {{ post.drip | jsonify }},
      meeting: {{ post.meeting | jsonify }},
      lat: {{ post.lat | default: "null" }},
      lng: {{ post.lng | default: "null" }},
      scores: {{ post.scores | jsonify }},
      shortcut: {{ post.shortcut | jsonify }},
      city: {{ post.categories[0] | jsonify }},
      maps: {{ post.maps | jsonify }}
    }{% unless forloop.last %},{% endunless %}
  {% endfor %}
  ].filter(function(s){ return s.lat && s.lng; });
  </script>

  <div class="tldr-layout">
    <!-- Map column (sticky) -->
    <div class="tldr-map-col">
      <div id="tldr-map" aria-label="Map of reviewed coffee shops" role="application"></div>
    </div>

    <!-- Leaderboard column -->
    <div>
      <div class="tldr-leaderboard">
        <div class="tldr-leaderboard__header">All Reviews · Ranked by Rating</div>
        <div class="tldr-leaderboard__body">
          {% assign rank = 0 %}
          {% for post in review_posts %}
            {% assign rank = rank | plus: 1 %}
            {% include leaderboard-row.html post=post rank=rank %}
          {% endfor %}
        </div>
      </div>

      <!-- Full data table -->
      <div style="margin-top: 32px;">
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
                <td>
                  {% if post.maps %}
                    <a href="{{ post.maps }}" target="_blank" rel="noopener">{{ post.categories[0] }}</a>
                  {% else %}
                    {{ post.categories[0] }}
                  {% endif %}
                </td>
                <td>{% include stars.html rating=post.rating %}</td>
                <td>{{ post.wifi }}</td>
                <td>{{ post.meeting }}</td>
                <td>{% if post.drip %}${{ post.drip }}{% endif %}</td>
              </tr>
              {% endfor %}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div class="cta-block" style="margin: 48px 0;">
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

<!-- Leaflet -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN/WLs=" crossorigin="" defer></script>
<script src="{{ '/assets/js/tldr-map.js' | relative_url }}" defer></script>
