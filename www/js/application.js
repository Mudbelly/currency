var Application = {
   initApplication: function () {
      $(document)
         .on('pageinit', '#scan-page', function () {
            Application.initScanPage();
         })
         .on('backbutton', function () {
            $.mobile.changePage('index.html');
         });
      Application.openLinksInApp();
   },
   initAddFeedPage: function () {
      $('#add-feed-form').submit(function (event) {
         event.preventDefault();
         var feedName = $('#feed-name').val().trim();
         var feedUrl = $('#feed-url').val().trim();
         if (feedName === '') {
            navigator.notification.alert('Name field is required and cannot be empty', function () {
            }, 'Error');
            return false;
         }
         if (feedUrl === '') {
            navigator.notification.alert('URL field is required and cannot be empty', function () {
            }, 'Error');
            return false;
         }
         if (Feed.searchByName(feedName) === false && Feed.searchByUrl(feedUrl) === false) {
            var feed = new Feed(feedName, feedUrl);
            feed.add();
            navigator.notification.alert('Feed saved correctly', function () {
               $.mobile.changePage('index.html');
            }, 'Success');
         } else {
            navigator.notification.alert('Feed not saved! Either the Name or the Url specified is already in use', function () {
            }, 'Error');
         }
         return false;
      });
   },
    
    initScanPage: function () {
        alert('test');
        $("#scan").click(function () {
            Application.scan();
        });
    },
     
   initListFeedPage: function () {
      var $feedsList = $('#feeds-list');
      var items = Feed.getFeeds();
      var htmlItems = '';
      $feedsList.empty();
      items = items.sort(Feed.compare);
      for (var i = 0; i < items.length; i++) {
         htmlItems += '<li><a href="show-feed.html?url=' + items[i].url + '">' + items[i].name + '</a></li>';
      }
      $feedsList.append(htmlItems).listview('refresh');
   },
   initShowFeedPage: function (url) {
      var step = 10;
      var loadFeed = function () {
         var currentEntries = $('#feed-entries').find('div[data-role=collapsible]').length;
         var entriesToShow = currentEntries + step;
         $.ajax({
            url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=' + entriesToShow + '&q=' + encodeURI(url),
            dataType: 'json',
            beforeSend: function () {
               $.mobile.loading('show', {
                  text: 'Please wait while retrieving data...',
                  textVisible: true
               });
            },
            success: function (data) {
               var $list = $('#feed-entries');
               if (data.responseData === null) {
                  navigator.notification.alert('Unable to retrieve the Feed. Invalid URL', function () {
                  }, 'Error');
                  return;
               }
               var items = data.responseData.feed.entries;
               var $post;
               if (currentEntries === items.length) {
                  navigator.notification.alert('No more entries to load', function () {
                  }, 'Info');
                  return;
               }
               for (var i = currentEntries; i < items.length; i++) {
                  $post = $('<div data-role="collapsible" data-expanded-icon="arrow-d" data-collapsed-icon="arrow-r" data-iconpos="right">');
                  $post
                     .append($('<h2>').text(items[i].title))
                     .append($('<h3>').html('<a href="' + items[i].link + '" target="_blank">' + items[i].title + '</a>')) // Add title
                     .append($('<p>').html(items[i].contentSnippet)) // Add description
                     .append($('<p>').text('Author: ' + items[i].author))
                     .append(
                        $('<a href="' + items[i].link + '" target="_blank" data-role="button">')
                           .text('Go to the Article')
                           .button()
                           .click(function (event) {
                              if (Application.checkRequirements() === false) {
                                 event.preventDefault();
                                 navigator.notification.alert('The connection is off, please turn it on', function () {
                                 }, 'Error');
                                 return false;
                              }
                              $(this).removeClass('ui-btn-active');
                           })
                     );
                  $list.append($post);
               }
               $list.collapsibleset('refresh');
            },
            error: function () {
               navigator.notification.alert('Unable to retrieve the Feed. Try later', function () {
               }, 'Error');
            },
            complete: function () {
               $.mobile.loading('hide');
            }
         });
      };
      $('#show-more-entries').click(function () {
         loadFeed();
         $(this).removeClass('ui-btn-active');
      });
      $('#delete-feed').click(function () {
         Feed.searchByUrl(url).delete();
         navigator.notification.alert('Feed deleted', function () {
            $.mobile.changePage('list-feeds.html');
         }, 'Success');
      });
      if (Application.checkRequirements() === true) {
         loadFeed();
      } else {
         navigator.notification.alert('To use this app you must enable your internet connection', function () {
         }, 'Warning');
      }
   },
   initAurelioPage: function () {
      $('a[target=_blank]').click(function () {
         $(this).closest('li').removeClass('ui-btn-active');
      });
   },
   checkRequirements: function () {
      if (navigator.connection.type === Connection.NONE) {
         return false;
      }
      return true;
   },
   updateIcons: function () {
      var $buttons = $('a[data-icon], button[data-icon]');
      var isMobileWidth = ($(window).width() <= 480);
      isMobileWidth ? $buttons.attr('data-iconpos', 'notext') : $buttons.removeAttr('data-iconpos');
   },
    scan: function() {
        console.log('scanning');
        
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");

        scanner.scan( function (result) { 

            alert("We got a barcode\n" + 
            "Result: " + result.text + "\n" + 
            "Format: " + result.format + "\n" + 
            "Cancelled: " + result.cancelled);  

           console.log("Scanner result: \n" +
                "text: " + result.text + "\n" +
                "format: " + result.format + "\n" +
                "cancelled: " + result.cancelled + "\n");
            document.getElementById("info").innerHTML = result.text;
            console.log(result);
            /*
            if (args.format == "QR_CODE") {
                window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
            }
            */

        }, function (error) { 
            console.log("Scanning failed: ", error); 
        } );
    },
   openLinksInApp: function () {
      $(document).on('click', 'a[target=_blank]', function (event) {
         event.preventDefault();
         window.open($(this).attr('href'), '_blank');
      });
   }
};