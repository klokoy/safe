angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, auth, $state, $timeout, $cordovaDeviceOrientation, store) {
    $scope.user = '';
    $scope.pass = '';

    alert($cordovaDeviceOrientation);

    var options = {
        frequency: 1000
    }; // Update every 1 second

    $timeout(function() {
        try {
            var watch = $cordovaDeviceOrientation.watchHeading(options);
        } catch (e) {
            alert(e);
        }


        watch.promise.then(
            function(result) {
                console.log(result);
            },
            function(err) {
                alert(err);
            },
            function(position) {
                alert(position);
                $scope.position = position;
                // position.magneticHeading
            });

        /*
        $cordovaDeviceOrientation.clearWatch(watch.watchId)
            .then(function(result) {
                // Success!
            }, function(err) {
                // An error occurred
            });
            */

    }, 2000)


    function onLoginSuccess(profile, token) {

        alert('success');

        store.set('profile', profile);
        store.set('token', token);

        $state.go('in');
        $scope.loading = false;
    }

    function onLoginFailed() {

        console.log('shit');

        $scope.message.text = 'invalid credentials';
        $scope.loading = false;
    }

    $scope.reset = function() {
        auth.reset({
            email: 'hello@bye.com',
            password: 'hello',
            connection: 'Username-Password-Authentication'
        });
    }

    $scope.login = function() {

        alert("login");

        $scope.loading = true;
        auth.signin({
            connection: 'Username-Password-Authentication',
            username: 'max@safe.com',
            password: 'max',
            scope: 'openid name email'
        }, onLoginSuccess, onLoginFailed);

    };
})



.controller('CashCtrl', function($scope, $http, $state) {

    $scope.yohoo = 'yes';

    $scope.logout = function() {
        $state.go('logout');
    }


})

.controller('LogoutCtrl', function(auth, $scope, $location, store) {
    auth.signout();
    $scope.$parent.message = '';
    store.remove('profile');
    store.remove('token');
    $location.path('/login');
});
