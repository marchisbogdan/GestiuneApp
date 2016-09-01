// Make sure we got a filename on the command line.
var MongoClient = require('mongodb').MongoClient,
  assert = require('assert');
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}
var set = [];
// Read the file and print its contents.
var fs = require('fs'),
  filename = process.argv[2];
fs.readFile(filename, 'utf8', function(err, data) {
  if (err) throw err;
  console.log('OK: ' + filename);
  //console.log(data);
  var line = data.split('\n');
  console.log("1st line:" + line[0]);
  console.log("2st line:" + line[1]);
  var linesLength = line.length;
  console.log("lines length:" + linesLength);
  var doc = {};
  for (var i = 0; i < linesLength; i++) {
    //console.log(i);
    //var e = line[i].split(",");
    var l = line[i].replace(/\r/g, "");
    doc = {
      "_id": i + 1,
      "text": l
    };
    set.push(doc);
  }
  var url = 'mongodb://localhost:27017/gest';
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected to server gest!");
    insertDocuments(db, function() {
      db.close();
    });
  });
  var insertDocuments = function(db, callback) {
      var collection = db.collection('gests');

      collection.insertMany(set, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted " + set.length + " documents into gest collection");
        callback(result);
      });

    }
    //console.log(set);
    //console.log(set.length);

});

// var lineReader = require('readline').createInterface({
//   input: require('fs').createReadStream(process.argv[2])
// });
//
// lineReader.on('line', function(line) {
//   console.log('Line from file:', line);
// });
