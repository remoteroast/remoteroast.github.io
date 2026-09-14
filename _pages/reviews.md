---
layout: page
title: Reviews
permalink: /reviews
---

{% assign entries = site.posts | where_exp: "p", "p.tags contains 'review' or p.tags contains 'roundup'" | sort: "date" | reverse %}

<div class="wrap">
  <section class="reviewshead">
    <div class="reviewshead__kicker">Reviews + round ups, newest first</div>
    <h1>Every Review</h1>
    <p class="lead">Every shop we've hauled a laptop into, plus the round ups. Newest first.</p>
  </section>

  <section class="reviewslist">
    <div class="sheet">
      <table>
        <thead>
          <tr>
            <th scope="col">Shop / Title</th>
            <th scope="col">Type</th>
            <th scope="col">Neighborhood</th>
            <th scope="col">Reviewed</th>
            <th scope="col">Rating</th>
          </tr>
        </thead>
        <tbody>
          {% for entry in entries %}
          {% assign full = entry.rating | floor %}
          {% assign half_pos = full | plus: 1 %}
          <tr>
            <td class="shop"><a href="{{ entry.url | relative_url }}">{{ entry.title }}</a></td>
            <td class="hood">{% if entry.tags contains 'review' %}Review{% else %}Round Up{% endif %}</td>
            <td class="hood">{% if entry.tags contains 'review' %}{{ entry.categories[0] }}{% else %}—{% endif %}</td>
            <td class="hood">{{ entry.date | date: "%b %Y" }}</td>
            <td class="num">{% if entry.tags contains 'review' %}<span class="databar">{% for i in (1..5) %}<i{% if i <= full %} class="on"{% elsif i == half_pos and entry.rating > full %} class="half"{% endif %}></i>{% endfor %}</span>{{ entry.rating }}{% else %}—{% endif %}</td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
  </section>
</div>
