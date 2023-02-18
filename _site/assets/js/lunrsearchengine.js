
var documents = [{
    "id": 0,
    "url": "http://localhost:4000/404.html",
    "title": "404",
    "body": "404 Page does not exist!Please use the search bar at the top or visit our homepage! "
    }, {
    "id": 1,
    "url": "http://localhost:4000/about",
    "title": "About Remote Roast",
    "body": "Do you work remotely? Trying to find good coffee shops to work at? You've come to the right place!: In the age of remote work, it can be easy to get stuck in your house. But when we decided to come together and work at local coffee shops, we had to search around for places with good wifi, comfortable work environments, and prices that wouldn't break the bank. We wanted to know which places were good for meetings. Where could we go for fun seasonal drinks when we wanted a little treat? If we were staying for a while, did they have good food? And most importantly, with all the caffeine we were putting in our bodies -- how many bathrooms did they have? So, data nerds that we are, we decided to put all of our findings in one place so you don't have to scour Yelp reviews to see if the wifi is fast enough to load TikTok on your breaks from hard work. Who are we?:  After dropping out of bartending school, Osmar is now a computational neuroscience researcher at the University of Minnesota. His favorite espresso drink is an iced vanilla americano (light ice), and he's also a big fan of iced chai and london fog lattes. When not at a coffee shop, he can be found setting off fires in kitchens. Despite being incredibly chaotic in the kitchen, he does make mean shrimp stew.   After four years as a barista at a Minnesota coffee chain that shall not be named, Juliet is now a Data Analyst at the Star Tribune. Her favorite espresso drink is a hot americano with not too much water, but she also loves a plain old coffee or a fun flavored latte every once in a while. Juliet also plays in Twin Cities band Good Luck Alaska that is working on their debut EP. Buy our next coffee!Thank you for your support! Help us continue to rate coffee shops! Buy Juliet a coffee Buy Osmar a coffee"
    }, {
    "id": 2,
    "url": "http://localhost:4000/categories",
    "title": "Categories",
    "body": ""
    }, {
    "id": 3,
    "url": "http://localhost:4000/",
    "title": "Home",
    "body": "      Featured:                                                                                                                                                                                                                 Coffee Coffee Coffee                                                 1 2 3 4 5                                              :               Coffee!:                                                                                                                                                                       Juliet                                11 Jan 2023                                                                                &lt;/div&gt;            &lt;/div&gt;          &lt;/div&gt;        &lt;/div&gt;      &lt;/div&gt;    &lt;/div&gt;  &lt;/div&gt;&lt;/div&gt;        &lt;/div&gt;&lt;/section&gt;      All Stories:                                                                                                     Coffee Makes Me Poop!              :       Coffee!:                                                                               Osmar                17 Feb 2023                                        &lt;/div&gt;    &lt;/div&gt;  &lt;/div&gt;&lt;/div&gt;                                                                                                 Coffee Coffee Coffee                         1 2 3 4 5                      :       Coffee!:                                                                               Juliet                11 Jan 2023                                        &lt;/div&gt;    &lt;/div&gt;  &lt;/div&gt;&lt;/div&gt;      &lt;/div&gt;&lt;/section&gt;            "
    }, {
    "id": 4,
    "url": "http://localhost:4000/robots.txt",
    "title": "",
    "body": "      Sitemap: {{ “sitemap. xml”   absolute_url }}   "
    }, {
    "id": 5,
    "url": "http://localhost:4000/osmar-test/",
    "title": "Coffee Makes Me Poop!",
    "body": "2023/02/17 - Coffee! Start with objective metrics:         Wifi Speed   Noise Level (dB)   # Tables   # Seats   % Crowded   # Bathrooms         410   83. 5   6   21   30%   1     Bla bla bla talk about that stuff above Drink info:         $ Small Drip Coffee   Coffee Taste   $ Small Latte   # Dairy-Free Milks   Non Coffee Options   Seasonal Drinks         $3. 50   5   $4. 50   2   Few   Yes    bla bla more words about that stuff And also the food…:         Food Options   Food Quality         Many   4    Work metrics:         Outlets   Work Environment   Suitable for Meetings         Many   Chill   Maybe    "
    }, {
    "id": 6,
    "url": "http://localhost:4000/juliet-test/",
    "title": "Coffee Coffee Coffee",
    "body": "2023/01/11 - Coffee! Start with objective metrics:         Wifi Speed   Noise Level (dB)   # Tables   # Seats   % Crowded   # Bathrooms         410   83. 5   6   21   30%   1     Bla bla bla talk about that stuff above Drink info:         $ Small Drip Coffee   Coffee Taste   $ Small Latte   # Dairy-Free Milks   Non Coffee Options   Seasonal Drinks         $3. 50   5   $4. 50   2   Few   Yes    bla bla more words about that stuff And also the food…:         Food Options   Food Quality         Many   4    Work metrics:         Outlets   Work Environment   Suitable for Meetings         Many   Chill   Maybe    "
    }];

var idx = lunr(function () {
    this.ref('id')
    this.field('title')
    this.field('body')

    documents.forEach(function (doc) {
        this.add(doc)
    }, this)
});
function lunr_search(term) {
    document.getElementById('lunrsearchresults').innerHTML = '<ul></ul>';
    if(term) {
        document.getElementById('lunrsearchresults').innerHTML = "<p>Search results for '" + term + "'</p>" + document.getElementById('lunrsearchresults').innerHTML;
        //put results on the screen.
        var results = idx.search(term);
        if(results.length>0){
            //console.log(idx.search(term));
            //if results
            for (var i = 0; i < results.length; i++) {
                // more statements
                var ref = results[i]['ref'];
                var url = documents[ref]['url'];
                var title = documents[ref]['title'];
                var body = documents[ref]['body'].substring(0,160)+'...';
                document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML + "<li class='lunrsearchresult'><a href='" + url + "'><span class='title'>" + title + "</span><br /><span class='body'>"+ body +"</span><br /><span class='url'>"+ url +"</span></a></li>";
            }
        } else {
            document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = "<li class='lunrsearchresult'>No results found...</li>";
        }
    }
    return false;
}

function lunr_search(term) {
    $('#lunrsearchresults').show( 400 );
    $( "body" ).addClass( "modal-open" );
    
    document.getElementById('lunrsearchresults').innerHTML = '<div id="resultsmodal" class="modal fade show d-block"  tabindex="-1" role="dialog" aria-labelledby="resultsmodal"> <div class="modal-dialog shadow-lg" role="document"> <div class="modal-content"> <div class="modal-header" id="modtit"> <button type="button" class="close" id="btnx" data-dismiss="modal" aria-label="Close"> &times; </button> </div> <div class="modal-body"> <ul class="mb-0"> </ul>    </div> <div class="modal-footer"><button id="btnx" type="button" class="btn btn-danger btn-sm" data-dismiss="modal">Close</button></div></div> </div></div>';
    if(term) {
        document.getElementById('modtit').innerHTML = "<h5 class='modal-title'>Search results for '" + term + "'</h5>" + document.getElementById('modtit').innerHTML;
        //put results on the screen.
        var results = idx.search(term);
        if(results.length>0){
            //console.log(idx.search(term));
            //if results
            for (var i = 0; i < results.length; i++) {
                // more statements
                var ref = results[i]['ref'];
                var url = documents[ref]['url'];
                var title = documents[ref]['title'];
                var body = documents[ref]['body'].substring(0,160)+'...';
                document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML + "<li class='lunrsearchresult'><a href='" + url + "'><span class='title'>" + title + "</span><br /><small><span class='body'>"+ body +"</span><br /><span class='url'>"+ url +"</span></small></a></li>";
            }
        } else {
            document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = "<li class='lunrsearchresult'>Sorry, no results found. Close & try a different search!</li>";
        }
    }
    return false;
}
    
$(function() {
    $("#lunrsearchresults").on('click', '#btnx', function () {
        $('#lunrsearchresults').hide( 5 );
        $( "body" ).removeClass( "modal-open" );
    });
});