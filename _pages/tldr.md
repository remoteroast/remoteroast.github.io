---
layout: page
title: TL;DR
permalink: /tldr
comments: true
---
<h2>All our reviews in a handy little list</h2>
<br>
<br>
<div class="table-responsive" style="font-size:85%">
  <table class="table">
    <thead>
      <tr>
        <th scope="col">Coffee Shop</th>
        <th scope="col">City</th>
        <th scope="col"># Stars</th>
        <th scope="col">Wifi speed</th>
        <th scope="col">Suitable for meetings?</th>
        <th scope="col">$ Small Drip Coffee</th>
      </tr>
    </thead>
    {% for post in site.posts %}
    {% if post.tags contains "review" %}
      <tbody>
        <tr>
          <td><a href="{{ post.slug }}"><span class="text-capitalize">{{ post.title }}</span></a></td>
          <td><a href="{{post.maps}}" target="_blank">{{ post.categories[0] }}</a></td>
          <td>
            <div class="rating-holder">
                <div class="c-rating c-rating--regular" data-rating-value="{{ post.rating }}">
                <button>1</button>
                <button>2</button>
                <button>3</button>
                <button>4</button>
                <button>5</button>
                </div>
            </div>
          </td>
          <td>{{ post.wifi}}</td>
          <td>{{ post.meeting}}</td>
          <td>${{ post.drip}}</td>
        </tr>
      </tbody>
    {% endif %}
    {% endfor %}
  
  </table>
</div>

<div class="hidden-mobile">
<iframe title="" aria-label="Locator maps" id="datawrapper-chart-Im2mQ" src="https://datawrapper.dwcdn.net/Im2mQ/5/" scrolling="no" frameborder="0" style="width: 0; min-width: 75% !important; border: none;" height="537" data-external="1"></iframe><script type="text/javascript">!function(){"use strict";window.addEventListener("message",(function(a){if(void 0!==a.data["datawrapper-height"]){var e=document.querySelectorAll("iframe");for(var t in a.data["datawrapper-height"])for(var r=0;r<e.length;r++)if(e[r].contentWindow===a.source){var i=a.data["datawrapper-height"][t]+"px";e[r].style.height=i}}}))}();
</script>
</div>

<div class="col-md-5">
<br>
<div class="sticky-top sticky-top-80">
<h5>Buy our next coffee!</h5>

<p>Thank you for your support! Help us continue to rate coffee shops!</p>

<a target="_blank" href="https://account.venmo.com/u/juliet-kelson" class="btn btn-success">Buy Juliet a coffee</a> <a target="_blank" href="https://account.venmo.com/u/osmar-delrio" class="btn btn-success">Buy Osmar a coffee</a>

</div>
</div>