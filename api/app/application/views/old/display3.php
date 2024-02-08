<!-- https://gist.github.com/cristianossd/6f9162629b136a809036 -->
<!DOCTYPE html>
<html>
    <head>
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
        <meta charset="UTF-8">
        <title>Drawing Tools</title>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <script type="text/javascript"
        src="http://maps.google.com/maps/api/js?sensor=false&libraries=drawing"></script>
        
        <script async defer
            src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA3tUKyV8jqlgaDSVVeOWVGWl-w2f3ChCI&libraries=drawing&callback=initMap">
    </script>
    
        <style type="text/css">
            #map, html, body {
                padding: 0;
                margin: 0;
                width: 100%;
                height: 100%;
                float: center;
            }
            #panel {
                width: 100%;
                font-family: Arial, sans-serif;
                font-size: 13px;
                float: right;
                margin: 10px;
            }
            #color-palette {
                clear: both;
            }
            .color-button {
                width: 14px;
                height: 14px;
                font-size: 0;
                margin: 2px;
                float: left;
                cursor: pointer;
            }
            #delete-button {
                margin-top: 5px;
            }
        </style>
        <script type="text/javascript">
        var str="";
        var circul_varibale="";
        var name="";
            var drawingManager;
            var selectedShape;
            var colors = ['#1E90FF', '#FF1493', '#32CD32', '#FF8C00', '#4B0082'];
            var selectedColor;
            var colorButtons = {};
            function send()
            {
                name=document.getElementById("tag").value;
                
                str=str.substring(0, str.length - 1);
                var temp=str.split(",");
                str=str+","+temp[0];
              //  alert(name+" "+str);
                 $.ajax({
                        type: "POST",
                        url: "<?php echo base_url(); ?>index.php/Hr/draw_map",
                        data :{"str":str,"circul":circul_varibale,"name":name},
                        success: function(data){
                        data=data.trim();
                     //   alert(data);
                        alert("تمت العملية بنجاح");
                        location.href="<?php echo base_url(); ?>index.php/Hr/draw_map";
                               }}); 
            }
            function clearSelection () {
                if (selectedShape) {
                    selectedShape.setEditable(false);
                    selectedShape = null;
                }
            }
            function setSelection (shape) {
                clearSelection();
                // getting shape coordinates
              //  if(shape.type=="cir")
            //  alert(shape.type);
              if(shape.type=="circle")
              {
               var radius=shape.getRadius();
               var latt = shape.getCenter().lat();
               var longg = shape.getCenter().lng();
               circul_varibale=radius+"-"+latt+" "+longg;
              }
              else
              {
                var v = shape.getPath();
                for (var i=0; i < v.getLength(); i++) {
                  var xy = v.getAt(i);
                  str=str+xy.lat()+" "+ xy.lng()+",";
                                                      }
              }
               ///alert(shape.getRadius());
              
              // alert(latt+" "+longg);



               
                selectedShape = shape;
                shape.setEditable(true);
                selectColor(shape.get('fillColor') || shape.get('strokeColor'));
            }
            function deleteSelectedShape () {
               // alert(selectedShape.type);
                if (selectedShape) {
                    selectedShape.setMap(null);
                }
            }
            function selectColor (color) {
                selectedColor = color;
                for (var i = 0; i < colors.length; ++i) {
                    var currColor = colors[i];
                    colorButtons[currColor].style.border = currColor == color ? '2px solid #789' : '2px solid #fff';
                }
                // Retrieves the current options from the drawing manager and replaces the
                // stroke or fill color as appropriate.
                var polylineOptions = drawingManager.get('polylineOptions');
                polylineOptions.strokeColor = color;
                drawingManager.set('polylineOptions', polylineOptions);
                var rectangleOptions = drawingManager.get('rectangleOptions');
                rectangleOptions.fillColor = color;
                drawingManager.set('rectangleOptions', rectangleOptions);
                var circleOptions = drawingManager.get('circleOptions');
                circleOptions.fillColor = color;
                drawingManager.set('circleOptions', circleOptions);
                var polygonOptions = drawingManager.get('polygonOptions');
                polygonOptions.fillColor = color;
                drawingManager.set('polygonOptions', polygonOptions);
            }
            function setSelectedShapeColor (color) {
                console.log('fn setSelectedShapeColor()');
                console.log(selectedShape);
                if (selectedShape) {
                    if (selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
                        selectedShape.set('strokeColor', color);
                    } else {
                        selectedShape.set('fillColor', color);
                    }
                }
            }
            function makeColorButton (color) {
                var button = document.createElement('span');
                button.className = 'color-button';
                button.style.backgroundColor = color;
                google.maps.event.addDomListener(button, 'click', function () {
                    selectColor(color);
                    setSelectedShapeColor(color);
                });
                return button;
            }
            function buildColorPalette () {
                var colorPalette = document.getElementById('color-palette');
                for (var i = 0; i < colors.length; ++i) {
                    var currColor = colors[i];
                    var colorButton = makeColorButton(currColor);
                    colorPalette.appendChild(colorButton);
                    colorButtons[currColor] = colorButton;
                }
                selectColor(colors[0]);
            }

      


            function initialize () {
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 15,
                    center: new google.maps.LatLng(33.304389, 44.354382),
                    disableDefaultUI: true,
                    zoomControl: true
                });
                var polyOptions = {
                    strokeWeight: 0,
                    fillOpacity: 0.45,
                    editable: true,
                    draggable: true
                };
                // Creates a drawing manager attached to the map that allows the user to draw
                // markers, lines, and shapes.
                drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: google.maps.drawing.OverlayType.MARKER,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
          //  drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
          drawingModes: ['polygon','circle']
          },
          markerOptions: {icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'},
          circleOptions: {
            fillColor: '#ffff00',
            fillOpacity: 1,
            strokeWeight: 5,
            clickable: false,
            editable: true,
            zIndex: 1
          }
        });
        drawingManager.setMap(map);
                google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
                 //  alert("overlaycomplete");
                    if (e.type !== google.maps.drawing.OverlayType.MARKER) {
                       
                        // Switch back to non-drawing mode after drawing a shape.
                        drawingManager.setDrawingMode(null);
                        // Add an event listener that selects the newly-drawn shape when the user
                        // mouses down on it.
                        var newShape = e.overlay;
                        newShape.type = e.type;
                        google.maps.event.addListener(newShape, 'click', function (e) {
                        //   alert("aa");
                            if (e.vertex !== undefined) {
                                if (newShape.type === google.maps.drawing.OverlayType.POLYGON) {
                                  //  alert("polgon");
                                    var path = newShape.getPaths().getAt(e.path);
                                    path.removeAt(e.vertex);
                                    if (path.length < 3) {
                                        newShape.setMap(null);
                                    }
                                }
                                if (newShape.type === google.maps.drawing.OverlayType.POLYLINE) {
                                  //  alert("POLYLINE");
                                    var path = newShape.getPath();
                                    path.removeAt(e.vertex);
                                    if (path.length < 2) {
                                        newShape.setMap(null);
                                    }
                                }
                            }
                            setSelection(newShape);
                        });
                      //  alert("overlaycomplete2 "+newShape.type);
                        setSelection(newShape);
                    }
                });
                // Clear the current selection when the drawing mode is changed, or when the
                // map is clicked.
                google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
                google.maps.event.addListener(map, 'click', clearSelection);
                google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);
                buildColorPalette();
            }
            google.maps.event.addDomListener(window, 'load', initialize);
        </script>
    </head>
    <body>
    <a href="<?php echo site_url("Hr/dashborad");  ?>">back</a>
        <div id="panel">
        <!--
            <div id="color-palette"></div>
            -->
            
        </div>
        
       
        <div id="map" style="width:100%;height:90%;"></div>

        <center>
            <div>
                <input type="text" id="tag">
                <button id="delete-button">Delete</button>
                <button id="save_shap" onclick="send();">Save</button>
            </div>
            </center>
        
    </body>
</html>