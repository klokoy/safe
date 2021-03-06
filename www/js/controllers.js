angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, auth, $state, $timeout, $ionicModal, $cordovaDeviceOrientation, store) {
    $scope.user = '';
    $scope.pass = '';

    $scope.model = {};

    var options = {
        frequency: 500
    }; // Update every 1 second

    $timeout(function() {
        try {
            var watch = $cordovaDeviceOrientation.watchHeading(options);
        } catch (e) {
            alert(e);
        }


        watch.promise.then(
            function(result) {
                //                console.log(result);
            },
            function(err) {
                alert(err);
            },
            function(position) {
                $scope.number = Math.floor(position.magneticHeading / 10);
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

    }, 500);


    function onLoginSuccess(profile, token) {

        store.set('profile', profile);
        store.set('token', token);

        $state.go('in');
        $scope.loading = false;
    }

    function onLoginFailed(error) {

        $scope.openModal();

        $scope.model.username = undefined;
    }

    $scope.reset = function() {
        auth.reset({
            email: 'hello@bye.com',
            password: 'hello',
            connection: 'Username-Password-Authentication'
        });
    }

    $scope.click = function() {

        if ($scope.model.username) {

            var username = $scope.model.username + '@safe.com';
            var pw = 'pw' + $scope.number;

            $scope.loading = true;
            auth.signin({
                connection: 'Username-Password-Authentication',
                username: username,
                password: pw,
                scope: 'openid name email'
            }, onLoginSuccess, onLoginFailed);
        } else {
            $scope.model.username = $scope.number;
        }

    };

    $ionicModal.fromTemplateUrl('shit.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });
})



.controller('CashCtrl', function($scope, $http, $state) {

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
