var mongo = require('mongodb');

var Config = require('../config');
var earthquakes = require('../data/earthquakes');

var MongoClient = mongo.MongoClient,
    Server = mongo.Server,
    Db = mongo.Db,
    db = null,
    BSON = mongo.BSONPure;
    ObjectID = mongo.ObjectID;

/*
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

mongo.Db.connect(mongoUri, function (err, db) {
  db.collection('mydocs', function(er, collection) {
    collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
    });
  });
}); */

var databaseUrl = Config[process.env.NODE_ENV || 'dev'].database.url;

exports.initDatabase = function(callback) {
    MongoClient.connect(databaseUrl, function(err, myDb) {
        if (err) throw err;
        db = myDb;

        db.collection('earthquakes', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'earthquakes' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
            callback();
        });
    });
};

// var server = new Server('localhost', 27017, {auto_reconnect: true});
// db = new Db('earthquakesDB', server);

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving earthquake: ' + id);
    db.collection('earthquakes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

/*
    GET /earthquakes.json
    # Returns all earthquakes

    GET /earthquakes.json?on=1364582194
    # Returns earthquakes on the same day (UTC) as the unix timestamp 1364582194

    GET /earthquakes.json?since=1364582194
    # Returns earthquakes since the unix timestamp 1364582194

    GET /earthquakes.json?over=3.2
    # Returns earthquakes > 3.2 magnitude

    GET /earthquakes.json?near=36.6702,-114.8870
    # Returns all earthquakes within 5 miles of lat: 36.6702, lng: -114.8870

    NOTES:

    The endpoint should be able to take any combination of GET params, and
    filter the results properly. If on and since are both present, it should
    return results since the timestamp until the end of that day.

    EXAMPLES:

    GET /earthquakes.json?over=3.2&near=36.6702,-114.8870&since=1364582194
    # Returns all earthquakes over 3.2 magnitude within 5 miles of 36.6702,-114.8870 since 2013-03-29 18:36:34 UTC

    GET /earthquakes.json?over=3.2&on=1364582194&since=1364582194
    # Returns all earthquakes over 3.2 magnitude between 2013-03-29 18:36:34 UTC and 2013-03-29 23:59:59 UTC
*/

exports.findAll = function(req, res) {
    //Add queries to this list so we can process them later at once
    var filterList = [];

    if (req.query.on) {
        filterList.push({key:'on', value: req.query.on});
    }

    if (req.query.since) {
        filterList.push({key:'since', value: req.query.since});
    }

    if (req.query.over) {
        filterList.push({key:'over', value: req.query.over});
    }

    if (req.query.near) {
        filterList.push({key:'near', value: req.query.near});
    }


/*    if (req.query.on) {
        console.log(req.query);
        db.collection('earthquakes', function(err, collection) {
            collection.find({ Eqid : 72215301}).toArray(function(err, items) {
                res.send(items);
            });
        });
        return;
    }
 */
    db.collection('earthquakes', function(err, collection) {
        collection.find().toArray(function(err, items) {
            items = filterResults(items, filterList);
            res.send(items);
        });
    });
};

var filterResults = function(items, filterList) {
    var filteredItem = [];

    for (filter in filterList) {
        if (filterList[filter].key == 'on') {
            var inputDate = new Date(filterList[filter].value * 1000);
            inputDate = Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate());

            for (i in items) {
                var Datetime = new Date(Date.parse(items[i].Datetime));

                Datetime = Date.UTC(Datetime.getUTCFullYear(), Datetime.getUTCMonth(), Datetime.getUTCDate());
                var ms = Math.abs(inputDate-Datetime);
                dayDiff = Math.floor(ms/1000/60/60/24);

                if (dayDiff == 0) {
                    filteredItem.push(items[i]);
                }
            }
            items = filteredItem;
            filteredItem = [];
        }

        if (filterList[filter].key == 'since') {
            var inputDate = new Date(filterList[filter].value * 1000);

            for (i in items) {
                var Datetime = new Date(Date.parse(items[i].Datetime));

                if (Datetime-inputDate >= 0) {
                    filteredItem.push(items[i]);
                }
            }
            items = filteredItem;
            filteredItem = [];
        }


        if (filterList[filter].key == 'over') {
            for (i in items) {
                if (items[i].Magnitude > filterList[filter].value) {
                    filteredItem.push(items[i]);
                }
            }
            items = filteredItem;
            filteredItem = [];
        }

        if (filterList[filter].key == 'near') {
            var inputLocationForCompare = filterList[filter].value.split(',');

            for (i in items) {
                var myLat = parseFloat(items[i].Lat);
                var myLon = parseFloat(items[i].Lon);

                if (withXMiles(myLat,myLon, parseFloat(inputLocationForCompare[0]), parseFloat(inputLocationForCompare[1]),5)) {
                    filteredItem.push(items[i]);
                }
            }
            items = filteredItem;
            filteredItem = [];
        }
    }

    return items;
}

/** Converts numeric degrees to radians */
Math.radians = function(deg)
 {
    return deg * (Math.PI/180);
 }

//Given two points, return true if they are within x miles
//Use the ‘haversine’ formula to calculate the great-circle distance between two points
//http://www.movable-type.co.uk/scripts/latlong.html
var withXMiles = function(lat1, lon1, lat2, lon2, x) {
    var R = 3959; // miles

    var φ1 = Math.radians(lat1);
    var φ2 = Math.radians(lat2);
    var Δφ = Math.radians(lat2-lat1);
    var Δλ = Math.radians(lon2-lon1);

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d_in_miles = R * c;

    if (d_in_miles <= x) {
        return true;
    }

    return false;
}

exports.addEarthquake = function(req, res) {
    var earthquake = req.body;
    console.log('Adding earthquake: ' + JSON.stringify(earthquake));
    db.collection('earthquakes', function(err, collection) {
        collection.insert(earthquake, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateEarthquake = function(req, res) {
    var id = req.params.id;
    var earthquake = req.body;
    console.log('Updating earthquake: ' + id);
    console.log(JSON.stringify(earthquake));
    db.collection('earthquakes', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, earthquake, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating earthquake: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(earthquake);
            }
        });
    });
}

exports.deleteEarthquake = function(req, res) {
    var id = req.params.id;
    console.log('Deleting earthquake: ' + id);
    db.collection('earthquakes', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {
    db.collection('earthquakes', function(err, collection) {
        collection.insert(earthquakes, {safe:true}, function(err, result) {});
    });
};
