const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

