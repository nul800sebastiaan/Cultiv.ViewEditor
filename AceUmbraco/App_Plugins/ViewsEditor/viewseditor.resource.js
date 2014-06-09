function viewsEditorResource($q, $http, umbDataFormatter, umbRequestHelper) {
	return {

	    deleteFile: function (path) {
		    return umbRequestHelper.resourcePromise(
		        $http.get("/umbraco/backoffice/api/ViewsEditor/GetDeleteByPath?path=" + path),
                'Failed to delete item ' + path);
		}
    };
}

angular.module('umbraco.resources').factory('viewsEditorResource', viewsEditorResource);