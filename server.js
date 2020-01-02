const express = require('express');
const app = express();
const fs = require('fs');
const formidable = require('formidable');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var ExifImage = require('exif').ExifImage;
var multer = require('multer');
var upload = multer({
    dest: 'upload/'
})

app.set('view engine', 'ejs');

app.post('/fileupload', (req,res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (files.filetoupload.size == 0) {
      res.status(500).end("No file uploaded!");  
    }
    let filename = files.filetoupload.path;
 console.log(filename);
    if (fields.title) {
      var title = (fields.title.length > 0) ? fields.title : "untitled";
      console.log(`title = ${title}`);
    }
    if (fields.description) {
      var description = (fields.description.length > 0) ? fields.description : "n/a";
      console.log(`description = ${description}`);
    }
    if (files.filetoupload.type) {
      var mimetype = files.filetoupload.type;
      console.log(`mimetype = ${mimetype}`);
    }

    if (!mimetype.match(/^image/)) {
      res.status(500).end("Upload file not image!");
      return;
    }
	value = {};
	try{
		new ExifImage({image: filename},function (error, exifData) {
			if (error)
                console.log('Error1: ' + error.message);
			  else {
				value['make'] = JSON.stringify(exifData.image.Make);
                value['modle'] = JSON.stringify(exifData.image.Model);
                value['time'] = JSON.stringify(exifData.exif.CreateDate);
if (exifData.gps.GPSLatitudeRef == 'S') {
  value['GPSLatitude'] = exifData.gps.GPSLatitude[0] + exifData.gps.GPSLatitude[1]/60 + exifData.gps.GPSLatitude[2]/60/60;
                    value['GPSLatitude'] = '-' + value['GPSLatitude'];
                } else
                    value['GPSLatitude'] = exifData.gps.GPSLatitude[0] + exifData.gps.GPSLatitude[1] / 60 + exifData.gps.GPSLatitude[2]/60/60;

                if (exifData.gps.GPSLongitudeRef == 'E') {
 value['GPSLongitude'] = exifData.gps.GPSLongitude[0] + exifData.gps.GPSLongitude[1] / 60 + exifData.gps.GPSLongitude[2]/60/60;
                } else{
 value['GPSLongitude'] = exifData.gps.GPSLongitude[0] + exifData.gps.GPSLongitude[1] / 60 + exifData.gps.GPSLongitude[2]/60/60;
                    value['GPSLongitude'] = '-' + value['GPSLongitude'];
}
				
				
    fs.readFile(filename, (err,data) => {
        value['base64'] = new Buffer.from(data).toString('base64');
        res.render('photo', {
        title: title,
        desc: description,
        image: 'data:image/jpg;base64,' + value['base64'],
        make: value['make'],
        model: value['modle'],
        time: value['time'],
        link: 'map/' + value['GPSLatitude'] + '/' + value['GPSLongitude'] + '/18'
        });
    });
			  }
			     });
	
	}catch(error){console.log('Error2: ' + error.message);}

  });
});
app.get('/map/:la/:ln/:z', function (req, res) {
    res.render('map.ejs', {
        la: req.params.la,
        ln: req.params.ln,
        z: req.params.z
    });
});


app.get('/*', function(req,res) {
  res.render('upload.ejs');
});



app.listen(process.env.PORT || 8099);
