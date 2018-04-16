let cors = require('cors');
let express = require('express');
let compression = require('compression');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let path = require("path");

let config = require("./config");

let app = express();
app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Including all Routes
let baseRoutes = require('./routes/api');
baseRoutes.includeRoutes(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    return res.status(404).json({ message: "No route found." });
});

let httpServer = require('http').createServer(app);
httpServer.listen(config.port, function () {
    console.log('Map Tracker Process is Running on ' + config.port + '.');
});

httpServer.timeout = 120000;

const io = require('socket.io')(httpServer);
let timerId = null;
let sockets = new Set();

io.on('connection', socket => {

    sockets.add(socket);
    console.log(`Socket ${socket.id} added`);

    if (!timerId) {
        startTimer();
    }

    socket.on('clientdata', data => {
        console.log(data);
    });

    socket.on('disconnect', () => {
        console.log(`Deleting socket: ${socket.id}`);
        sockets.delete(socket);
        console.log(`Remaining sockets: ${sockets.size}`);
    });

});

function startTimer() {
    //Simulate stock data received by the server that needs 
    //to be pushed to clients
    timerId = setInterval(() => {
        if (!sockets.size) {
            clearInterval(timerId);
            timerId = null;
            console.log(`Timer stopped`);
        }

        let locations = [
            {
                lat: 17.383309,
                lon: 78.4010528 // 17.383309!4d78.4010528 -- Golconda
            },
            {
                lat: 17.4617971,
                lon: 78.3671564 // Kondapur 17.4617971,78.3671564,15z
            }
        ]
        let location = locations[Math.floor(Math.random()*locations.length)];
        //See comment above about using a "room" to emit to an entire
        //group of sockets if appropriate for your scenario
        //This example tracks each socket and emits to each one
        for (const s of sockets) {
            console.log(`Emitting value: ${location.lat}, ${location.lon}`);
            s.emit('data', { data: location });
        }

    }, 20000);
}

module.exports = app;