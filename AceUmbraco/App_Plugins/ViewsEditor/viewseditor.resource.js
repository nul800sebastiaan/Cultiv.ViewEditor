function viewsEditorResource($q, $http, umbDataFormatter, umbRequestHelper) {
	return {

		deleteFile: function(path) {
		    return umbRequestHelper.resourcePromise(
		        $http.post("/umbraco/backoffice/api/ViewsEditor/PostDeleteByPath", { path: path }),
                'Failed to delete item ' + path);
		}
    };
}

angular.module('umbraco.resources').factory('viewsEditorResource', viewsEditorResource);