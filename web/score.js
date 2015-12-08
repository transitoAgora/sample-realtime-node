var webSocket = new WebSocket("ws://localhost:8091");
angular.module('scoreApp', ['chart.js'])
  .controller('ScoreController', function($scope) {
    var teamController = this;
    teamController.data = {};
    teamController.table = [];
    $scope.labels = [];
    $scope.series = [];
    $scope.data = [];
    webSocket.onopen = function() {
      webSocket.send('i am a client');
      webSocket.onmessage = function(menssage) {
        var messageData = JSON.parse(menssage.data);
        if (messageData.tag !== '-') {
          var dataObject = teamController.data[messageData.tag];
          if (!dataObject) {
            teamController.data[messageData.tag] = messageData;
            $scope.series.push(messageData.tag);
            $scope.labels = $scope.series;
            messageData.index = teamController.table.length;
            teamController.table.push(messageData);
            $scope.data.push(messageData.count);
          } else {
            dataObject.count = messageData.count;
            $scope.data[dataObject.index] = messageData.count;
          }
          $scope.$apply();
        };
      };
    };
  });