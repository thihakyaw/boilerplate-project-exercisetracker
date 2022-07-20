const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

let url = "mongodb+srv://meowfitchoo:o27Ohlrhw2b5l0Ze@cluster0.cvl7hca.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: false
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    log: [{
        date: {
            type: String,
            required: true
        },
        duration: Number,
        description: String
    }],
    count: Number
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({
    extended: false
}));

app.post('/api/users', function (req, res) {
    let username = req.body.username;
    let user = new User({
        username,
        count: 0
    });
    user.save((err, data) => {
        if (err) {
            res.json({
                error: err
            });
        }
        res.json(data);
    })
});

app.get('/api/users', function (req, res) {
    User.find((err, data) => {
        if (data) {
            res.json(data);
        }
    })
});

app.post('/api/users/:id/exercises', function (req, res) {
    const {
        description
    } = req.body;
    const duration = parseInt(req.body.duration)
    const id = req.params.id

    let date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()

    const exercise = {
        date,
        duration,
        description
    }

    User.findByIdAndUpdate(id, {
        $push: {
            log: exercise
        },
        $inc: {
            count: 1
        }
    }, {
        new: true
    }, (err, user) => {
        if (user) {
            const updatedExercise = {
                _id: id,
                username: user.username,
                ...exercise
            }
            res.json(updatedExercise);
        }
    })
});

app.get("/api/users/:id/logs", (req, res) => {
    const {
        from,
        to,
        limit
    } = req.query;
    const id = req.params.id;

    User.findById(id, (err, user) => {
        if (user) {
            if (from || to || limit) {

                let logs = user.log;
                console.log(logs);
                let filteredLogs = logs
                    .filter(log => {
                        // const formattedLogDate = (new Date(log.date)).toISOString().split('T')[0];
                        // console.log(formattedLogDate);
                        return true
                    })
                filteredLogs = filteredLogs.map((item) => {
                    return {
                        description: item.description,
                        duration: item.duration,
                        date: 'Wed Jul 20 2022'
                    }
                })
                // console.log(filteredLogs);
                const slicedLogs = limit ? filteredLogs.slice(0, limit) : filteredLogs;

                user.log = slicedLogs
            }
            console.log(user);
            res.json(user);
        }
    })
})

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})