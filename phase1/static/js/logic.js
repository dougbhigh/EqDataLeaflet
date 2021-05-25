//////////////////////////////////////////////////////////////////////////////////////////////////
// RUT-SOM-DATA-PT-06-2020-U-C                                                     Douglas High //
// Leaflet-Challenge                                                           October 12, 2020 //
//    >Leaaflet Step-1                                                                          //
//      >logic.js                                                                               //
//   - create map with earthquake data, change color for depth, radius for magnitude.           //
//   - input is changeable, usgs site offers datasets for types of eq's and length of data      //
//     collection. currently, url is pointing to all earthquakes during the past week.          //
//  *- 5/2021 - git repo and local folder name changed to EqDataLeaflet, no code changes made.  // 
//////////////////////////////////////////////////////////////////////////////////////////////////

var myMap = L.map("map", {center: [33, -50],zoom: 3});
// basemap
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
}).addTo(myMap);

//   website with input data urls  https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
//var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";     //all eq, past month
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";      //all eq, past week

// read Json url and create features
d3.json(url, function(data) {
    function mapFeatures(feature) {
        return{
          fillColor: eqDepthColor(feature.geometry.coordinates[2]),
          fillOpacity: .65,
          color: "black",
          opacity: .75,
          radius: eqMagRadius(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
    }
    function eqDepthColor(depth) { 
      switch (true) {
        case depth > 90:
          return "#530001";
        case depth > 70:
          return "#630139";
        case depth > 50:
          return "#1906F1";
        case depth > 30:
          return "#275AF3";
        case depth > 10:
          return "#0AC4CE";
        case depth > -10:
          return "#CED4D4";
        default:
          return "#ffffff";
      }
    }
    function eqMagRadius(magnitude) {
      return (magnitude + 2) * 1.5;
    }
    // add data points and bind popups
    L.geoJson(data, {pointToLayer: function(feature, coords) {
        return L.circleMarker(coords);
      },
      style: mapFeatures,
      onEachFeature: function(feature, layer) {
        layer.bindPopup(`<h3> Magnitude: ${feature.properties.mag} </h3>
         <h4> Depth: ${feature.geometry.coordinates[2]} Km </h4> Location: ${feature.properties.place}`);
      }
    }).addTo(myMap);
  
  // add legend
    var legend = L.control({position: "bottomright"});
  
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
          depth = [-10, 10, 30, 50, 70, 90];

      div.innerHTML += '<h3>Depth (Km)</h3>' 
      
      for (var i = 0; i < depth.length; i++) {
        div.innerHTML += 
          '<i style="background: ' + eqDepthColor(depth[i]+1) + '"></i> ' +
          depth[i] + (depth[i + 1]? '&ndash;' + depth[i + 1] + '<br>' : '+');
      }
      return div;
    };
    legend.addTo(myMap);
  });