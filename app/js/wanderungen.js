angular.module('wanderungen-service', []).factory('wanderungen', ['$http', function($http) {

    // $scope.paths
    var refresh = function(destObj) {
        return $http.get("json/wanderungen.geojson").success(function(data, status) {
            var json = '{ ';
            var i = 0;
	        data.features.forEach(function(feature)
	        {
                json += (i == 0 ? '': ', ');
	            var index = 'wanderung_' + (++i);
	            json += ('"' + index + '": {');
	            json += '"type": "polyline",';
	            json += '"layer": "wanderungen",';
	            json += '"color": "orange",';
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
	        wanderungen = JSON.parse(json);
            console.log('wanderungen refresh...:');
            console.log(wanderungen);
            angular.extend(destObj, wanderungen);
        });
    }

    return {refresh: refresh}

}]);

