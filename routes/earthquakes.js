var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
	ObjectID = mongo.ObjectID;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('earthquakesDB', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'earthquakesDB' database");
        db.collection('earthquakes', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'earthquakes' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
			else {
				 console.log("The 'earthquakes' collection does exist. Use existing ones.");
			}
        });
    }
});
 
exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving earthquake: ' + id);
    db.collection('earthquakes', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};
 
exports.findAll = function(req, res) {
    //Add queries to this list so we can process them later at once
    var filterList = []; 

    if (req.query.on) {
        filterList.push({key:'on', value: req.query.on});
    }

    if (req.query.on) {
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
    //console.log(filterList);
    var filteredItem = [];

    for (filter in filterList) {
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
            for (i in items) {
                if (withXMiles(5)) {
                    filteredItem.push(items[i]);
                }
            } 
            items = filteredItem;
            filteredItem = [];
        }  
      
    }

    //console.log(filteredItem);
    return items;
}

//To do: implement this function
var withXMiles = function(x) {
    return true;
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
 
    var earthquakes = [ {"Src":"nc","Eqid":72215301,"Version":0,"Datetime":"Sunday, May  4, 2014 03:22:40 UTC","Lat":38.8363,"Lon":-122.8780,"Magnitude":1.0,"Depth":3.00,"NST": 8,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72215296,"Version":0,"Datetime":"Sunday, May  4, 2014 03:22:07 UTC","Lat":38.8338,"Lon":-122.8773,"Magnitude":1.3,"Depth":2.70,"NST":18,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72215286,"Version":0,"Datetime":"Sunday, May  4, 2014 03:09:20 UTC","Lat":37.7617,"Lon":-121.9208,"Magnitude":1.5,"Depth":9.20,"NST":12,"Region":"San Francisco Bay area, California"},
                        {"Src":"nc","Eqid":72215266,"Version":0,"Datetime":"Sunday, May  4, 2014 02:02:02 UTC","Lat":37.6627,"Lon":-118.8532,"Magnitude":1.2,"Depth":5.30,"NST":11,"Region":"Long Valley area, California"},
                        {"Src":"hv","Eqid":60683046,"Version":1,"Datetime":"Sunday, May  4, 2014 01:56:17 UTC","Lat":19.3735,"Lon":-155.2887,"Magnitude":1.8,"Depth":3.10,"NST":22,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72215256,"Version":1,"Datetime":"Sunday, May  4, 2014 01:41:47 UTC","Lat":38.8055,"Lon":-122.8218,"Magnitude":1.2,"Depth":2.90,"NST":23,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72215241,"Version":0,"Datetime":"Sunday, May  4, 2014 01:23:14 UTC","Lat":40.2980,"Lon":-123.7182,"Magnitude":1.9,"Depth":21.80,"NST": 9,"Region":"Northern California"},
                        {"Src":"pr","Eqid":14124000,"Version":0,"Datetime":"Sunday, May  4, 2014 00:50:33 UTC","Lat":18.0450,"Lon":-67.2076,"Magnitude":2.3,"Depth":43.00,"NST": 7,"Region":"Mona Passage, Puerto Rico"},
                        {"Src":"uw","Eqid":60754187,"Version":1,"Datetime":"Sunday, May  4, 2014 00:05:44 UTC","Lat":49.3855,"Lon":-120.5152,"Magnitude":2.1,"Depth":0.00,"NST": 8,"Region":"British Columbia, Canada"},
                        {"Src":"nc","Eqid":72215216,"Version":0,"Datetime":"Saturday, May  3, 2014 23:20:24 UTC","Lat":37.6400,"Lon":-121.7068,"Magnitude":1.8,"Depth":5.60,"NST": 7,"Region":"Northern California"},
                        {"Src":"uw","Eqid":60754112,"Version":1,"Datetime":"Saturday, May  3, 2014 22:50:39 UTC","Lat":47.8782,"Lon":-121.6467,"Magnitude":2.8,"Depth":9.30,"NST":12,"Region":"Washington"},
                        {"Src":"pr","Eqid":14123006,"Version":0,"Datetime":"Saturday, May  3, 2014 22:15:46 UTC","Lat":18.0671,"Lon":-67.1632,"Magnitude":1.7,"Depth":21.00,"NST": 3,"Region":"Puerto Rico"},
                        {"Src":"nc","Eqid":72215166,"Version":0,"Datetime":"Saturday, May  3, 2014 21:31:47 UTC","Lat":38.8177,"Lon":-123.2597,"Magnitude":1.8,"Depth":5.60,"NST":18,"Region":"Northern California"},
                        {"Src":"uw","Eqid":60753917,"Version":1,"Datetime":"Saturday, May  3, 2014 20:11:22 UTC","Lat":46.2070,"Lon":-122.9807,"Magnitude":2.1,"Depth":9.60,"NST":27,"Region":"Washington"},
                        {"Src":"nc","Eqid":72215146,"Version":1,"Datetime":"Saturday, May  3, 2014 19:49:30 UTC","Lat":38.7882,"Lon":-122.7570,"Magnitude":1.5,"Depth":4.60,"NST":31,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72215121,"Version":1,"Datetime":"Saturday, May  3, 2014 18:42:31 UTC","Lat":37.6355,"Lon":-121.6928,"Magnitude":2.3,"Depth":3.30,"NST":34,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72215116,"Version":1,"Datetime":"Saturday, May  3, 2014 18:28:27 UTC","Lat":37.6340,"Lon":-121.6977,"Magnitude":2.7,"Depth":4.40,"NST":56,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72215086,"Version":1,"Datetime":"Saturday, May  3, 2014 17:29:05 UTC","Lat":36.5358,"Lon":-121.1210,"Magnitude":2.1,"Depth":3.00,"NST":24,"Region":"Central California"},
                        {"Src":"nc","Eqid":72215081,"Version":0,"Datetime":"Saturday, May  3, 2014 17:20:58 UTC","Lat":38.8233,"Lon":-122.8432,"Magnitude":1.0,"Depth":2.50,"NST":13,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72215071,"Version":1,"Datetime":"Saturday, May  3, 2014 17:14:00 UTC","Lat":36.5367,"Lon":-121.1213,"Magnitude":2.5,"Depth":3.30,"NST":40,"Region":"Central California"},
                        {"Src":"uw","Eqid":60753632,"Version":1,"Datetime":"Saturday, May  3, 2014 17:11:55 UTC","Lat":49.4542,"Lon":-120.4895,"Magnitude":2.3,"Depth":0.00,"NST": 8,"Region":"British Columbia, Canada"},
                        {"Src":"nc","Eqid":72215066,"Version":1,"Datetime":"Saturday, May  3, 2014 16:41:09 UTC","Lat":36.2793,"Lon":-121.7140,"Magnitude":2.1,"Depth":14.50,"NST":23,"Region":"Central California"},
                        {"Src":"nc","Eqid":72215046,"Version":0,"Datetime":"Saturday, May  3, 2014 16:02:44 UTC","Lat":37.6345,"Lon":-118.9518,"Magnitude":1.5,"Depth":8.10,"NST":14,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72215036,"Version":0,"Datetime":"Saturday, May  3, 2014 15:19:31 UTC","Lat":36.2890,"Lon":-121.7057,"Magnitude":1.6,"Depth":11.50,"NST": 9,"Region":"Central California"},
                        {"Src":"nc","Eqid":72215026,"Version":1,"Datetime":"Saturday, May  3, 2014 14:32:19 UTC","Lat":38.8195,"Lon":-122.8158,"Magnitude":1.7,"Depth":3.20,"NST":41,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60682736,"Version":2,"Datetime":"Saturday, May  3, 2014 13:58:57 UTC","Lat":19.4762,"Lon":-155.4503,"Magnitude":2.5,"Depth":3.80,"NST":96,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72215016,"Version":1,"Datetime":"Saturday, May  3, 2014 13:57:51 UTC","Lat":38.8118,"Lon":-122.7942,"Magnitude":1.0,"Depth":4.10,"NST":22,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72215001,"Version":0,"Datetime":"Saturday, May  3, 2014 12:55:06 UTC","Lat":36.0160,"Lon":-120.5777,"Magnitude":1.6,"Depth":4.20,"NST":20,"Region":"Central California"},
                        {"Src":"nc","Eqid":72214996,"Version":0,"Datetime":"Saturday, May  3, 2014 12:53:32 UTC","Lat":38.7928,"Lon":-122.7580,"Magnitude":1.0,"Depth":2.00,"NST":20,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214946,"Version":1,"Datetime":"Saturday, May  3, 2014 10:54:11 UTC","Lat":38.8215,"Lon":-122.8142,"Magnitude":1.8,"Depth":3.00,"NST":36,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214941,"Version":1,"Datetime":"Saturday, May  3, 2014 10:53:39 UTC","Lat":38.8217,"Lon":-122.8128,"Magnitude":2.3,"Depth":3.40,"NST":61,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214921,"Version":0,"Datetime":"Saturday, May  3, 2014 10:13:11 UTC","Lat":36.6857,"Lon":-121.0748,"Magnitude":1.4,"Depth":0.70,"NST":11,"Region":"Central California"},
                        {"Src":"pr","Eqid":14123005,"Version":0,"Datetime":"Saturday, May  3, 2014 10:11:36 UTC","Lat":19.2486,"Lon":-64.1956,"Magnitude":3.0,"Depth":111.00,"NST": 4,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72214916,"Version":0,"Datetime":"Saturday, May  3, 2014 09:58:29 UTC","Lat":40.3892,"Lon":-125.0620,"Magnitude":2.7,"Depth":3.70,"NST":13,"Region":"offshore Northern California"},
                        {"Src":"at","Eqid":72214916,"Version":1,"Datetime":"Saturday, May  3, 2014 09:51:09 UTC","Lat":67.8610,"Lon":-162.2600,"Magnitude":5.1,"Depth":22.00,"NST":38,"Region":"northern Alaska"},
                        {"Src":"nc","Eqid":72214901,"Version":0,"Datetime":"Saturday, May  3, 2014 09:37:50 UTC","Lat":36.8012,"Lon":-121.5252,"Magnitude":1.0,"Depth":6.40,"NST":15,"Region":"Central California"},
                        {"Src":"nc","Eqid":72214896,"Version":0,"Datetime":"Saturday, May  3, 2014 09:24:35 UTC","Lat":37.6593,"Lon":-118.8422,"Magnitude":1.1,"Depth":4.20,"NST": 6,"Region":"Long Valley area, California"},
                        {"Src":"pr","Eqid":14123004,"Version":0,"Datetime":"Saturday, May  3, 2014 09:17:33 UTC","Lat":19.1630,"Lon":-64.5262,"Magnitude":3.4,"Depth":11.00,"NST":20,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72214886,"Version":0,"Datetime":"Saturday, May  3, 2014 08:54:23 UTC","Lat":37.5987,"Lon":-118.8102,"Magnitude":1.6,"Depth":2.00,"NST": 9,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72214881,"Version":1,"Datetime":"Saturday, May  3, 2014 08:49:26 UTC","Lat":38.7892,"Lon":-122.7733,"Magnitude":2.5,"Depth":2.80,"NST":64,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60682646,"Version":2,"Datetime":"Saturday, May  3, 2014 08:46:38 UTC","Lat":19.3392,"Lon":-155.1320,"Magnitude":2.5,"Depth":6.30,"NST":99,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"uw","Eqid":60051908,"Version":1,"Datetime":"Saturday, May  3, 2014 08:44:44 UTC","Lat":45.6680,"Lon":-122.5925,"Magnitude":1.0,"Depth":10.20,"NST":23,"Region":"Portland urban area, Washington"},
                        {"Src":"hv","Eqid":60682636,"Version":1,"Datetime":"Saturday, May  3, 2014 07:20:28 UTC","Lat":19.3282,"Lon":-155.8387,"Magnitude":1.9,"Depth":6.80,"NST":58,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72214846,"Version":0,"Datetime":"Saturday, May  3, 2014 06:19:32 UTC","Lat":38.8338,"Lon":-122.7808,"Magnitude":1.1,"Depth":1.30,"NST":20,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214841,"Version":0,"Datetime":"Saturday, May  3, 2014 06:16:57 UTC","Lat":38.8350,"Lon":-122.7813,"Magnitude":1.1,"Depth":1.40,"NST": 9,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214836,"Version":0,"Datetime":"Saturday, May  3, 2014 06:16:49 UTC","Lat":38.8333,"Lon":-122.7793,"Magnitude":1.5,"Depth":1.30,"NST":17,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214831,"Version":0,"Datetime":"Saturday, May  3, 2014 05:52:02 UTC","Lat":40.4563,"Lon":-122.1805,"Magnitude":2.2,"Depth":16.00,"NST":11,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214801,"Version":1,"Datetime":"Saturday, May  3, 2014 05:04:39 UTC","Lat":40.4772,"Lon":-122.1655,"Magnitude":2.7,"Depth":14.20,"NST":28,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214781,"Version":1,"Datetime":"Saturday, May  3, 2014 04:40:31 UTC","Lat":38.8123,"Lon":-122.7960,"Magnitude":2.0,"Depth":3.30,"NST":39,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214776,"Version":1,"Datetime":"Saturday, May  3, 2014 04:32:06 UTC","Lat":40.6327,"Lon":-123.2003,"Magnitude":2.5,"Depth":31.20,"NST":30,"Region":"Northern California"},
                        {"Src":"pr","Eqid":14123001,"Version":0,"Datetime":"Saturday, May  3, 2014 03:34:44 UTC","Lat":17.8043,"Lon":-66.1440,"Magnitude":2.7,"Depth":7.00,"NST":20,"Region":"Puerto Rico region"},
                        {"Src":"pr","Eqid":14123002,"Version":0,"Datetime":"Saturday, May  3, 2014 03:30:20 UTC","Lat":19.1783,"Lon":-64.4257,"Magnitude":3.1,"Depth":64.00,"NST":12,"Region":"Virgin Islands region"},
                        {"Src":"pr","Eqid":14123003,"Version":0,"Datetime":"Saturday, May  3, 2014 03:18:52 UTC","Lat":19.5014,"Lon":-67.8253,"Magnitude":3.2,"Depth":39.00,"NST":11,"Region":"Dominican Republic region"},
                        {"Src":"hv","Eqid":60682456,"Version":1,"Datetime":"Saturday, May  3, 2014 02:41:18 UTC","Lat":19.4085,"Lon":-155.2677,"Magnitude":2.0,"Depth":2.80,"NST":27,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72214681,"Version":0,"Datetime":"Saturday, May  3, 2014 02:06:58 UTC","Lat":38.8365,"Lon":-122.8780,"Magnitude":1.4,"Depth":3.20,"NST": 6,"Region":"Northern California"},
                        {"Src":"pr","Eqid":14123000,"Version":0,"Datetime":"Saturday, May  3, 2014 01:38:05 UTC","Lat":18.9167,"Lon":-64.5637,"Magnitude":3.1,"Depth":6.00,"NST": 5,"Region":"Virgin Islands region"},
                        {"Src":"uw","Eqid":60752492,"Version":1,"Datetime":"Friday, May  2, 2014 23:48:36 UTC","Lat":46.4352,"Lon":-118.0618,"Magnitude":1.7,"Depth":2.00,"NST":16,"Region":"Washington"},
                        {"Src":"pr","Eqid":14122006,"Version":0,"Datetime":"Friday, May  2, 2014 21:56:38 UTC","Lat":18.9517,"Lon":-67.4235,"Magnitude":2.4,"Depth":22.00,"NST": 5,"Region":"Puerto Rico region"},
                        {"Src":"nc","Eqid":72214596,"Version":0,"Datetime":"Friday, May  2, 2014 21:29:39 UTC","Lat":40.7478,"Lon":-122.3137,"Magnitude":2.3,"Depth":0.90,"NST":14,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214591,"Version":0,"Datetime":"Friday, May  2, 2014 21:26:12 UTC","Lat":37.5327,"Lon":-118.8160,"Magnitude":1.2,"Depth":7.00,"NST":18,"Region":"Central California"},
                        {"Src":"pr","Eqid":14122005,"Version":0,"Datetime":"Friday, May  2, 2014 20:26:54 UTC","Lat":18.6928,"Lon":-66.7400,"Magnitude":2.8,"Depth":74.00,"NST":30,"Region":"Puerto Rico region"},
                        {"Src":"nc","Eqid":72214561,"Version":0,"Datetime":"Friday, May  2, 2014 19:55:17 UTC","Lat":38.7495,"Lon":-122.7022,"Magnitude":1.1,"Depth":2.30,"NST": 9,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60682246,"Version":3,"Datetime":"Friday, May  2, 2014 19:10:36 UTC","Lat":20.1457,"Lon":-155.8118,"Magnitude":1.9,"Depth":25.00,"NST":15,"Region":"Hawaii region, Hawaii"},
                        {"Src":"nc","Eqid":72214551,"Version":1,"Datetime":"Friday, May  2, 2014 19:08:48 UTC","Lat":38.8152,"Lon":-122.7908,"Magnitude":1.1,"Depth":3.20,"NST":27,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60682211,"Version":5,"Datetime":"Friday, May  2, 2014 18:24:37 UTC","Lat":19.3030,"Lon":-155.2647,"Magnitude":2.6,"Depth":7.20,"NST":77,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72214411,"Version":0,"Datetime":"Friday, May  2, 2014 15:19:52 UTC","Lat":37.6417,"Lon":-118.9495,"Magnitude":1.1,"Depth":7.50,"NST":15,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72214366,"Version":0,"Datetime":"Friday, May  2, 2014 13:36:03 UTC","Lat":38.9072,"Lon":-122.4927,"Magnitude":1.9,"Depth":7.40,"NST": 6,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60682076,"Version":2,"Datetime":"Friday, May  2, 2014 11:55:03 UTC","Lat":19.4015,"Lon":-155.2797,"Magnitude":1.7,"Depth":0.10,"NST":21,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"pr","Eqid":14122004,"Version":0,"Datetime":"Friday, May  2, 2014 11:01:19 UTC","Lat":19.2005,"Lon":-64.4104,"Magnitude":3.4,"Depth":38.00,"NST": 5,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72214331,"Version":1,"Datetime":"Friday, May  2, 2014 10:38:44 UTC","Lat":38.8312,"Lon":-122.7983,"Magnitude":1.7,"Depth":2.10,"NST":34,"Region":"Northern California"},
                        {"Src":"uw","Eqid":60751657,"Version":2,"Datetime":"Friday, May  2, 2014 10:11:48 UTC","Lat":45.9223,"Lon":-122.4028,"Magnitude":1.9,"Depth":12.20,"NST":35,"Region":"Washington"},
                        {"Src":"uu","Eqid":60066812,"Version":4,"Datetime":"Friday, May  2, 2014 10:03:44 UTC","Lat":44.5625,"Lon":-110.9030,"Magnitude":1.1,"Depth":11.10,"NST":15,"Region":"Yellowstone National Park, Wyoming"},
                        {"Src":"nc","Eqid":72214311,"Version":0,"Datetime":"Friday, May  2, 2014 09:36:28 UTC","Lat":37.6657,"Lon":-118.9227,"Magnitude":1.0,"Depth":0.00,"NST": 7,"Region":"Long Valley area, California"},
                        {"Src":"pr","Eqid":14122001,"Version":0,"Datetime":"Friday, May  2, 2014 09:16:31 UTC","Lat":18.2945,"Lon":-64.4278,"Magnitude":1.8,"Depth":12.00,"NST": 4,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72214296,"Version":0,"Datetime":"Friday, May  2, 2014 09:11:04 UTC","Lat":35.9972,"Lon":-121.5327,"Magnitude":2.0,"Depth":15.40,"NST": 7,"Region":"offshore Central California"},
                        {"Src":"pr","Eqid":14122003,"Version":0,"Datetime":"Friday, May  2, 2014 08:53:56 UTC","Lat":18.7308,"Lon":-64.9755,"Magnitude":2.7,"Depth":57.00,"NST": 5,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72214286,"Version":0,"Datetime":"Friday, May  2, 2014 08:43:19 UTC","Lat":36.0382,"Lon":-120.6062,"Magnitude":1.5,"Depth":3.10,"NST":19,"Region":"Central California"},
                        {"Src":"hv","Eqid":60681961,"Version":5,"Datetime":"Friday, May  2, 2014 08:35:05 UTC","Lat":19.3805,"Lon":-155.2352,"Magnitude":2.1,"Depth":2.40,"NST":42,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72214276,"Version":0,"Datetime":"Friday, May  2, 2014 08:27:38 UTC","Lat":38.9085,"Lon":-122.4945,"Magnitude":2.2,"Depth":7.20,"NST":10,"Region":"Northern California"},
                        {"Src":"uw","Eqid":60751592,"Version":3,"Datetime":"Friday, May  2, 2014 08:08:56 UTC","Lat":46.2063,"Lon":-122.9927,"Magnitude":2.2,"Depth":22.90,"NST":39,"Region":"Washington"},
                        {"Src":"hv","Eqid":60681946,"Version":3,"Datetime":"Friday, May  2, 2014 08:05:32 UTC","Lat":19.3728,"Lon":-156.1458,"Magnitude":2.2,"Depth":46.00,"NST":29,"Region":"Hawaii region, Hawaii"},
                        {"Src":"pr","Eqid":14122002,"Version":0,"Datetime":"Friday, May  2, 2014 08:04:50 UTC","Lat":18.9216,"Lon":-67.2914,"Magnitude":2.6,"Depth":16.00,"NST": 5,"Region":"Puerto Rico region"},
                        {"Src":"nc","Eqid":72214271,"Version":3,"Datetime":"Friday, May  2, 2014 07:58:21 UTC","Lat":38.9147,"Lon":-122.4933,"Magnitude":2.2,"Depth":6.80,"NST": 0,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214261,"Version":0,"Datetime":"Friday, May  2, 2014 07:54:10 UTC","Lat":38.9098,"Lon":-122.4950,"Magnitude":1.9,"Depth":6.10,"NST": 9,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214256,"Version":3,"Datetime":"Friday, May  2, 2014 07:46:17 UTC","Lat":40.2383,"Lon":-121.1580,"Magnitude":2.5,"Depth":0.20,"NST":59,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214251,"Version":2,"Datetime":"Friday, May  2, 2014 07:32:54 UTC","Lat":38.9100,"Lon":-122.4885,"Magnitude":2.1,"Depth":7.60,"NST":58,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214246,"Version":1,"Datetime":"Friday, May  2, 2014 07:29:49 UTC","Lat":40.2372,"Lon":-121.1583,"Magnitude":2.6,"Depth":0.00,"NST":30,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60681921,"Version":1,"Datetime":"Friday, May  2, 2014 07:21:25 UTC","Lat":19.4060,"Lon":-155.2645,"Magnitude":1.8,"Depth":6.10,"NST":24,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"pr","Eqid":14122000,"Version":0,"Datetime":"Friday, May  2, 2014 04:45:40 UTC","Lat":18.9694,"Lon":-65.2690,"Magnitude":2.6,"Depth":9.00,"NST": 5,"Region":"Puerto Rico region"},
                        {"Src":"nc","Eqid":72214191,"Version":1,"Datetime":"Friday, May  2, 2014 04:42:16 UTC","Lat":38.8142,"Lon":-122.8060,"Magnitude":1.0,"Depth":2.80,"NST":23,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214186,"Version":0,"Datetime":"Friday, May  2, 2014 04:21:59 UTC","Lat":37.6427,"Lon":-118.9480,"Magnitude":1.2,"Depth":7.50,"NST":14,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72214181,"Version":1,"Datetime":"Friday, May  2, 2014 04:20:38 UTC","Lat":38.7888,"Lon":-122.7702,"Magnitude":1.4,"Depth":4.20,"NST":31,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214161,"Version":0,"Datetime":"Friday, May  2, 2014 03:16:04 UTC","Lat":36.4633,"Lon":-121.0285,"Magnitude":1.5,"Depth":4.50,"NST":12,"Region":"Central California"},
                        {"Src":"nc","Eqid":72214141,"Version":0,"Datetime":"Friday, May  2, 2014 02:53:48 UTC","Lat":37.6232,"Lon":-118.9360,"Magnitude":1.5,"Depth":9.10,"NST":22,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72214121,"Version":1,"Datetime":"Friday, May  2, 2014 02:28:28 UTC","Lat":36.4615,"Lon":-121.0273,"Magnitude":2.3,"Depth":5.60,"NST":32,"Region":"Central California"},
                        {"Src":"nc","Eqid":72214086,"Version":1,"Datetime":"Friday, May  2, 2014 01:20:50 UTC","Lat":38.8027,"Lon":-122.7717,"Magnitude":1.3,"Depth":1.90,"NST":24,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214071,"Version":1,"Datetime":"Friday, May  2, 2014 01:17:06 UTC","Lat":38.8342,"Lon":-122.7825,"Magnitude":1.4,"Depth":2.50,"NST":25,"Region":"Northern California"},
                        {"Src":"uw","Eqid":60751312,"Version":2,"Datetime":"Friday, May  2, 2014 01:08:32 UTC","Lat":49.0437,"Lon":-122.6057,"Magnitude":1.7,"Depth":73.50,"NST":20,"Region":"British Columbia, Canada"},
                        {"Src":"nc","Eqid":72214036,"Version":1,"Datetime":"Friday, May  2, 2014 00:23:32 UTC","Lat":36.8137,"Lon":-121.5323,"Magnitude":1.9,"Depth":5.90,"NST":35,"Region":"Central California"},
                        {"Src":"nc","Eqid":72214026,"Version":1,"Datetime":"Thursday, May  1, 2014 23:35:43 UTC","Lat":38.8088,"Lon":-122.8238,"Magnitude":1.1,"Depth":2.40,"NST":23,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214016,"Version":0,"Datetime":"Thursday, May  1, 2014 23:21:22 UTC","Lat":37.6717,"Lon":-118.9273,"Magnitude":1.0,"Depth":4.00,"NST": 8,"Region":"Long Valley area, California"},
                        {"Src":"uw","Eqid":60751157,"Version":2,"Datetime":"Thursday, May  1, 2014 23:16:10 UTC","Lat":46.4348,"Lon":-119.0058,"Magnitude":1.6,"Depth":0.00,"NST":18,"Region":"Washington"},
                        {"Src":"uw","Eqid":60751047,"Version":1,"Datetime":"Thursday, May  1, 2014 21:35:02 UTC","Lat":49.4813,"Lon":-120.5240,"Magnitude":2.5,"Depth":0.00,"NST":14,"Region":"British Columbia, Canada"},
                        {"Src":"nc","Eqid":72213986,"Version":0,"Datetime":"Thursday, May  1, 2014 21:34:21 UTC","Lat":38.8023,"Lon":-122.7820,"Magnitude":1.1,"Depth":1.20,"NST":10,"Region":"Northern California"},
                        {"Src":"uw","Eqid":60750987,"Version":2,"Datetime":"Thursday, May  1, 2014 20:20:02 UTC","Lat":43.3815,"Lon":-123.1335,"Magnitude":1.1,"Depth":0.00,"NST": 9,"Region":"Oregon"},
                        {"Src":"nc","Eqid":72213901,"Version":0,"Datetime":"Thursday, May  1, 2014 19:00:30 UTC","Lat":36.5035,"Lon":-121.0868,"Magnitude":1.3,"Depth":4.10,"NST": 7,"Region":"Central California"},
                        {"Src":"hv","Eqid":60681661,"Version":1,"Datetime":"Thursday, May  1, 2014 18:58:31 UTC","Lat":19.4072,"Lon":-155.2818,"Magnitude":1.9,"Depth":1.90,"NST":27,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"pr","Eqid":14121002,"Version":0,"Datetime":"Thursday, May  1, 2014 17:38:44 UTC","Lat":18.8465,"Lon":-64.1360,"Magnitude":2.5,"Depth":37.00,"NST": 5,"Region":"Virgin Islands region"},
                        {"Src":"hv","Eqid":60681616,"Version":3,"Datetime":"Thursday, May  1, 2014 16:51:24 UTC","Lat":19.3350,"Lon":-155.1212,"Magnitude":1.5,"Depth":5.80,"NST":57,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"hv","Eqid":60681586,"Version":5,"Datetime":"Thursday, May  1, 2014 15:38:15 UTC","Lat":19.4167,"Lon":-155.3103,"Magnitude":2.0,"Depth":5.00,"NST":65,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"uw","Eqid":60750492,"Version":3,"Datetime":"Thursday, May  1, 2014 14:32:08 UTC","Lat":48.3087,"Lon":-121.8670,"Magnitude":1.0,"Depth":1.70,"NST":14,"Region":"Washington"},
                        {"Src":"nc","Eqid":72213691,"Version":1,"Datetime":"Thursday, May  1, 2014 12:41:36 UTC","Lat":38.8078,"Lon":-122.8215,"Magnitude":1.3,"Depth":2.50,"NST":26,"Region":"Northern California"},
                        {"Src":"pr","Eqid":14121003,"Version":0,"Datetime":"Thursday, May  1, 2014 12:23:49 UTC","Lat":17.9207,"Lon":-68.6573,"Magnitude":3.5,"Depth":137.00,"NST":12,"Region":"Dominican Republic region"},
                        {"Src":"nc","Eqid":72213676,"Version":0,"Datetime":"Thursday, May  1, 2014 11:57:10 UTC","Lat":37.6493,"Lon":-118.9470,"Magnitude":1.0,"Depth":8.60,"NST":14,"Region":"Long Valley area, California"},
                        {"Src":"hv","Eqid":60681426,"Version":2,"Datetime":"Thursday, May  1, 2014 10:11:28 UTC","Lat":19.4275,"Lon":-155.2598,"Magnitude":2.1,"Depth":4.50,"NST":32,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72213616,"Version":2,"Datetime":"Thursday, May  1, 2014 09:56:13 UTC","Lat":40.4288,"Lon":-121.2997,"Magnitude":1.0,"Depth":4.00,"NST":10,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72213606,"Version":2,"Datetime":"Thursday, May  1, 2014 09:53:27 UTC","Lat":40.4347,"Lon":-121.2947,"Magnitude":1.7,"Depth":8.00,"NST":13,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72213601,"Version":2,"Datetime":"Thursday, May  1, 2014 09:25:49 UTC","Lat":40.4310,"Lon":-121.2942,"Magnitude":1.3,"Depth":4.20,"NST":11,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72213586,"Version":1,"Datetime":"Thursday, May  1, 2014 09:03:39 UTC","Lat":38.7568,"Lon":-122.7310,"Magnitude":1.7,"Depth":2.50,"NST":26,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72213546,"Version":0,"Datetime":"Thursday, May  1, 2014 08:38:34 UTC","Lat":38.7587,"Lon":-122.7322,"Magnitude":1.2,"Depth":2.10,"NST":19,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60681371,"Version":2,"Datetime":"Thursday, May  1, 2014 08:02:43 UTC","Lat":19.4098,"Lon":-155.2762,"Magnitude":1.9,"Depth":3.80,"NST":32,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72213451,"Version":0,"Datetime":"Thursday, May  1, 2014 07:54:44 UTC","Lat":38.8077,"Lon":-122.7845,"Magnitude":1.0,"Depth":0.70,"NST":21,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60681361,"Version":1,"Datetime":"Thursday, May  1, 2014 07:52:29 UTC","Lat":19.4060,"Lon":-155.2842,"Magnitude":1.9,"Depth":1.50,"NST":33,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"pt","Eqid":14121000,"Version":5,"Datetime":"Thursday, May  1, 2014 06:36:37 UTC","Lat":-21.4560,"Lon":170.2590,"Magnitude":6.7,"Depth":112.00,"NST":19,"Region":"southeast of the Loyalty Islands"},
                        {"Src":"nc","Eqid":72213396,"Version":0,"Datetime":"Thursday, May  1, 2014 06:23:41 UTC","Lat":37.6400,"Lon":-118.8745,"Magnitude":1.0,"Depth":6.20,"NST": 8,"Region":"Long Valley area, California"},
                        {"Src":"pr","Eqid":14121000,"Version":0,"Datetime":"Thursday, May  1, 2014 06:10:29 UTC","Lat":18.6483,"Lon":-64.7535,"Magnitude":2.7,"Depth":7.00,"NST": 5,"Region":"Virgin Islands region"},
                        {"Src":"hv","Eqid":60681306,"Version":3,"Datetime":"Thursday, May  1, 2014 05:20:01 UTC","Lat":19.1787,"Lon":-155.7025,"Magnitude":1.6,"Depth":7.70,"NST":58,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72213321,"Version":0,"Datetime":"Thursday, May  1, 2014 04:51:49 UTC","Lat":37.6425,"Lon":-118.9505,"Magnitude":1.4,"Depth":7.20,"NST":21,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72213256,"Version":2,"Datetime":"Thursday, May  1, 2014 04:32:43 UTC","Lat":40.4702,"Lon":-122.0503,"Magnitude":2.1,"Depth":19.90,"NST":17,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72213241,"Version":0,"Datetime":"Thursday, May  1, 2014 04:08:02 UTC","Lat":38.8115,"Lon":-122.8142,"Magnitude":1.1,"Depth":2.40,"NST":11,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72213231,"Version":0,"Datetime":"Thursday, May  1, 2014 03:54:58 UTC","Lat":35.8795,"Lon":-121.4587,"Magnitude":1.5,"Depth":9.80,"NST": 9,"Region":"offshore Central California"},
                        {"Src":"nc","Eqid":72213221,"Version":3,"Datetime":"Thursday, May  1, 2014 03:27:34 UTC","Lat":36.2437,"Lon":-120.8038,"Magnitude":2.2,"Depth":7.20,"NST":83,"Region":"Central California"},
                        {"Src":"nc","Eqid":72213201,"Version":0,"Datetime":"Thursday, May  1, 2014 02:35:20 UTC","Lat":37.6442,"Lon":-118.9510,"Magnitude":1.0,"Depth":7.50,"NST": 9,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72213196,"Version":3,"Datetime":"Thursday, May  1, 2014 02:33:54 UTC","Lat":40.4238,"Lon":-121.2725,"Magnitude":2.1,"Depth":2.40,"NST":16,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72213191,"Version":3,"Datetime":"Thursday, May  1, 2014 02:33:36 UTC","Lat":40.4237,"Lon":-121.2717,"Magnitude":1.7,"Depth":2.50,"NST":16,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72213186,"Version":2,"Datetime":"Thursday, May  1, 2014 02:19:59 UTC","Lat":40.4597,"Lon":-121.2978,"Magnitude":1.0,"Depth":0.00,"NST": 9,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72213181,"Version":3,"Datetime":"Thursday, May  1, 2014 02:18:53 UTC","Lat":40.4253,"Lon":-121.2700,"Magnitude":1.1,"Depth":3.10,"NST":13,"Region":"Northern California"},
                        {"Src":"uw","Eqid":60749772,"Version":2,"Datetime":"Thursday, May  1, 2014 00:58:31 UTC","Lat":46.0995,"Lon":-122.3817,"Magnitude":1.2,"Depth":15.30,"NST":28,"Region":"Washington"},
                        {"Src":"uu","Eqid":60066697,"Version":4,"Datetime":"Wednesday, April 30, 2014 23:52:22 UTC","Lat":44.6963,"Lon":-111.0307,"Magnitude":1.1,"Depth":6.00,"NST": 9,"Region":"Yellowstone National Park, Wyoming"},
                        {"Src":"uw","Eqid":60749617,"Version":2,"Datetime":"Wednesday, April 30, 2014 22:22:54 UTC","Lat":44.1047,"Lon":-123.0495,"Magnitude":1.8,"Depth":0.00,"NST":12,"Region":"Oregon"},
                        {"Src":"pr","Eqid":14120005,"Version":0,"Datetime":"Wednesday, April 30, 2014 22:20:23 UTC","Lat":19.0212,"Lon":-65.2590,"Magnitude":2.7,"Depth":30.00,"NST": 7,"Region":"Puerto Rico region"},
                        {"Src":"pr","Eqid":14120004,"Version":0,"Datetime":"Wednesday, April 30, 2014 22:16:11 UTC","Lat":18.9230,"Lon":-65.2074,"Magnitude":3.2,"Depth":46.00,"NST":15,"Region":"Puerto Rico region"},
                        {"Src":"hv","Eqid":60681031,"Version":3,"Datetime":"Wednesday, April 30, 2014 21:26:48 UTC","Lat":19.1850,"Lon":-155.6980,"Magnitude":1.6,"Depth":7.30,"NST":43,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"uw","Eqid":60051608,"Version":2,"Datetime":"Wednesday, April 30, 2014 21:15:20 UTC","Lat":49.3708,"Lon":-120.4910,"Magnitude":1.7,"Depth":0.00,"NST": 9,"Region":"British Columbia, Canada"},
                        {"Src":"uw","Eqid":60749532,"Version":2,"Datetime":"Wednesday, April 30, 2014 21:14:44 UTC","Lat":49.4087,"Lon":-120.5048,"Magnitude":2.4,"Depth":0.00,"NST":12,"Region":"British Columbia, Canada"},
                        {"Src":"nc","Eqid":72213046,"Version":0,"Datetime":"Wednesday, April 30, 2014 19:48:13 UTC","Lat":37.3248,"Lon":-122.1240,"Magnitude":1.7,"Depth":6.40,"NST":11,"Region":"San Francisco Bay area, California"},
                        {"Src":"nc","Eqid":72212991,"Version":0,"Datetime":"Wednesday, April 30, 2014 18:49:48 UTC","Lat":38.7592,"Lon":-122.7162,"Magnitude":1.3,"Depth":2.00,"NST":15,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60680966,"Version":1,"Datetime":"Wednesday, April 30, 2014 18:24:47 UTC","Lat":19.3978,"Lon":-155.2743,"Magnitude":1.9,"Depth":5.10,"NST":18,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"uw","Eqid":60749302,"Version":2,"Datetime":"Wednesday, April 30, 2014 18:01:26 UTC","Lat":46.5057,"Lon":-117.7863,"Magnitude":2.1,"Depth":0.00,"NST":13,"Region":"Washington"},
                        {"Src":"nc","Eqid":72212961,"Version":0,"Datetime":"Wednesday, April 30, 2014 17:58:26 UTC","Lat":39.9200,"Lon":-123.5022,"Magnitude":1.7,"Depth":4.50,"NST": 9,"Region":"Northern California"},
                        {"Src":"uw","Eqid":60749257,"Version":2,"Datetime":"Wednesday, April 30, 2014 17:27:41 UTC","Lat":43.3167,"Lon":-123.2590,"Magnitude":1.2,"Depth":0.00,"NST": 8,"Region":"Oregon"},
                        {"Src":"nc","Eqid":72212936,"Version":0,"Datetime":"Wednesday, April 30, 2014 17:25:28 UTC","Lat":37.3232,"Lon":-122.1077,"Magnitude":1.7,"Depth":0.00,"NST":16,"Region":"San Francisco Bay area, California"},
                        {"Src":"nc","Eqid":72212926,"Version":0,"Datetime":"Wednesday, April 30, 2014 17:17:08 UTC","Lat":36.7153,"Lon":-121.3608,"Magnitude":1.3,"Depth":3.70,"NST":11,"Region":"Central California"},
                        {"Src":"nc","Eqid":72212921,"Version":0,"Datetime":"Wednesday, April 30, 2014 17:17:02 UTC","Lat":37.6472,"Lon":-118.9528,"Magnitude":1.3,"Depth":7.50,"NST":17,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72212916,"Version":0,"Datetime":"Wednesday, April 30, 2014 17:06:20 UTC","Lat":38.7860,"Lon":-122.7482,"Magnitude":1.0,"Depth":1.10,"NST":15,"Region":"Northern California"},
                        {"Src":"uu","Eqid":60066632,"Version":4,"Datetime":"Wednesday, April 30, 2014 16:58:31 UTC","Lat":37.4330,"Lon":-113.1393,"Magnitude":2.1,"Depth":8.70,"NST":21,"Region":"Utah"},
                        {"Src":"nc","Eqid":72212901,"Version":1,"Datetime":"Wednesday, April 30, 2014 16:50:24 UTC","Lat":38.8423,"Lon":-122.8250,"Magnitude":1.7,"Depth":2.70,"NST":35,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72212866,"Version":1,"Datetime":"Wednesday, April 30, 2014 16:22:08 UTC","Lat":38.8422,"Lon":-122.8242,"Magnitude":1.4,"Depth":2.60,"NST":26,"Region":"Northern California"},
                        {"Src":"pr","Eqid":14120003,"Version":0,"Datetime":"Wednesday, April 30, 2014 15:01:15 UTC","Lat":18.8675,"Lon":-64.3095,"Magnitude":2.4,"Depth":23.00,"NST": 5,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72212736,"Version":0,"Datetime":"Wednesday, April 30, 2014 13:58:19 UTC","Lat":38.8263,"Lon":-122.8268,"Magnitude":1.0,"Depth":2.70,"NST":17,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60680861,"Version":1,"Datetime":"Wednesday, April 30, 2014 13:30:45 UTC","Lat":19.4130,"Lon":-155.2547,"Magnitude":1.7,"Depth":5.00,"NST":24,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72212686,"Version":2,"Datetime":"Wednesday, April 30, 2014 12:53:05 UTC","Lat":37.6435,"Lon":-118.9513,"Magnitude":1.1,"Depth":6.90,"NST":25,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72212666,"Version":0,"Datetime":"Wednesday, April 30, 2014 12:37:45 UTC","Lat":37.6485,"Lon":-118.9520,"Magnitude":1.0,"Depth":7.60,"NST":15,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72212661,"Version":3,"Datetime":"Wednesday, April 30, 2014 12:34:03 UTC","Lat":37.6413,"Lon":-118.9538,"Magnitude":1.9,"Depth":7.80,"NST":38,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72212641,"Version":0,"Datetime":"Wednesday, April 30, 2014 12:06:21 UTC","Lat":36.1908,"Lon":-120.4050,"Magnitude":1.7,"Depth":9.60,"NST": 4,"Region":"Central California"},
                        {"Src":"nc","Eqid":72212571,"Version":1,"Datetime":"Wednesday, April 30, 2014 11:44:38 UTC","Lat":38.8122,"Lon":-122.8187,"Magnitude":1.3,"Depth":3.00,"NST":25,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72212526,"Version":3,"Datetime":"Wednesday, April 30, 2014 11:24:00 UTC","Lat":36.3998,"Lon":-121.9160,"Magnitude":1.7,"Depth":12.30,"NST":23,"Region":"offshore Central California"},
                        {"Src":"uu","Eqid":60066627,"Version":3,"Datetime":"Wednesday, April 30, 2014 10:43:17 UTC","Lat":37.4368,"Lon":-113.1342,"Magnitude":1.2,"Depth":7.60,"NST":10,"Region":"Utah"},
                        {"Src":"pr","Eqid":14120002,"Version":0,"Datetime":"Wednesday, April 30, 2014 10:39:09 UTC","Lat":19.1566,"Lon":-64.3056,"Magnitude":2.9,"Depth":29.00,"NST": 4,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72212471,"Version":0,"Datetime":"Wednesday, April 30, 2014 10:17:39 UTC","Lat":37.6507,"Lon":-118.9442,"Magnitude":1.4,"Depth":6.00,"NST":13,"Region":"Long Valley area, California"},
                        {"Src":"pr","Eqid":14120001,"Version":0,"Datetime":"Wednesday, April 30, 2014 10:17:35 UTC","Lat":18.9734,"Lon":-64.9964,"Magnitude":3.1,"Depth":12.00,"NST": 7,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72212461,"Version":3,"Datetime":"Wednesday, April 30, 2014 10:07:49 UTC","Lat":36.3982,"Lon":-120.9668,"Magnitude":1.7,"Depth":1.10,"NST":55,"Region":"Central California"},
                        {"Src":"nc","Eqid":72212451,"Version":0,"Datetime":"Wednesday, April 30, 2014 09:54:31 UTC","Lat":39.6278,"Lon":-122.9567,"Magnitude":1.1,"Depth":5.00,"NST": 6,"Region":"Northern California"},
                        {"Src":"pr","Eqid":14120000,"Version":0,"Datetime":"Wednesday, April 30, 2014 08:11:42 UTC","Lat":19.2196,"Lon":-64.6526,"Magnitude":3.0,"Depth":51.00,"NST": 4,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72212376,"Version":2,"Datetime":"Wednesday, April 30, 2014 08:11:26 UTC","Lat":37.6397,"Lon":-118.9467,"Magnitude":1.4,"Depth":7.60,"NST":26,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72212351,"Version":0,"Datetime":"Wednesday, April 30, 2014 07:47:21 UTC","Lat":38.8222,"Lon":-122.8082,"Magnitude":1.6,"Depth":3.30,"NST": 9,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72212321,"Version":0,"Datetime":"Wednesday, April 30, 2014 07:19:14 UTC","Lat":36.2805,"Lon":-120.3330,"Magnitude":1.8,"Depth":18.30,"NST": 4,"Region":"Central California"},
                        {"Src":"nc","Eqid":72212281,"Version":1,"Datetime":"Wednesday, April 30, 2014 06:49:44 UTC","Lat":38.8433,"Lon":-122.8408,"Magnitude":1.7,"Depth":2.70,"NST":32,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60680766,"Version":5,"Datetime":"Wednesday, April 30, 2014 06:44:45 UTC","Lat":19.4042,"Lon":-155.5002,"Magnitude":1.7,"Depth":10.90,"NST":68,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72212251,"Version":0,"Datetime":"Wednesday, April 30, 2014 05:13:27 UTC","Lat":36.5947,"Lon":-121.0940,"Magnitude":1.3,"Depth":5.90,"NST":10,"Region":"Central California"},
                        {"Src":"nc","Eqid":72212246,"Version":0,"Datetime":"Wednesday, April 30, 2014 05:12:20 UTC","Lat":38.7230,"Lon":-122.7368,"Magnitude":1.2,"Depth":14.70,"NST": 8,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72212216,"Version":0,"Datetime":"Wednesday, April 30, 2014 02:57:51 UTC","Lat":37.3798,"Lon":-122.1912,"Magnitude":1.3,"Depth":4.50,"NST": 8,"Region":"San Francisco Bay area, California"},
                        {"Src":"nc","Eqid":72212206,"Version":3,"Datetime":"Wednesday, April 30, 2014 02:46:10 UTC","Lat":37.9773,"Lon":-122.0507,"Magnitude":2.1,"Depth":16.50,"NST":75,"Region":"San Francisco Bay area, California"},
                        {"Src":"nc","Eqid":72212191,"Version":3,"Datetime":"Wednesday, April 30, 2014 01:58:25 UTC","Lat":38.8182,"Lon":-122.7960,"Magnitude":1.9,"Depth":3.30,"NST":57,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72212151,"Version":0,"Datetime":"Wednesday, April 30, 2014 00:13:27 UTC","Lat":37.6472,"Lon":-118.9507,"Magnitude":1.2,"Depth":7.90,"NST":18,"Region":"Long Valley area, California"},
                        {"Src":"hv","Eqid":60680481,"Version":3,"Datetime":"Tuesday, April 29, 2014 23:58:09 UTC","Lat":19.3612,"Lon":-155.8110,"Magnitude":1.7,"Depth":13.80,"NST":40,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"hv","Eqid":60680471,"Version":5,"Datetime":"Tuesday, April 29, 2014 23:06:55 UTC","Lat":19.8218,"Lon":-155.3713,"Magnitude":2.5,"Depth":26.20,"NST":77,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72212141,"Version":0,"Datetime":"Tuesday, April 29, 2014 22:52:13 UTC","Lat":37.2773,"Lon":-121.6575,"Magnitude":1.1,"Depth":0.30,"NST": 7,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72212136,"Version":0,"Datetime":"Tuesday, April 29, 2014 22:38:55 UTC","Lat":37.6433,"Lon":-118.9518,"Magnitude":1.4,"Depth":7.00,"NST":20,"Region":"Long Valley area, California"},
                        {"Src":"pr","Eqid":14119003,"Version":0,"Datetime":"Tuesday, April 29, 2014 22:23:50 UTC","Lat":17.9144,"Lon":-66.8780,"Magnitude":2.3,"Depth":15.00,"NST":11,"Region":"Puerto Rico region"},
                        {"Src":"nc","Eqid":72212126,"Version":8,"Datetime":"Tuesday, April 29, 2014 22:04:42 UTC","Lat":40.3030,"Lon":-124.4665,"Magnitude":2.6,"Depth":8.50,"NST":24,"Region":"offshore Northern California"},
                        {"Src":"nc","Eqid":72212121,"Version":4,"Datetime":"Tuesday, April 29, 2014 22:04:17 UTC","Lat":38.4495,"Lon":-122.6465,"Magnitude":1.6,"Depth":11.80,"NST":47,"Region":"Northern California"},
                        {"Src":"uu","Eqid":60066602,"Version":2,"Datetime":"Tuesday, April 29, 2014 21:45:06 UTC","Lat":40.9367,"Lon":-111.6237,"Magnitude":1.0,"Depth":9.10,"NST": 6,"Region":"Utah"},
                        {"Src":"nc","Eqid":72214416,"Version":2,"Datetime":"Tuesday, April 29, 2014 21:39:27 UTC","Lat":41.5655,"Lon":-121.6233,"Magnitude":1.4,"Depth":1.90,"NST": 7,"Region":"Medicine Lake area, California"},
                        {"Src":"uw","Eqid":60747762,"Version":1,"Datetime":"Tuesday, April 29, 2014 21:07:30 UTC","Lat":49.4182,"Lon":-120.5225,"Magnitude":2.3,"Depth":0.00,"NST":11,"Region":"British Columbia, Canada"},
                        {"Src":"uw","Eqid":60747712,"Version":1,"Datetime":"Tuesday, April 29, 2014 20:36:47 UTC","Lat":44.2443,"Lon":-123.2670,"Magnitude":1.3,"Depth":0.00,"NST":15,"Region":"Oregon"},
                        {"Src":"nc","Eqid":72212086,"Version":0,"Datetime":"Tuesday, April 29, 2014 20:29:13 UTC","Lat":36.2228,"Lon":-120.7872,"Magnitude":1.0,"Depth":7.70,"NST": 6,"Region":"Central California"},
                        {"Src":"nc","Eqid":72212021,"Version":0,"Datetime":"Tuesday, April 29, 2014 18:39:56 UTC","Lat":35.7765,"Lon":-120.3305,"Magnitude":1.1,"Depth":8.10,"NST":16,"Region":"Central California"},
                        {"Src":"hv","Eqid":60680336,"Version":5,"Datetime":"Tuesday, April 29, 2014 17:31:27 UTC","Lat":19.2615,"Lon":-155.4593,"Magnitude":2.5,"Depth":8.90,"NST":77,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72211961,"Version":0,"Datetime":"Tuesday, April 29, 2014 17:09:02 UTC","Lat":38.7695,"Lon":-122.5652,"Magnitude":1.8,"Depth":4.50,"NST": 6,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72211946,"Version":0,"Datetime":"Tuesday, April 29, 2014 16:59:21 UTC","Lat":38.8442,"Lon":-122.8240,"Magnitude":1.2,"Depth":2.10,"NST": 9,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72211836,"Version":2,"Datetime":"Tuesday, April 29, 2014 14:52:57 UTC","Lat":38.9135,"Lon":-122.4922,"Magnitude":2.2,"Depth":7.20,"NST":61,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72211826,"Version":2,"Datetime":"Tuesday, April 29, 2014 14:44:42 UTC","Lat":41.0783,"Lon":-121.9327,"Magnitude":2.3,"Depth":16.00,"NST":33,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72211806,"Version":2,"Datetime":"Tuesday, April 29, 2014 14:03:55 UTC","Lat":40.3503,"Lon":-121.9323,"Magnitude":1.4,"Depth":6.60,"NST":10,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72214021,"Version":2,"Datetime":"Tuesday, April 29, 2014 11:56:40 UTC","Lat":41.7392,"Lon":-121.5172,"Magnitude":1.3,"Depth":0.80,"NST": 8,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72211731,"Version":0,"Datetime":"Tuesday, April 29, 2014 09:59:11 UTC","Lat":37.6435,"Lon":-118.9455,"Magnitude":1.2,"Depth":7.70,"NST":13,"Region":"Long Valley area, California"},
                        {"Src":"pr","Eqid":14119002,"Version":0,"Datetime":"Tuesday, April 29, 2014 09:56:02 UTC","Lat":18.7961,"Lon":-64.5804,"Magnitude":2.4,"Depth":36.00,"NST": 3,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72211721,"Version":0,"Datetime":"Tuesday, April 29, 2014 09:54:03 UTC","Lat":37.3777,"Lon":-122.1960,"Magnitude":1.5,"Depth":4.90,"NST": 6,"Region":"San Francisco Bay area, California"},
                        {"Src":"nc","Eqid":72211661,"Version":0,"Datetime":"Tuesday, April 29, 2014 08:19:04 UTC","Lat":38.8237,"Lon":-122.7852,"Magnitude":1.3,"Depth":2.30,"NST":12,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72211656,"Version":0,"Datetime":"Tuesday, April 29, 2014 08:14:20 UTC","Lat":37.7733,"Lon":-121.9463,"Magnitude":1.5,"Depth":10.00,"NST":17,"Region":"San Francisco Bay area, California"},
                        {"Src":"nc","Eqid":72211651,"Version":0,"Datetime":"Tuesday, April 29, 2014 08:08:43 UTC","Lat":36.6060,"Lon":-121.0947,"Magnitude":1.2,"Depth":8.00,"NST":10,"Region":"Central California"},
                        {"Src":"hv","Eqid":60680156,"Version":5,"Datetime":"Tuesday, April 29, 2014 07:45:06 UTC","Lat":19.3457,"Lon":-155.0850,"Magnitude":2.5,"Depth":7.90,"NST":43,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"pr","Eqid":14119001,"Version":0,"Datetime":"Tuesday, April 29, 2014 07:34:29 UTC","Lat":18.5153,"Lon":-66.1875,"Magnitude":3.3,"Depth":94.00,"NST":25,"Region":"Puerto Rico region"},
                        {"Src":"nc","Eqid":72211591,"Version":0,"Datetime":"Tuesday, April 29, 2014 05:36:26 UTC","Lat":38.8085,"Lon":-122.8230,"Magnitude":1.0,"Depth":2.50,"NST":14,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72211491,"Version":0,"Datetime":"Tuesday, April 29, 2014 02:59:41 UTC","Lat":37.6403,"Lon":-118.9445,"Magnitude":1.3,"Depth":7.50,"NST": 7,"Region":"Long Valley area, California"},
                        {"Src":"pr","Eqid":14119000,"Version":0,"Datetime":"Tuesday, April 29, 2014 02:58:45 UTC","Lat":19.0699,"Lon":-66.8916,"Magnitude":2.8,"Depth":8.00,"NST": 6,"Region":"Puerto Rico region"},
                        {"Src":"nc","Eqid":72211486,"Version":1,"Datetime":"Tuesday, April 29, 2014 02:53:30 UTC","Lat":37.6388,"Lon":-118.9462,"Magnitude":1.6,"Depth":7.40,"NST":24,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72211481,"Version":0,"Datetime":"Tuesday, April 29, 2014 02:30:34 UTC","Lat":37.6435,"Lon":-118.9513,"Magnitude":1.5,"Depth":7.40,"NST":18,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72211471,"Version":0,"Datetime":"Tuesday, April 29, 2014 02:06:08 UTC","Lat":38.8280,"Lon":-122.8313,"Magnitude":1.1,"Depth":2.70,"NST":15,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72211436,"Version":0,"Datetime":"Tuesday, April 29, 2014 01:28:17 UTC","Lat":37.6400,"Lon":-118.9442,"Magnitude":1.1,"Depth":7.20,"NST": 7,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72211431,"Version":1,"Datetime":"Tuesday, April 29, 2014 01:15:36 UTC","Lat":38.8405,"Lon":-122.8268,"Magnitude":1.2,"Depth":2.80,"NST":25,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60679951,"Version":3,"Datetime":"Tuesday, April 29, 2014 00:16:16 UTC","Lat":19.5097,"Lon":-155.7023,"Magnitude":1.1,"Depth":10.80,"NST":11,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"hv","Eqid":60679941,"Version":3,"Datetime":"Monday, April 28, 2014 23:55:00 UTC","Lat":19.4935,"Lon":-155.6938,"Magnitude":1.2,"Depth":8.30,"NST":26,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"hv","Eqid":60679931,"Version":6,"Datetime":"Monday, April 28, 2014 23:38:30 UTC","Lat":19.4997,"Lon":-155.7018,"Magnitude":1.5,"Depth":10.10,"NST":38,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72211371,"Version":0,"Datetime":"Monday, April 28, 2014 23:24:52 UTC","Lat":37.6450,"Lon":-118.9473,"Magnitude":1.0,"Depth":7.90,"NST":14,"Region":"Long Valley area, California"},
                        {"Src":"uu","Eqid":60066507,"Version":4,"Datetime":"Monday, April 28, 2014 23:24:19 UTC","Lat":44.6992,"Lon":-111.0395,"Magnitude":1.6,"Depth":7.20,"NST":17,"Region":"Yellowstone National Park, Wyoming"},
                        {"Src":"nc","Eqid":72211366,"Version":1,"Datetime":"Monday, April 28, 2014 23:20:58 UTC","Lat":38.8390,"Lon":-122.8302,"Magnitude":1.1,"Depth":2.60,"NST":27,"Region":"Northern California"},
                        {"Src":"uw","Eqid":60746772,"Version":2,"Datetime":"Monday, April 28, 2014 23:08:43 UTC","Lat":46.1867,"Lon":-123.0435,"Magnitude":1.9,"Depth":0.00,"NST":13,"Region":"Washington"},
                        {"Src":"nc","Eqid":72211361,"Version":2,"Datetime":"Monday, April 28, 2014 22:58:49 UTC","Lat":37.6420,"Lon":-118.9453,"Magnitude":1.0,"Depth":7.40,"NST":18,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72211356,"Version":3,"Datetime":"Monday, April 28, 2014 22:51:30 UTC","Lat":36.6978,"Lon":-121.3323,"Magnitude":2.0,"Depth":4.40,"NST":53,"Region":"Central California"},
                        {"Src":"pr","Eqid":14118006,"Version":0,"Datetime":"Monday, April 28, 2014 22:39:49 UTC","Lat":18.8901,"Lon":-64.4414,"Magnitude":3.3,"Depth":5.00,"NST":10,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72211341,"Version":0,"Datetime":"Monday, April 28, 2014 22:34:28 UTC","Lat":37.6423,"Lon":-118.9488,"Magnitude":1.6,"Depth":7.60,"NST":18,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72211321,"Version":3,"Datetime":"Monday, April 28, 2014 21:53:24 UTC","Lat":38.0930,"Lon":-122.2528,"Magnitude":2.2,"Depth":8.00,"NST":95,"Region":"San Francisco Bay area, California"},
                        {"Src":"nc","Eqid":72211316,"Version":0,"Datetime":"Monday, April 28, 2014 21:42:02 UTC","Lat":38.7473,"Lon":-122.7015,"Magnitude":1.5,"Depth":2.40,"NST":18,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72211286,"Version":2,"Datetime":"Monday, April 28, 2014 21:10:19 UTC","Lat":40.2465,"Lon":-121.2123,"Magnitude":1.0,"Depth":3.70,"NST": 5,"Region":"Northern California"},
                        {"Src":"uw","Eqid":60746687,"Version":2,"Datetime":"Monday, April 28, 2014 21:09:35 UTC","Lat":49.3787,"Lon":-120.5067,"Magnitude":2.1,"Depth":0.00,"NST": 7,"Region":"British Columbia, Canada"},
                        {"Src":"nc","Eqid":72211271,"Version":0,"Datetime":"Monday, April 28, 2014 20:51:39 UTC","Lat":37.6397,"Lon":-118.9455,"Magnitude":1.3,"Depth":7.40,"NST":16,"Region":"Long Valley area, California"},
                        {"Src":"uw","Eqid":60746637,"Version":2,"Datetime":"Monday, April 28, 2014 20:27:27 UTC","Lat":45.0838,"Lon":-122.5908,"Magnitude":1.6,"Depth":0.00,"NST":16,"Region":"Oregon"},
                        {"Src":"nc","Eqid":72211226,"Version":2,"Datetime":"Monday, April 28, 2014 20:05:51 UTC","Lat":38.8305,"Lon":-123.3178,"Magnitude":1.7,"Depth":0.20,"NST":22,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60679831,"Version":2,"Datetime":"Monday, April 28, 2014 19:58:24 UTC","Lat":19.9022,"Lon":-155.6830,"Magnitude":1.9,"Depth":32.70,"NST":22,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72211151,"Version":2,"Datetime":"Monday, April 28, 2014 18:33:49 UTC","Lat":40.2958,"Lon":-124.5093,"Magnitude":2.0,"Depth":18.10,"NST":21,"Region":"offshore Northern California"},
                        {"Src":"nc","Eqid":72211141,"Version":0,"Datetime":"Monday, April 28, 2014 18:28:40 UTC","Lat":37.6415,"Lon":-118.9497,"Magnitude":1.6,"Depth":7.50,"NST":20,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72211131,"Version":0,"Datetime":"Monday, April 28, 2014 18:17:13 UTC","Lat":37.6390,"Lon":-118.9508,"Magnitude":1.7,"Depth":7.40,"NST":20,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72211126,"Version":3,"Datetime":"Monday, April 28, 2014 18:14:10 UTC","Lat":38.9157,"Lon":-122.5002,"Magnitude":2.3,"Depth":6.60,"NST":68,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72211121,"Version":1,"Datetime":"Monday, April 28, 2014 18:11:59 UTC","Lat":38.8233,"Lon":-122.8442,"Magnitude":1.5,"Depth":2.50,"NST":24,"Region":"Northern California"},
                        {"Src":"uw","Eqid":60746487,"Version":2,"Datetime":"Monday, April 28, 2014 18:10:12 UTC","Lat":47.6702,"Lon":-120.1233,"Magnitude":1.8,"Depth":2.20,"NST":14,"Region":"Washington"},
                        {"Src":"nc","Eqid":72211096,"Version":3,"Datetime":"Monday, April 28, 2014 17:44:58 UTC","Lat":37.6370,"Lon":-118.9513,"Magnitude":1.9,"Depth":7.70,"NST":40,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72211091,"Version":0,"Datetime":"Monday, April 28, 2014 17:43:20 UTC","Lat":37.6407,"Lon":-118.9460,"Magnitude":1.5,"Depth":7.50,"NST":13,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72211086,"Version":0,"Datetime":"Monday, April 28, 2014 17:22:21 UTC","Lat":36.5562,"Lon":-121.1552,"Magnitude":1.4,"Depth":7.20,"NST":13,"Region":"Central California"},
                        {"Src":"pr","Eqid":14118005,"Version":0,"Datetime":"Monday, April 28, 2014 17:18:29 UTC","Lat":18.9452,"Lon":-64.2618,"Magnitude":3.0,"Depth":46.00,"NST": 3,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72207590,"Version":4,"Datetime":"Monday, April 28, 2014 16:55:15 UTC","Lat":39.6003,"Lon":-120.7057,"Magnitude":1.7,"Depth":8.60,"NST":16,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207565,"Version":1,"Datetime":"Monday, April 28, 2014 16:07:18 UTC","Lat":38.8225,"Lon":-122.8112,"Magnitude":1.3,"Depth":3.30,"NST":33,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207550,"Version":1,"Datetime":"Monday, April 28, 2014 15:53:44 UTC","Lat":38.8138,"Lon":-122.8253,"Magnitude":1.3,"Depth":2.80,"NST":29,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207535,"Version":0,"Datetime":"Monday, April 28, 2014 15:36:24 UTC","Lat":36.5558,"Lon":-121.1555,"Magnitude":1.4,"Depth":7.30,"NST":10,"Region":"Central California"},
                        {"Src":"nc","Eqid":72207510,"Version":0,"Datetime":"Monday, April 28, 2014 15:12:35 UTC","Lat":37.6443,"Lon":-118.9515,"Magnitude":1.4,"Depth":7.40,"NST":20,"Region":"Long Valley area, California"},
                        {"Src":"pr","Eqid":14118004,"Version":0,"Datetime":"Monday, April 28, 2014 14:48:12 UTC","Lat":17.8610,"Lon":-66.9554,"Magnitude":2.0,"Depth":10.00,"NST": 5,"Region":"Puerto Rico region"},
                        {"Src":"nc","Eqid":72207475,"Version":1,"Datetime":"Monday, April 28, 2014 14:26:28 UTC","Lat":38.8220,"Lon":-122.8125,"Magnitude":1.0,"Depth":3.20,"NST":21,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207465,"Version":3,"Datetime":"Monday, April 28, 2014 14:24:33 UTC","Lat":38.8213,"Lon":-122.8140,"Magnitude":1.8,"Depth":3.50,"NST":48,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60679736,"Version":1,"Datetime":"Monday, April 28, 2014 14:24:29 UTC","Lat":19.4608,"Lon":-155.3587,"Magnitude":2.2,"Depth":6.40,"NST":11,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72207455,"Version":3,"Datetime":"Monday, April 28, 2014 14:18:30 UTC","Lat":38.8222,"Lon":-122.8125,"Magnitude":2.5,"Depth":3.40,"NST":78,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207420,"Version":3,"Datetime":"Monday, April 28, 2014 13:14:04 UTC","Lat":36.5730,"Lon":-121.0317,"Magnitude":2.3,"Depth":8.70,"NST":80,"Region":"Central California"},
                        {"Src":"nc","Eqid":72207400,"Version":1,"Datetime":"Monday, April 28, 2014 12:58:57 UTC","Lat":38.7957,"Lon":-122.8067,"Magnitude":1.4,"Depth":3.20,"NST":25,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207385,"Version":0,"Datetime":"Monday, April 28, 2014 12:33:50 UTC","Lat":37.6438,"Lon":-118.9498,"Magnitude":1.6,"Depth":7.50,"NST":19,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72207360,"Version":0,"Datetime":"Monday, April 28, 2014 11:08:20 UTC","Lat":37.6423,"Lon":-118.9505,"Magnitude":1.5,"Depth":7.30,"NST":17,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72207345,"Version":0,"Datetime":"Monday, April 28, 2014 10:37:20 UTC","Lat":38.7925,"Lon":-122.7382,"Magnitude":1.0,"Depth":2.40,"NST":19,"Region":"Northern California"},
                        {"Src":"uu","Eqid":60066442,"Version":4,"Datetime":"Monday, April 28, 2014 10:33:22 UTC","Lat":39.6660,"Lon":-111.2922,"Magnitude":1.6,"Depth":1.70,"NST":14,"Region":"Utah"},
                        {"Src":"pr","Eqid":14118002,"Version":0,"Datetime":"Monday, April 28, 2014 09:51:03 UTC","Lat":17.9668,"Lon":-67.0866,"Magnitude":1.1,"Depth":6.00,"NST": 3,"Region":"Puerto Rico region"},
                        {"Src":"nc","Eqid":72207305,"Version":0,"Datetime":"Monday, April 28, 2014 09:47:00 UTC","Lat":38.8382,"Lon":-122.8402,"Magnitude":1.0,"Depth":2.20,"NST":20,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207280,"Version":0,"Datetime":"Monday, April 28, 2014 08:53:46 UTC","Lat":38.8270,"Lon":-122.7892,"Magnitude":1.0,"Depth":0.90,"NST": 7,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207240,"Version":0,"Datetime":"Monday, April 28, 2014 07:39:01 UTC","Lat":37.6448,"Lon":-118.9502,"Magnitude":1.0,"Depth":7.80,"NST":16,"Region":"Long Valley area, California"},
                        {"Src":"pr","Eqid":14118003,"Version":0,"Datetime":"Monday, April 28, 2014 07:31:10 UTC","Lat":19.0625,"Lon":-64.4306,"Magnitude":2.6,"Depth":35.00,"NST": 5,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72207225,"Version":0,"Datetime":"Monday, April 28, 2014 07:24:40 UTC","Lat":38.7575,"Lon":-122.7182,"Magnitude":1.0,"Depth":2.50,"NST":12,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207215,"Version":1,"Datetime":"Monday, April 28, 2014 07:00:02 UTC","Lat":38.8167,"Lon":-122.7990,"Magnitude":1.1,"Depth":3.20,"NST":26,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207210,"Version":2,"Datetime":"Monday, April 28, 2014 06:50:06 UTC","Lat":40.2065,"Lon":-121.1702,"Magnitude":1.7,"Depth":21.30,"NST": 8,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207185,"Version":1,"Datetime":"Monday, April 28, 2014 06:18:53 UTC","Lat":38.8172,"Lon":-122.8062,"Magnitude":1.4,"Depth":1.90,"NST":27,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207155,"Version":1,"Datetime":"Monday, April 28, 2014 05:35:34 UTC","Lat":38.7970,"Lon":-122.8058,"Magnitude":1.6,"Depth":3.20,"NST":38,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207150,"Version":0,"Datetime":"Monday, April 28, 2014 05:28:12 UTC","Lat":38.7968,"Lon":-122.8055,"Magnitude":1.1,"Depth":3.30,"NST":22,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60679481,"Version":3,"Datetime":"Monday, April 28, 2014 05:08:30 UTC","Lat":19.3867,"Lon":-155.2343,"Magnitude":1.5,"Depth":29.30,"NST":72,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72207140,"Version":2,"Datetime":"Monday, April 28, 2014 05:05:59 UTC","Lat":40.2120,"Lon":-121.2122,"Magnitude":1.0,"Depth":8.70,"NST": 7,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72207115,"Version":2,"Datetime":"Monday, April 28, 2014 04:15:56 UTC","Lat":40.6742,"Lon":-122.4360,"Magnitude":2.3,"Depth":25.90,"NST":28,"Region":"Northern California"},
                        {"Src":"pr","Eqid":14118001,"Version":0,"Datetime":"Monday, April 28, 2014 04:13:43 UTC","Lat":18.5895,"Lon":-65.6760,"Magnitude":2.3,"Depth":84.00,"NST":11,"Region":"Puerto Rico region"},
                        {"Src":"nc","Eqid":72207105,"Version":1,"Datetime":"Monday, April 28, 2014 04:13:31 UTC","Lat":38.8267,"Lon":-122.7927,"Magnitude":1.0,"Depth":2.00,"NST":20,"Region":"Northern California"},
                        {"Src":"uu","Eqid":60066422,"Version":2,"Datetime":"Monday, April 28, 2014 04:10:10 UTC","Lat":44.8122,"Lon":-110.9793,"Magnitude":1.0,"Depth":8.70,"NST":15,"Region":"Yellowstone National Park, Wyoming"},
                        {"Src":"pr","Eqid":14118000,"Version":0,"Datetime":"Monday, April 28, 2014 02:43:39 UTC","Lat":19.1380,"Lon":-67.6321,"Magnitude":2.8,"Depth":15.00,"NST": 7,"Region":"Puerto Rico region"},
                        {"Src":"uu","Eqid":60066407,"Version":3,"Datetime":"Monday, April 28, 2014 00:20:35 UTC","Lat":37.3518,"Lon":-112.6902,"Magnitude":1.3,"Depth":6.00,"NST": 7,"Region":"Utah"},
                        {"Src":"hv","Eqid":60679341,"Version":2,"Datetime":"Sunday, April 27, 2014 23:22:03 UTC","Lat":19.4123,"Lon":-155.2633,"Magnitude":1.7,"Depth":4.10,"NST":23,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72206950,"Version":0,"Datetime":"Sunday, April 27, 2014 22:50:45 UTC","Lat":37.4680,"Lon":-118.8418,"Magnitude":1.6,"Depth":8.20,"NST":18,"Region":"Central California"},
                        {"Src":"hv","Eqid":60679316,"Version":2,"Datetime":"Sunday, April 27, 2014 22:45:36 UTC","Lat":19.3680,"Lon":-155.0892,"Magnitude":2.3,"Depth":1.60,"NST":20,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"pr","Eqid":14117007,"Version":0,"Datetime":"Sunday, April 27, 2014 22:32:26 UTC","Lat":18.2315,"Lon":-64.4115,"Magnitude":3.1,"Depth":132.00,"NST":12,"Region":"Virgin Islands region"},
                        {"Src":"pr","Eqid":14117006,"Version":0,"Datetime":"Sunday, April 27, 2014 22:21:18 UTC","Lat":17.9230,"Lon":-67.1140,"Magnitude":1.7,"Depth":10.00,"NST": 3,"Region":"Puerto Rico region"},
                        {"Src":"nc","Eqid":72206895,"Version":0,"Datetime":"Sunday, April 27, 2014 21:38:39 UTC","Lat":37.6443,"Lon":-118.9428,"Magnitude":1.1,"Depth":7.80,"NST":10,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206885,"Version":0,"Datetime":"Sunday, April 27, 2014 21:33:29 UTC","Lat":37.6347,"Lon":-118.9498,"Magnitude":1.0,"Depth":4.90,"NST": 9,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206875,"Version":0,"Datetime":"Sunday, April 27, 2014 21:32:41 UTC","Lat":37.6395,"Lon":-118.9452,"Magnitude":1.7,"Depth":7.40,"NST":18,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206860,"Version":4,"Datetime":"Sunday, April 27, 2014 21:28:15 UTC","Lat":37.6395,"Lon":-118.9490,"Magnitude":1.7,"Depth":7.20,"NST":31,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206840,"Version":0,"Datetime":"Sunday, April 27, 2014 21:19:04 UTC","Lat":37.6413,"Lon":-118.9462,"Magnitude":1.3,"Depth":7.50,"NST":16,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206835,"Version":0,"Datetime":"Sunday, April 27, 2014 21:18:50 UTC","Lat":37.6412,"Lon":-118.9448,"Magnitude":1.4,"Depth":7.50,"NST":14,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206830,"Version":0,"Datetime":"Sunday, April 27, 2014 21:06:31 UTC","Lat":37.6433,"Lon":-118.9483,"Magnitude":1.5,"Depth":8.20,"NST":17,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206810,"Version":2,"Datetime":"Sunday, April 27, 2014 20:58:39 UTC","Lat":37.6435,"Lon":-118.9527,"Magnitude":1.8,"Depth":7.10,"NST":35,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206805,"Version":0,"Datetime":"Sunday, April 27, 2014 20:56:25 UTC","Lat":37.6305,"Lon":-118.9593,"Magnitude":1.5,"Depth":1.50,"NST":10,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206800,"Version":0,"Datetime":"Sunday, April 27, 2014 20:46:56 UTC","Lat":37.6373,"Lon":-118.9557,"Magnitude":1.3,"Depth":5.50,"NST":12,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206790,"Version":5,"Datetime":"Sunday, April 27, 2014 20:42:33 UTC","Lat":38.8188,"Lon":-122.8110,"Magnitude":1.8,"Depth":3.50,"NST":56,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72206785,"Version":0,"Datetime":"Sunday, April 27, 2014 20:35:31 UTC","Lat":37.6382,"Lon":-118.9487,"Magnitude":1.3,"Depth":6.80,"NST": 8,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206770,"Version":0,"Datetime":"Sunday, April 27, 2014 20:30:02 UTC","Lat":37.6430,"Lon":-118.9533,"Magnitude":1.7,"Depth":7.00,"NST":18,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206765,"Version":3,"Datetime":"Sunday, April 27, 2014 20:28:42 UTC","Lat":37.6433,"Lon":-118.9523,"Magnitude":2.6,"Depth":7.40,"NST":38,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206760,"Version":0,"Datetime":"Sunday, April 27, 2014 20:27:04 UTC","Lat":37.6418,"Lon":-118.9512,"Magnitude":1.7,"Depth":6.90,"NST":17,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206725,"Version":2,"Datetime":"Sunday, April 27, 2014 19:36:20 UTC","Lat":37.5165,"Lon":-119.3517,"Magnitude":1.0,"Depth":3.00,"NST": 6,"Region":"Central California"},
                        {"Src":"nc","Eqid":72206695,"Version":0,"Datetime":"Sunday, April 27, 2014 18:54:28 UTC","Lat":38.8027,"Lon":-122.7760,"Magnitude":1.0,"Depth":1.50,"NST":19,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72206685,"Version":0,"Datetime":"Sunday, April 27, 2014 18:46:57 UTC","Lat":37.7173,"Lon":-122.5383,"Magnitude":1.3,"Depth":7.90,"NST":11,"Region":"offshore Northern California"},
                        {"Src":"nc","Eqid":72206670,"Version":0,"Datetime":"Sunday, April 27, 2014 18:19:34 UTC","Lat":37.6413,"Lon":-118.9488,"Magnitude":1.2,"Depth":7.20,"NST":11,"Region":"Long Valley area, California"},
                        {"Src":"uw","Eqid":60745747,"Version":2,"Datetime":"Sunday, April 27, 2014 17:32:08 UTC","Lat":49.3672,"Lon":-120.5202,"Magnitude":1.7,"Depth":0.00,"NST": 6,"Region":"British Columbia, Canada"},
                        {"Src":"nc","Eqid":72206635,"Version":0,"Datetime":"Sunday, April 27, 2014 17:15:10 UTC","Lat":37.6402,"Lon":-118.9478,"Magnitude":1.0,"Depth":7.60,"NST": 9,"Region":"Long Valley area, California"},
                        {"Src":"hv","Eqid":60679176,"Version":2,"Datetime":"Sunday, April 27, 2014 16:29:01 UTC","Lat":19.4390,"Lon":-155.2820,"Magnitude":2.0,"Depth":2.40,"NST":28,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"hv","Eqid":60679156,"Version":2,"Datetime":"Sunday, April 27, 2014 16:16:05 UTC","Lat":19.4292,"Lon":-155.2690,"Magnitude":2.2,"Depth":2.80,"NST":16,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72206605,"Version":0,"Datetime":"Sunday, April 27, 2014 16:15:59 UTC","Lat":37.5042,"Lon":-118.4182,"Magnitude":1.1,"Depth":9.70,"NST": 8,"Region":"Central California"},
                        {"Src":"nc","Eqid":72206570,"Version":0,"Datetime":"Sunday, April 27, 2014 14:57:13 UTC","Lat":37.6443,"Lon":-118.9475,"Magnitude":1.2,"Depth":7.80,"NST":18,"Region":"Long Valley area, California"},
                        {"Src":"uw","Eqid":60745677,"Version":2,"Datetime":"Sunday, April 27, 2014 14:44:16 UTC","Lat":42.0902,"Lon":-123.7060,"Magnitude":2.6,"Depth":36.30,"NST":17,"Region":"Oregon"},
                        {"Src":"nc","Eqid":72206560,"Version":2,"Datetime":"Sunday, April 27, 2014 14:20:18 UTC","Lat":40.3025,"Lon":-121.2532,"Magnitude":1.2,"Depth":8.30,"NST": 6,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72206545,"Version":0,"Datetime":"Sunday, April 27, 2014 14:06:49 UTC","Lat":37.6410,"Lon":-118.9477,"Magnitude":1.2,"Depth":7.40,"NST":14,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206535,"Version":0,"Datetime":"Sunday, April 27, 2014 13:30:21 UTC","Lat":36.2390,"Lon":-120.7972,"Magnitude":1.2,"Depth":6.80,"NST": 8,"Region":"Central California"},
                        {"Src":"nc","Eqid":72206530,"Version":1,"Datetime":"Sunday, April 27, 2014 13:20:26 UTC","Lat":38.8053,"Lon":-122.8188,"Magnitude":1.2,"Depth":3.20,"NST":23,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72206500,"Version":2,"Datetime":"Sunday, April 27, 2014 12:33:55 UTC","Lat":40.2875,"Lon":-124.0885,"Magnitude":2.3,"Depth":30.80,"NST":22,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72206495,"Version":1,"Datetime":"Sunday, April 27, 2014 12:32:13 UTC","Lat":37.6395,"Lon":-118.9477,"Magnitude":1.6,"Depth":7.50,"NST":24,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206490,"Version":2,"Datetime":"Sunday, April 27, 2014 12:29:39 UTC","Lat":37.6417,"Lon":-118.9493,"Magnitude":1.8,"Depth":7.20,"NST":35,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206485,"Version":0,"Datetime":"Sunday, April 27, 2014 12:28:13 UTC","Lat":37.6398,"Lon":-118.9470,"Magnitude":1.1,"Depth":7.10,"NST":12,"Region":"Long Valley area, California"},
                        {"Src":"nc","Eqid":72206470,"Version":1,"Datetime":"Sunday, April 27, 2014 11:42:52 UTC","Lat":38.8113,"Lon":-122.8305,"Magnitude":1.4,"Depth":3.00,"NST":24,"Region":"Northern California"},
                        {"Src":"hv","Eqid":60679056,"Version":2,"Datetime":"Sunday, April 27, 2014 11:09:58 UTC","Lat":19.4263,"Lon":-155.2748,"Magnitude":1.8,"Depth":2.70,"NST":17,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"uw","Eqid":60745647,"Version":2,"Datetime":"Sunday, April 27, 2014 10:51:59 UTC","Lat":47.9100,"Lon":-122.5893,"Magnitude":1.0,"Depth":12.20,"NST":18,"Region":"Puget Sound region, Washington"},
                        {"Src":"pr","Eqid":14117005,"Version":0,"Datetime":"Sunday, April 27, 2014 10:44:53 UTC","Lat":19.0587,"Lon":-64.3227,"Magnitude":2.8,"Depth":38.00,"NST": 5,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72206440,"Version":0,"Datetime":"Sunday, April 27, 2014 09:56:45 UTC","Lat":36.5817,"Lon":-121.1215,"Magnitude":1.1,"Depth":8.50,"NST": 9,"Region":"Central California"},
                        {"Src":"nc","Eqid":72206435,"Version":2,"Datetime":"Sunday, April 27, 2014 09:36:22 UTC","Lat":37.4952,"Lon":-119.3625,"Magnitude":1.0,"Depth":6.70,"NST":11,"Region":"Central California"},
                        {"Src":"nc","Eqid":72206415,"Version":3,"Datetime":"Sunday, April 27, 2014 09:28:19 UTC","Lat":35.5592,"Lon":-120.8047,"Magnitude":2.0,"Depth":4.90,"NST":77,"Region":"Central California"},
                        {"Src":"pr","Eqid":14117004,"Version":0,"Datetime":"Sunday, April 27, 2014 09:25:57 UTC","Lat":19.0354,"Lon":-64.3170,"Magnitude":2.9,"Depth":55.00,"NST": 5,"Region":"Virgin Islands region"},
                        {"Src":"nc","Eqid":72206410,"Version":0,"Datetime":"Sunday, April 27, 2014 09:22:07 UTC","Lat":38.8220,"Lon":-122.7637,"Magnitude":1.1,"Depth":2.40,"NST":21,"Region":"Northern California"},
                        {"Src":"pr","Eqid":14117003,"Version":0,"Datetime":"Sunday, April 27, 2014 09:02:59 UTC","Lat":18.4598,"Lon":-66.2096,"Magnitude":2.6,"Depth":85.00,"NST":10,"Region":"Puerto Rico"},
                        {"Src":"nc","Eqid":72206390,"Version":1,"Datetime":"Sunday, April 27, 2014 07:32:34 UTC","Lat":38.8262,"Lon":-122.8028,"Magnitude":1.3,"Depth":2.50,"NST":24,"Region":"Northern California"},
                        {"Src":"pr","Eqid":14117002,"Version":0,"Datetime":"Sunday, April 27, 2014 07:16:38 UTC","Lat":18.9701,"Lon":-64.4544,"Magnitude":2.7,"Depth":47.00,"NST": 4,"Region":"Virgin Islands region"},
                        {"Src":"hv","Eqid":60678966,"Version":1,"Datetime":"Sunday, April 27, 2014 06:50:50 UTC","Lat":19.3835,"Lon":-155.2617,"Magnitude":1.8,"Depth":10.00,"NST":40,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"nc","Eqid":72206375,"Version":0,"Datetime":"Sunday, April 27, 2014 06:41:56 UTC","Lat":35.5523,"Lon":-120.7810,"Magnitude":1.5,"Depth":5.10,"NST": 8,"Region":"Central California"},
                        {"Src":"pr","Eqid":14117001,"Version":0,"Datetime":"Sunday, April 27, 2014 06:36:41 UTC","Lat":19.5186,"Lon":-68.3015,"Magnitude":3.4,"Depth":81.00,"NST": 9,"Region":"Dominican Republic region"},
                        {"Src":"hv","Eqid":60678956,"Version":1,"Datetime":"Sunday, April 27, 2014 06:19:51 UTC","Lat":19.4055,"Lon":-155.3005,"Magnitude":1.8,"Depth":5.10,"NST":26,"Region":"Island of Hawaii, Hawaii"},
                        {"Src":"pr","Eqid":14117000,"Version":0,"Datetime":"Sunday, April 27, 2014 05:22:25 UTC","Lat":18.5734,"Lon":-65.6670,"Magnitude":2.6,"Depth":81.00,"NST": 9,"Region":"Puerto Rico region"},
                        {"Src":"nc","Eqid":72206335,"Version":0,"Datetime":"Sunday, April 27, 2014 04:23:54 UTC","Lat":38.8220,"Lon":-122.8427,"Magnitude":1.1,"Depth":2.50,"NST":21,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72206320,"Version":2,"Datetime":"Sunday, April 27, 2014 03:53:34 UTC","Lat":40.3690,"Lon":-122.0927,"Magnitude":1.7,"Depth":12.50,"NST":23,"Region":"Northern California"},
                        {"Src":"nc","Eqid":72206315,"Version":1,"Datetime":"Sunday, April 27, 2014 03:43:43 UTC","Lat":38.8142,"Lon":-122.8207,"Magnitude":1.4,"Depth":3.40,"NST":29,"Region":"Northern California"}];
                                         
                            db.collection('earthquakes', function(err, collection) {
        collection.insert(earthquakes, {safe:true}, function(err, result) {});
    });
 
};