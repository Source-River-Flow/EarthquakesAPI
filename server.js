var express = require('express'),
    earthquake = require('./routes/earthquakes');
 
var app = express();
 
app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});
 
app.get('/earthquakes.json', earthquake.findAll);
app.get('/earthquakes.json/:id', earthquake.findById);
app.post('/earthquakes.json', earthquake.addEarthquake);
app.put('/earthquakes.json/:id', earthquake.updateEarthquake);
app.delete('/earthquakes.json/:id', earthquake.deleteEarthquake);
 
app.listen(3000);
console.log('Listening on port 3000...');