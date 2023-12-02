/***********************************************************
* Developer: Minhas Kamal (minhaskamal024@gmail.com)       *
* Website: https://github.com/MinhasKamal/TheGitDown          *
* License: MIT License                                     *
***********************************************************/

var siteHeaderText = {};

var TheGitDown = angular.module('TheGitDown', [
    'ngRoute',
    'homeModule',
    'toastr',
]);

TheGitDown.config([
    '$routeProvider',
    
    function($routeProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/home',
            })
            .otherwise({
                redirectTo: '/home',
            });
    }
]);

TheGitDown.config([
    'toastrConfig',
    
    function(toastrConfig) {
        angular.extend(toastrConfig, {
            positionClass: 'toast-bottom-right',
            maxOpened: 3,
        });
    }
]);
