'use strict';
/* global ol:false, proj4:false */

angular.module('mean.polls').directive('openlayers',function(){
  return {
    restrict: 'AE',
    scope:{
      results: '='
    },
    link: function(scope, elem, attrs){
      var vectorSource = new ol.source.GeoJSON({
        object: {
          'type': 'FeatureCollection',
          'crs': {
            'type': 'name',
            'properties': {
              'name': 'EPSG:3857'
            }
          },
          'features': []
        }
      });

      var createTextStyle = function(feature, resolution){
        var text = feature.getProperties().properties.created;
        var date = new Date(text); 
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var dateString = date.getHours() + ':' + ( date.getMinutes().toString().length === 1 ? '0' + date.getMinutes() : date.getMinutes() ) + '  ' + date.getDate() + ' ' + months[date.getMonth()] + ' \'' + date.getFullYear().toString().slice(2,4);
        return new ol.style.Text({
          textAlign: 'center',
          baseline: 'middle',
          font: 'Arial',
          fill: new ol.style.Fill({ color: '#5DFC0A'}),
          stroke: new ol.style.Stroke({color: 'black', width: 3}),
          text: (resolution < 2 ? dateString : '') 
        });
      };

      var pointStyleFunction = function(feature, resolution){
        var style = new ol.style.Style({
          image: new ol.style.Circle({
            radius: (resolution < 2 ? 13 : 5),
            fill: new ol.style.Fill({color: resolution < 2 ? 'rgba(255, 0, 0, 0.1)' :'rgba(255, 0, 0, 0.4)'}),
            stroke: new ol.style.Stroke({color: 'red', width: 1})
          }),
          text: createTextStyle(feature, resolution)
        });
        return [style];
      };

      var OSMLayer = new ol.layer.Tile({
        source: new ol.source.OSM()
      });

      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: pointStyleFunction 
      });

      scope.$watch('results',function(newVal, oldVal){
        vectorSource.clear();
        var extentArray = [];
        for (var i=0; i<newVal.length; i++){
          var geoLocationObj = newVal[i];
          if (!!geoLocationObj.geoLocation){
            var newCoords = proj4('EPSG:4326','EPSG:3857',geoLocationObj.geoLocation.coordinates);
            extentArray.push(newCoords);
            var point = new ol.geom.Point(newCoords);
            vectorSource.addFeature(new ol.Feature({
              geometry: point,
              properties: { created : geoLocationObj.created }
            }));
          }
        }
        var extent = ol.extent.boundingExtent(extentArray);
        if (!!extent){
          map.getView().fitExtent(extent, map.getSize());
          //FIX LOW RESOLUTION BUG
          if (map.getView().getResolution() < 0.6) map.getView().setResolution(0.6);
        }
        var mapSize = map.getSize();
        if (mapSize[0] === 0 && mapSize[1] === 0){
          var currentElem = elem;
          var width = currentElem.context.offsetWidth,
            height = currentElem.context.offsetHeight;
          while (width === 0 || height === 0){
            currentElem = (!!currentElem.context ? currentElem.context.parentNode : currentElem.parentNode);
            width = currentElem.offsetWidth;
            height = currentElem.offsetHeight;
          }
          if (!currentElem.context){
            width = currentElem.offsetWidth;
          }else{
            width = currentElem.context.offsetWidth;
          }
          height = 400;
          map.setSize([width,height]);
        }
      });

      var map = new ol.Map({
        target: document.getElementById('map'),
        layers: [
          OSMLayer,
          vectorLayer
        ],
        view: new ol.View2D({
          center: proj4('EPSG:4326','EPSG:3857',[22,44]),
          zoom: 6
        }),
      });
      
    }
  };
});
