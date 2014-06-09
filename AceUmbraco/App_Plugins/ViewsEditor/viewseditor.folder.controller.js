angular.module("umbraco").controller("ViewsEditor.Folder", function ($scope, $http, $routeParams, notificationsService) {
    $scope.saveFolder = function () {
        $http.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

        var data = $.param({
            "Parent": $routeParams.id,
            "FolderName": $scope.foldername
        });

        $http.put("/umbraco/backoffice/api/ViewsEditor/PutSaveFolder/", data)
            .error(function () {
                notificationsService.error("Something went wrong! Check your log in App_Data\\Logs");
            })
            .success(function () {
                notificationsService.success("Folder saved");
            });
    };
});