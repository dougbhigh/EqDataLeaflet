//////////////////////////////////////////////////////////////////////////////////////////////////
// RUT-SOM-DATA-PT-06-2020-U-C                                                     Douglas High //
// Leaflet-Challenge                                                           October 12, 2020 //
//    >Leaaflet Step-2                                                                          //
//      >logic.js                                                                               //
//   - create map with earthquake data, change color for depth, radius for magnitude.           //
//   - step2 logic adds layer of tectonic plates, multiple base layers and control box.         //
//   - input is changeable, usgs site offers datasets for types of eq's and length of data      //
//     collection. currently, url1 is pointing to all earthquakes during the past month.        //
//////////////////////////////////////////////////////////////////////////////////////////////////

// layer variables
var earthquakes= new L.LayerGroup();
var plates = new L.LayerGroup();

//   website with input data urls  https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
const url1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";     //all eq, past month
//const url1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";      //all eq, past week

// url2 provides overlay of global tectonic plates.
const url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
 
// basemaps variables
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
});

var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });
// default map (on page load) contains streetmap with both overlays.
var myMap = L.map("map", {center: [33, -50],zoom: 3,
    layers:[streetmap, plates, earthquakes]
});

// read in tectonic plates data and add to variable 'plates'.
d3.json(url2, function(data2){
  L.geoJson(data2).addTo(plates);
});

// read Json url and create features
d3.json(url1, function(data) {
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

  // add data points and bind popups to earthquake overlay variable.
  L.geoJson(data, {pointToLayer: function(feature, coords) {
      return L.circleMarker(coords);
      },
    style: mapFeatures,
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`<h3> Magnitude: ${feature.properties.mag} </h3>
        <h4> Depth: ${feature.geometry.coordinates[2]} Km </h4> Location: ${feature.properties.place}`);
    }
  }).addTo(earthquakes);

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

// basemap and overlay object variables
var baseMaps = {
  "Street Map":streetmap,
  "Light Map": light,
  "Dark Map":dark,
  "Satellite Map": satellitemap
};

var overlayMaps= {
  Earthquakes: earthquakes,
  Plates : plates
};

// control box
L.control.layers(baseMaps,overlayMaps).addTo(myMap); 

// //  remove legend when data not there
// //  https://leafletjs.com/reference-1.7.1.html#map-overlayremove
// //  https://gis.stackexchange.com/questions/176174/toggling-leaflet-legends

// map.on('baselayerchange', function(eventLayer) {
//   console.log("clicked on base layer: " + eventLayer.name);
//   if (eventLayer.name !== 'Earthquakes') { // make sure you compare with the name in the Layers Control (like the code you posted in your question on GIS Stack Exchange), not the name of your variable.
  
//     map.removeControl(legend); // You should write a function to remove the previously shown control, or more simply all other legend controls (Leaflet will not trigger an erro if you try to remove something that is not there anyway)
//   } else {
//     legend.addTo(map);
// }
// });