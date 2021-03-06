const Utils = require('./server-utils/utils.js');
const express = require("express");
const app = express();
const server = require("http").Server(app);
const fs = require('fs');
const ss = require('socket.io-stream');

const io = require("socket.io")(server);

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function setRootDir(req, res) {
    res.render('index');
});

app.get('/getData', function getDa(req, res) {
    Utils.getDirData(res).then((response) => res.send(response.children));
});

io.on('connection', (socket) => {

    // let strData = '';
    socket.on('message', (socket) => {
        console.log('connection established');

        var readStream = fs.createReadStream(("./public/assets/data/singer/owais-raza-qadri/nabi-ka-jashn-aya.mp3"), {
            'encoding': null
        });

        // let data = '';
        readStream.on('data', function (data) {
            io.emit('message', {
                buffer: data
            });
        });

        // // var readStream = fs.createReadStream("./public/assets/data/singer/owais-raza-qadri/nabi-ka-jashn-aya.mp3",
        //     {
        //         'flags': 'r',
        //         'encoding': 'binary',
        //         'mode': 0666,
        //         'bufferSize': 64 * 1024
        //     });
        // readStream.on('data', function (data) {
        // console.log(typeof data);
        // console.log('sending chunk of data')
        // socket.send(data);
        // io.emit('message', data);
        // strData += data;
        // });
        // readStream.on('end', function lastData() {
        //     io.emit('message', strData);
        // });
    });
});


server.listen(process.env.PORT || 8080);