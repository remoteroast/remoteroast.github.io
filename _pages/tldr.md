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

<div class="wrap">

<!-- Hero -->
<section class="tldr-hero">
  <div>
    <h1 class="tldr-hero__title">TL;DR</h1>
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

<p class="tldr-hero__sub">All {{ review_posts.size }} reviews. Ranked. Mapped. So you don't have to read the whole thing — though you should.</p>

<!-- Map + Leaderboard -->
<section class="tldr-main">
  <div class="map-col">
    <div id="tldr-map" aria-label="Map of reviewed coffee shops" role="application"></div>
    <div class="map-col__hint">Click a pin to explore</div>
  </div>
  <div class="board">
    <div class="board__head">Leaderboard</div>
    <div class="board__body">
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
    <img id="det-img" class="tldr-detail__image" src="" alt="" data-proofer-ignore>
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

<!-- Best For — 4 random shops (re-picked on every build), from each review's own bestfor field -->
{% assign bestfor_eligible = review_posts | where_exp: "p", "p.bestfor" %}
{% assign bestfor_posts = bestfor_eligible | sample_n: 4 %}
<section class="tldr-bestfor">
  <div class="tldr-bestfor__label">Best For...</div>
  <div class="tldr-bestfor__grid">
    {% for post in bestfor_posts %}
    <a class="tldr-bestfor__card" href="{{ post.url | relative_url }}">
      <div class="tldr-bestfor__card-label">{{ post.bestfor }}</div>
      <div class="tldr-bestfor__card-winner">{{ post.title }}</div>
    </a>
    {% endfor %}
  </div>
</section>

<!-- The Verdicts ledger -->
{% assign ranked_posts = review_posts | sort: "rating" | reverse %}
<section class="tldr-verdicts">
  <div class="sec-head">
    <div class="title-wrap">
      <h2>The Verdicts</h2>
    </div>
  </div>

  <div class="sheet">
    <table>
      <thead>
        <tr>
          <th scope="col" class="num">#</th>
          <th scope="col">Shop</th>
          <th scope="col">Neighborhood</th>
          <th scope="col" class="rating">Rating</th>
          <th scope="col" class="num">Wifi</th>
          <th scope="col" class="num">Drip</th>
          <th scope="col">MTGS?</th>
          <th scope="col">Best For</th>
        </tr>
      </thead>
      <tbody>
        {% assign vrank = 0 %}
        {% for post in ranked_posts %}
        {% assign vrank = vrank | plus: 1 %}
        {% assign full = post.rating | floor %}
        {% assign half_pos = full | plus: 1 %}
        <tr{% if vrank == 1 %} class="top"{% endif %}>
          <td class="rank">{% if vrank < 10 %}0{% endif %}{{ vrank }}</td>
          <td class="shop"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></td>
          <td class="hood">{% if post.maps %}<a href="{{ post.maps }}" target="_blank" rel="noopener">{{ post.categories[0] }}</a>{% else %}{{ post.categories[0] }}{% endif %}</td>
          <td class="rating"><span class="databar">{% for i in (1..5) %}<i{% if i <= full %} class="on"{% elsif i == half_pos and post.rating > full %} class="half"{% endif %}></i>{% endfor %}</span>{{ post.rating }}</td>
          <td class="num">{{ post.wifi }}</td>
          <td class="num">{% if post.drip %}${{ post.drip }}{% endif %}</td>
          <td class="mtg">{% if post.meeting == "No" %}<span class="no">{{ post.meeting }}</span>{% else %}{{ post.meeting }}{% endif %}</td>
          <td class="best">{{ post.bestfor }}</td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
  <p class="footnote"><em>MTGS?</em> = would we take a Zoom call here.</p>
</section>

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
