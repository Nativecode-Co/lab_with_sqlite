<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?>
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <meta charset="utf-8">
    <title>Simple Polygon</title>
    <style>
      /* Always set the map height explicitly to define the size of the div
       * element that contains the map. */
      #map {
        height: 100%;
      }
      /* Optional: Makes the sample page fill the window. */
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
var map;
var triangleCoords=[];

var bermudaTriangle;
      // This example creates a simple polygon representing the Bermuda Triangle.
var i=0;
function add_to_array()
{
  
   // alert("a");
    var x=document.getElementById("lonlat").value;
    x=x.split(",");
    var lat=x[0];
    var long=x[1];
  //  alert(lat+" "+long);
  
    // triangleCoords = [{"lat":33.3046759367732,"lng":44.35107751849364},{"lat":33.310522067940106,"lng":44.35172124865721},{"lat":33.307007263057685,"lng":44.359145603210436},{"lat":33.307437654941104,"lng":44.35352369311522}];
        
   
     
    i++;
    



        triangleCoords.push({lat: parseFloat(lat), lng: parseFloat(long)});
         bermudaTriangle = new google.maps.Polygon({
          paths: triangleCoords,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35
        });
    
       
       
        bermudaTriangle.setMap(map);




}
function undo()
{
    bermudaTriangle.setMap(null);
}
      function initMap() {
        var uluru = {lat: 33.304389, lng: 44.354382};
         map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: uluru,
         // mapTypeId: 'terrain'
        });

        var marker = new google.maps.Marker({
                position: uluru,
                map: map,
                draggable: true
            });

            google.maps.event.addListener(marker,'position_changed',function(){

                var latt=marker.getPosition().lat();
                var lngg=marker.getPosition().lng();
                
                document.getElementById("lonlat").value=latt+","+lngg;
               //alert(latt+","+lngg);
              //  $("#long_lag").val(latt+","+lngg);
              //  $("#lngg").val(lngg);
            });

            var contentString ='<h2 style="color:#5c5edc;" ></h2>'+'<input type="text" style="width:100%;" name="lonlat" id="lonlat"  required readonly>'+'<button onclick="add_to_array();">Save Point</button>'+'<button onclick="undo();">Undo</button>';

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            marker.addListener('click', function() {
                infowindow.open(map, marker);
            });


        // Define the LatLng coordinates for the polygon's path.
       
      }
    </script>
   <script async defer
            src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA3tUKyV8jqlgaDSVVeOWVGWl-w2f3ChCI&callback=initMap">
    </script>
  </body>
</html>