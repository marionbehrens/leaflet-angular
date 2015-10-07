var app = angular.module('leafletApp', ["leaflet-directive"]);    // ["leaflet-directive"] <script src="../../angular-simple-logger-master/dist/index.js"></script> 

app.controller('LeafletController', [ '$scope', '$http', function($scope, $http) {
    var baselayers = {
                googlestreets: {
                    name: 'Google Streets',
                    type: 'google',
                    layerType: 'ROADMAP'
                },
                googleterrain: {
                    name: 'Google Terrain',
                    type: 'google',
                    layerType: 'TERRAIN'
                },
                googlehybrid: {
                    name: 'Google Hybrid',
                    type: 'google',
                    layerType: 'HYBRID'
                },
                openstreetmap: {
	            name: "OpenStreetMap",
                    url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
		    type: "xyz",
                    options: {
                        attribution: '&#169; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                opencyclemap: {
	            name: "OpenCycleMap",
                    url: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
		    type: "xyz",
                    options: {
                        attribution: 'All maps &#169; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, map data &#169; <a href="http://www.openstreetmap.org">OpenStreetMap</a> (<a href="http://www.openstreetmap.org/copyright">ODbL</a>'
                    }
                },
                stamen: {
                    name: 'Water Colors',
                    url: 'http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
                    type: 'xyz',
                }
    };

    angular.extend($scope, {
        berlin: {
            lat: 52.515,
            lng: 13.400,
            zoom: 11
        },
        layers: {
            baselayers: baselayers,
	    overlays: {}
	},
        markers: {},
	paths: {}
    });
        
    $http.get("json/berliner-bezirke.geojson").success(function(data, status) {
	angular.extend($scope.layers.overlays, {
  	    bezirke: {
		name:'Bezirke',
		type: 'geoJSONShape',
 		data: data,
		layerOptions: {
                    fillColor: '#ff7800',
                    weight: 1,
                    opacity: 0.8,
                    color: '#ff7800',
                    dashArray: '4',
                    fillOpacity: 0.15
		}
	    }
	});
    });
        
    $http.get("json/heatmap.json").success(function(data, status) {
	angular.extend($scope.layers.overlays, {
  	    heatmap: {
      		name: "Heat Map",
      		type: "webGLHeatmap",
      		data: data,
      		visible: true,
      		layerParams: {},
      		layerOptions: {
		    size: 20, // in meter
		    opacity: 0.8, // 1 = no opacity, 0 = invisible
		    autoresize: true
		}	
	    }
	});
	console.log(data);
    });

    $http.get("json/toiletten.geojson").success(function(data, status) {
 	angular.extend($scope.layers.overlays, {
 	    toiletten: {
		name:'Toiletten',
		type: 'group',
		data: data
	    }
	});
	var json = '{ ';
	var isFirst = true;
	data.features.forEach(function(feature)
	{
	    var index = 'toilet_' + feature.properties.data.id;
	    json += (isFirst ? '': ', ');
	    isFirst = false;
	    json += ('"' + index + '": {');
	    json += '"layer": "toiletten",';
	    json += ('"lat": ' + feature.geometry.coordinates[0] + ',');
	    json += ('"lng": ' + feature.geometry.coordinates[1] + ',');
	    json += ('"message": "' +  feature.properties.title + '<br/>' + feature.properties.data.benutzung + '<br/>Öffnungszeiten: ' + feature.properties.data.oeffnungszeiten + '"');
	    json += ' }';
	});
	json += ' }';
	var jsonObj = JSON.parse(json);
	angular.extend($scope.markers, jsonObj );
    });

    $http.get("json/kitas.geojson").success(function(data, status) {
 	angular.extend($scope.layers.overlays, {
 	    kitas: {
		name:'Kitas',
		type: 'group',
		data: data
	    }
	});
	var json = '{ ';
	var isFirst = true;
	data.features.forEach(function(feature)
	{
	    var index = 'kita_' + feature.properties.data.id;
	    json += (isFirst ? '': ', ');
	    isFirst = false;
	    json += ('"' + index + '": {');
	    json += '"layer": "kitas",';
	    json += ('"lat": ' + feature.geometry.coordinates[0] + ',');
	    json += ('"lng": ' + feature.geometry.coordinates[1] + ',');
	    json += ('"message": "' +  feature.properties.title + '<br/>' + feature.properties.description.split('"').join('\\"') + '"');
	    json += ' }';
	});
	json += ' }';
	var jsonObj = JSON.parse(json);
	angular.extend($scope.markers, jsonObj );
    });

    $http.get("json/wanderungen.geojson").success(function(data, status) {
 	angular.extend($scope.layers.overlays, {
 	    wanderungen: {
		name:'Wanderungen',
		type: 'group',
		data: data
	    }
	});
	var json = '{ ';
	console.log(data);
	var i = 0;
	data.features.forEach(function(feature)
	{
	    json += (i == 0 ? '': ', ');
	    var index = 'wanderung_' + (++i);
	    json += ('"' + index + '": {');
	    json += '"layer": "wanderungen",';
	    json += '"color": "cyan",';
            json += '"weight": 3,';
	    json += '"latlngs": [';
	    console.log(feature);
	    var isFirst = true;
	    feature.geometry.coordinates[0].forEach(function(coords)
	    {
	    	json += (isFirst ? '': ', ');
	    	isFirst = false;
		json += ('{ "lat": ' + coords[1] + ', "lng": ' + coords[0] + '}');
	    });
	    json += ']}';
	});
	json += ' }';
	console.log(json);
	var jsonObj = JSON.parse(json);
	console.log(jsonObj);
	angular.extend($scope.paths, jsonObj );
	console.log($scope.paths);
    });

}]);
