var express = require('express');
var app = express();
var fs = require("fs");
var firebase = require("firebase");
var bodyParser = require('body-parser');

app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));

firebase.initializeApp({
    serviceAccount:  __dirname + "/bombom-count.json",
    databaseURL: "https://bombom-count.firebaseio.com"
});

var db = firebase.database();
var ref = db.ref();

app.post('/slack', function (req, res) {
    var bombons = ref.child("bombons");
    var reqs = req.body.text.split(" ");
    if (reqs[0] == "add") {
        bombons.push().set({
            date: new Date().toJSON(),
            userAccuser: req.body.user_name,
            userAccused: reqs[1],
            detail: reqs[2]
        });
        res.end("Ok");
    } else if (reqs[0] == "list") {
        ref.once("value", function (snapshot) {
            var array = [];
            var bombons = snapshot.val().bombons;
            for(i=0;  i < Object.keys(bombons).length; i++){
                array.push(bombons[Object.keys(bombons)[i]]);
            }
            console.log(array);
            res.end(JSON.stringify(array));
        });
    } else {
        res.end("Sou burro");
    }

});

var server = app.listen(process.env.PORT, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});