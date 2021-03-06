var express = require('express');
var app = express();
var firebase = require("firebase");
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');

var tokenSlack = "QU9b6PjFqWg3mvHKeun1A4mA";

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
    res.setHeader('Content-Type', 'application/json');
    var reqs = req.body.text.split(" ");
    if (req.body.token == tokenSlack) {
        if (reqs[0] == "add") {
            var details = req.body.text.replace(reqs[0]+" ", "");
            details = details.replace(reqs[1]+" ", "");
            bombons.push().set({
                date: new Date().toJSON(),
                userAccuser: "@"+req.body.user_name,
                userAccused: reqs[1],
                detail: details
            });
            var resposta = {};
            resposta.text = "Erro Adicionado para "+reqs[1]+ " por cometer o seguinte erro "+details;
            resposta.response_type = "in_channel";
            res.end(JSON.stringify(resposta));
        } else if (reqs[0] == "list") {
            ref.once("value", function (snapshot) {
                var resposta = {};
                resposta.text = "Rank de bombons";
                resposta.attachments = [];
                resposta.response_type = "in_channel";
                if (snapshot.val() == undefined) {
                    resposta.text = "Rank de bombons - Não há bombons";
                } else {
                    var bombons = snapshot.val().bombons;
                    if (reqs[1] !== undefined) {
                        if (reqs[1] == "completed") {
                            for (i = 0; i < Object.keys(bombons).length; i++) {
                                var obj = bombons[Object.keys(bombons)[i]];
                                var attachment = {};
                                attachment.fields = [
                                    {
                                        "title": "Dedo dudo",
                                        "value": obj.userAccuser,
                                        "short": true
                                    },
                                    {
                                        "title": "Se fodeu ",
                                        "value": obj.userAccused,
                                        "short": true
                                    },
                                    {
                                        "title": "Erro",
                                        "value": obj.detail,
                                        "short": false
                                    }
                                ];
                                attachment.footer = dateFormat(obj.date, "dd-mm-yyyy");
                                attachment.color = "good"
                                resposta.attachments.push(attachment);
                            }
                        } else if (reqs[1] == "user") {
                            var user;
                            if (reqs[2] !== undefined) {
                                user = reqs[2];
                            } else {
                                user = "@" + req.body.user_name;
                            }
                            for (i = 0; i < Object.keys(bombons).length; i++) {
                                var obj = bombons[Object.keys(bombons)[i]];
                                var attachment = {};
                                if (obj.userAccused == user) {
                                    attachment.fields = [
                                        {
                                            "title": "Dedo dudo",
                                            "value": obj.userAccuser,
                                            "short": true
                                        },
                                        {
                                            "title": "Se fodeu ",
                                            "value": obj.userAccused,
                                            "short": true
                                        },
                                        {
                                            "title": "Erro",
                                            "value": obj.detail,
                                            "short": false
                                        }
                                    ];
                                    attachment.footer = dateFormat(obj.date, "dd-mm-yyyy");
                                    attachment.color = "good"
                                    resposta.attachments.push(attachment);
                                }
                            }
                        }
                    } else {

                        for (i = 0; i < Object.keys(bombons).length; i++) {
                            var obj = bombons[Object.keys(bombons)[i]];
                            var attachment = {};
                            var notAdd = true;
                            for (x = 0; resposta.attachments.length != x; x++) {
                                if (resposta.attachments[x].author_name == obj.userAccused) {
                                    resposta.attachments[x].text++;
                                    notAdd = false;
                                }
                                continue;
                            }
                            if (notAdd) {
                                attachment.author_name = obj.userAccused;
                                attachment.text = 1;
                                attachment.color = "good"
                                resposta.attachments.push(attachment);
                            }
                        }
                    }
                }
                res.end(JSON.stringify(resposta));
            });

        }else{
            res.end("Sou burro");
        }
    }else {
        res.end("Sou burro");
    }
});

var server = app.listen(process.env.PORT, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});