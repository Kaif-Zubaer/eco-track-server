const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('WELCOME TO ECO TRACK SERVER')
})

app.listen(port, () => {
    console.log(`EcoTrack server is running on port: ${port}`);
})