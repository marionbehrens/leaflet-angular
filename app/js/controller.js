var app = angular.module('leafletApp', ['leaflet-directive', 'wanderungen-service', 'toiletten-service']);    // ["leaflet-directive"] <script src="../../angular-simple-logger-master/dist/index.js"></script> 

app.controller('LeafletController', [ '$scope', 'leafletEvents', '$http', 'wanderungen', 'toiletten', function($scope, leafletEvents, $http, wanderungen, toiletten) {
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
	    overlays: {
                wanderungen: {
		    name:'Wanderungen',
		    type: 'group',
                    data: {},
              	    visible: false
	        },
 	        toiletten: {
		    name:'Toiletten',
		    type: 'group',
		    data: {},
                    visible: false
                }
            }
        },
        markers: {},
        paths: {},
        events: {
            map: {
                enable: ['overlayadd', 'mousemove', 'mouseup', 'dblclick'],
                logic: 'emit'
            }
        },
        legend: {
            position: 'bottomleft',
            color: [],
            labels: []
        }
    });

    $scope.workmodus = "none";

    $scope.eventDetected = "No events yet...";

    $scope.selectedMarkers = [];

    /*
    var mapEvents = leafletEvents.getAvailableMapEvents();
    for (var k in mapEvents) {
        var eventName = 'leafletDirectiveMap.' + mapEvents[k];
        $scope.$on(eventName, function(event) {
            $scope.eventDetected += " - " + event.name;
        });
    }
    */

    var selection = [];
    var isCompleted = true;

    function isPointInSelection(point) {
        var x = point.lng, y = point.lat;
        var inside = false;
        for (var i = 0, j = selection.length - 1; i < selection.length; j = i++) {
            var xi = selection[i].lng, yi = selection[i].lat;
            var xj = selection[j].lng, yj = selection[j].lat;
            var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    function listPointsInSelection() {
	angular.forEach($scope.markers, function(marker, key) {
	    console.log(marker);
            if (isPointInSelection(marker)) {
		$scope.selectedMarkers.push(marker);
	    }
        });
    }

    function isSelectionCompleted(point) {
        if (selection.length > 1) {
            var minLat = selection[0].lat; 
            var maxLat = selection[0].lat; 
            var minLng = selection[0].lng;
            var maxLng = selection[0].lng;
            for (var i = 1; i<selection.length; i++) {
                if (selection[i].lat < minLat)
                    minLat = selection[i].lat;
                if (selection[i].lat > maxLat)
                    maxLat = selection[i].lat;
                if (selection[i].lng < minLng)
                    minLng = selection[i].lng;
                if (selection[i].lng > maxLng)
                    maxLng = selection[i].lng;
            }
            var totalLat = Math.abs(maxLat - minLat);
            var totalLng = Math.abs(maxLng - minLng);
            var diffLat = Math.abs(selection[0].lat - point.lat);
            var diffLng = Math.abs(selection[0].lng - point.lng);
            return (((diffLat / totalLat) < 0.05) && ((diffLng / totalLng) < 0.05));
        }
        else return false;
    }

    $scope.$on('leafletDirectiveMap.mousemove', function(event, args) {
	if (($scope.workmodus === "polygon") && (!isCompleted) && (selection.length > 0)) {
	    var lastPoint = selection[selection.length - 1];
            var currPosition = args.leafletEvent.latlng;
            angular.extend($scope.paths, {
                mousemove: {
                    type: 'polyline',
                    color: 'red',
                    weight: 3,
                    latlngs: [lastPoint, currPosition]
                }
            });
        }
    });

    $scope.$on('leafletDirectiveMap.mouseup', function(event, args) {
        $scope.eventDetected += "mouseup";
	if ($scope.workmodus === "polygon") {
        if (isCompleted) {
            angular.extend($scope.paths, {
                selection: {
                    type: 'polyline',
                    color: 'red',
                    weight: 3,
                    latlngs: {}
                }
            });
            selection = [];
	    $scope.selectedMarkers = [];
            isCompleted = false;
        }
        var point = args.leafletEvent.latlng;
        if (isSelectionCompleted(point)) {
            console.log('selection complete');
            angular.extend($scope.paths, {
                selection_ready: {
                    type: 'polygon',
                    color: 'red',
                   //  fillColor: 'red',
                    weight: 3,
                    latlngs: selection
                }
            });
            console.log($scope.paths.selection);
            isCompleted = true;
	    $scope.workmodus = "none";
	    listPointsInSelection();
        }
        else {
            selection.push(point);
            $scope.paths.selection.latlngs = selection;
        }
	}
       // $scope.paths.polygon.latlng = selection;
    });

    $scope.$on('leafletDirectiveMap.dblclick', function(event, args) {
        $scope.eventDetected += " dblclick";
        console.log('dblclick');
    });

    $scope.$on('leafletDirectiveMap.overlayadd', function(event, args) {
        $scope.eventDetected += " overlayadd";
        if (args.leafletEvent.name == 'Wanderungen') {
            wanderungen.refresh($scope.paths);
        }
        else if (args.leafletEvent.name == 'Toiletten') {
            toiletten.refresh($scope.markers);
            console.log('Toiletten-Layer added.');
	        angular.extend($scope, {
                legend: {
                    colors: [ 'red', 'green' ],
                    labels: [ 'kostenpflichtig', 'nicht kostenpflichtig' ]
                }
            });
            console.log($scope.legend);
        }
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
	    json += ('"title": "' + feature.properties.data.name_der_kindertagespflegestelle + '",');
	    json += ('"lat": ' + feature.geometry.coordinates[0] + ',');
	    json += ('"lng": ' + feature.geometry.coordinates[1] + ',');
	    json += ('"message": "' +  feature.properties.title + '<br/>' + feature.properties.description.split('"').join('\\"') + '"');
	    json += ' }';
	});
	json += ' }';
	var jsonObj = JSON.parse(json);
	angular.extend($scope.markers, jsonObj );
    });

}]);
