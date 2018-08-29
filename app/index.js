const express        = require('express');
const lighthouse     = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const bodyParser     = require('body-parser')
const app            = express();

// ExpressJS Configuration
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// GET /
app.get('/status', (req, res) => { 
  res.send({ running: true });
});

app.get('/', (req, res) => { 
  res.send('Hello World!');
});

// POST /report
app.post('/report', (req, res) => {
  const targetUrl = req.body.url || null;
  const opts = {
    chromeFlags: ['--show-paint-rects']
  };
  console.log(req.body);

  if (targetUrl !== null) {
    launchChromeAndRunLighthouse(targetUrl, opts).then(results => {
      res.send(results);
    });
  }
});

// Start Application
app.listen(3000, () => {
  console.log('Starting reporting server on port 3000...');
});


// Launch Chrome + Run Lighthouse
async function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then(results => {
      // use results.lhr for the JS-consumeable output
      // https://github.com/GoogleChrome/lighthouse/blob/master/typings/lhr.d.ts
      // use results.report for the HTML/JSON/CSV output as a string
      // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
      return chrome.kill().then(() => results.lhr);
    });
  });
}


