$(document).on(
  'mobileinit',
  function()
  {
    // Page Loader Widget
    $.mobile.loader.prototype.options.text = 'Loading...';
    $.mobile.loader.prototype.options.textVisible = true;
 
    // Bypass Access-Control-Allow-Origin
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
  }
);