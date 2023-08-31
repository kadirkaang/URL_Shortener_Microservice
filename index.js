require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url');
const bodyParser = require('body-parser');
const Url = require('./model');

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/shorturl', async (req, res) => {
    const url = req.body.url;
    const dnslookup = dns.lookup(urlparser.parse(url).hostname, 
    async (err, address) => {
        if (!address) {
            res.json({ error: 'Invalid URL'});
        } else {
            const parsedUrl = new URL(url);
            const existingUrl = await Url.findOne({ url: url });
            if (existingUrl) {
                res.json({
                    url: existingUrl.url,
                    short_url: existingUrl.short_url
                });
            } else {
                const urlCount = await Url.count();
                const urlDoc = new Url({
                    url: url,
                    short_url: urlCount
                });
                const result = await urlDoc.save();
                console.log(result);
                res.json({ original_url: url, short_url: urlCount });
            }
        }
    })
});

app.get('/api/shorturl/:short', (req, res) => {
    const short_url = req.params.short;

    Url.findOne({ short_url: short_url })
        .then((doc) => {
            console.log(doc)
            res.redirect(doc.url);
        })
        .catch((err) => {
            console.error(err);
        })
})

const listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
