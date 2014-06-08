angular.module("umbraco").controller("Cultiv.ViewsEditor", function ($scope, $routeParams, $http, $element, dialogService, notificationsService) {

    angular.forEach($element.find('.ace-editor-item'), function (element) {
        $http.get("/umbraco/backoffice/api/ViewsEditor/GetByPath/?path=" + $routeParams.id)
            .then(function (response) {

                var contents    = response.data.Value;
                $scope.contents = contents;
                $scope.layout   = response.data.Layout;
                $scope.sections = response.data.Sections;
                $scope.filename = $routeParams.id;
                
                //Create our ace editor
                var editor = ace.edit(element);

                //Set the mode of the editor
                editor.getSession().setMode("ace/mode/html");

                //Set the theme of the editor
                editor.setTheme("ace/theme/github");

                //Insert file contents from API into editor
                editor.setValue($scope.contents);

                //Insert cursor at line 1
                editor.gotoLine(1);

                //On any change to the editor update the scope value from the editor
                editor.getSession().on('change', function () {
                    $scope.contents = editor.getSession().getValue();
                });


                $scope.insertMacro = function () {
                    dialogService.macroPicker({ scope: $scope, callback: renderMacro });
                }

                $scope.saveView = function () {
                    var jsonContents = angular.toJson($scope.contents);

                    $http.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

                    var parent = "";
                    if ($routeParams.create) {
                        parent = $routeParams.id;
                    }

                    var data = $.param({
                        "FileName": $routeParams.id,
                        "NewFileName": $scope.filename,
                        "Parent": parent,
                        "Value": jsonContents
                    });

                    $http.put("/umbraco/backoffice/api/ViewsEditor/PutSaveView/", data)
                        .error(function () {
                            notificationsService.error("Something went wrong! Check your log in App_Data\Logs");
                        })
                        .success(function () {
                            notificationsService.success("View saved");
                        });
                }

                function renderMacro(data) {
                    var macroProperties = 0;
                    var macroPropertiesString = "";

                    for (var key in data.macroParamsDictionary) {
                        macroProperties = macroProperties + 1;
                        var propertyValue = data.macroParamsDictionary[key];

                        if (macroProperties > 1) {
                            macroPropertiesString = macroPropertiesString + ", ";
                        }

                        var value;
                        if (propertyValue === "null") {
                            value = "=\"" + "\"";
                        } else {
                            value = "=\"" + propertyValue + "\"";
                        }

                        macroPropertiesString = macroPropertiesString + key + value;
                    }

                    var macroCode;
                    if (macroProperties === 0) {
                        macroCode = "@Umbraco.RenderMacro(\"" + data.macroAlias + "\")";
                    } else {
                        macroCode = "@Umbraco.RenderMacro(\"" + data.macroAlias + "\", new { " + macroPropertiesString + " })";
                    }

                    editor.insert(macroCode);
                }

                $scope.renderSection = function () {
                    dialogService.open({
                        template: "/App_Plugins/ViewsEditor/Dialogs/sectionedit.html",
                        show: true,
                        dialogData: { layout: $scope.layout },
                        callback: $scope.renderSectionConfirm
                    });
                };

                $scope.renderSectionConfirm = function (dialogData) {
                    var required = false;
                    if (dialogData.sectionRequired !== undefined) {
                        required = true;
                    }

                    var sectionCode = "";

                    if (required) {
                        sectionCode = "@RenderSection(\"" + dialogData.sectionName + "\")";
                    }

                    if (required === false && dialogData.alternativeContent !== undefined && dialogData.alternativeContent !== "") {
                        sectionCode = "@RenderSection(\"" + dialogData.sectionName + "\", \"" + dialogData.alternativeContent + "\")";
                    }

                    if (required === false && (dialogData.alternativeContent === undefined || dialogData.alternativeContent === "")) {
                        sectionCode = "@RenderSection(\"" + dialogData.sectionName + "\", false)";
                    }

                    editor.insert(sectionCode);
                }

                $scope.implementSection = function () {
                    for (var section in $scope.sections) {
                        $scope.sections[section].RequiredText = $scope.sections[section].Required === true ? "(required)" : "";
                    }
                    dialogService.open({
                        template: "/App_Plugins/ViewsEditor/Dialogs/sectionedit.html",
                        show: true,
                        dialogData: { layout: $scope.layout, sections: $scope.sections },
                        callback: $scope.implementSectionConfirm
                    });
                };

                $scope.implementSectionConfirm = function (dialogData) {
                    var sectionCode = "@section " + dialogData.sectionName + " { \n\t@* Implement the section here *@ \n}";
                    editor.insert(sectionCode);
                }

                $scope.renderBody = function () {
                    editor.insert("@RenderBody()");
                }
            });
    });
});