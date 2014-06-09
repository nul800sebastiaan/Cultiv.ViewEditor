function ViewDeleteController($scope, $routeParams, $http, $element, treeService, navigationService, viewsEditorResource) {

	//The Routeparam id is the filename
    $scope.FileName = $routeParams.id;

	$scope.performDelete = function() {
		
		//Mark it for deletion (used in the UI)
		$scope.currentNode.loading = true;

		//Delete file via the WebAPI
	    viewsEditorResource.deleteFile($scope.FileName).then(function() {

			//Finished loading
	        $scope.currentNode.loading = false;

	    	//Remove the node/file from the tree
	    	treeService.removeNode($scope.currentNode);

			//Hide/close the menu
	    	navigationService.hideMenu();
	    });		
	};

	$scope.cancel = function() {
		navigationService.hideDialog();
	};
}

angular.module("umbraco").controller("ViewsEditor.Dialog.Delete", ViewDeleteController);