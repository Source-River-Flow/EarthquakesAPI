var express = require('express'),
    earthquake = require('./routes/earthquakes');

var app = express();
var port = process.env.PORT || 3000;

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(function(req, res, next) {
        earthquake.initDatabase(function() {
            next();
        });
    });
});

app.get('/earthquakes.json', earthquake.findAll);
app.get('/earthquakes.json/:id', earthquake.findById);
app.post('/earthquakes.json', earthquake.addEarthquake);
app.put('/earthquakes.json/:id', earthquake.updateEarthquake);
app.delete('/earthquakes.json/:id', earthquake.deleteEarthquake);

app.listen(port);
console.log('Server started, listening on port ' + port + '....');
