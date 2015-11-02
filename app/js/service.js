angular.module('toiletten-service', []).factory('toiletten', ['$http', function($http) {

    // $scope.markers
    var refresh = function(destObj) {
        return $http.get("json/toiletten.geojson").success(function(data, status) {
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
	        json += ('"color": "' + toilettenColor(feature.properties.data.benutzung) + '",');
	        json += ('"message": "' +  feature.properties.title + '<br/>' + feature.properties.data.benutzung + '<br/>Öffnungszeiten: ' + feature.properties.data.oeffnungszeiten + '"');
	        json += ' }';
	    });
	    json += ' }';
       	    var jsonObj = JSON.parse(json);
     	    angular.extend(destObj, jsonObj );
        });
    }

    var toilettenColor = function (benutzung) {
        console.log("benutzung");
        console.log(benutzung);
        switch(benutzung) {
            case 'kostenpflichtig': return 'red';
            case 'kostenfrei': return 'green';
            case 'auf Nachfrage': return 'orange';
            default: return 'yellow';
        }
    }

    return {refresh: refresh}

}]);

