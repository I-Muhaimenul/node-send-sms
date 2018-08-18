
const express = require('express')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const path = require('path')
const Nexmo = require('nexmo')
const socketio = require('socket.io')

//Init Nexmo
const nexmo = new Nexmo({
    apiKey: 'API_KEY',
    apiSecret: 'API_SECRET'
}, {debug: true})

const app = express()

//view engine setup
app.set('views', path.join(__dirname, 'views'))
// app.engine('handlebars', exphbs({defaultLayout: 'main'}))
// app.set('view engine', 'handlebars')
// main layout 
app.engine('hbs', exphbs({extname: 'hbs', defaultLayout: 'main'}))
app.set('view engine', 'hbs')

//static public folder
// app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(express.static(__dirname + '/public'))


// body parser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))


app.get('/', (req, res) => {
    res.render('index', {
        title: "Node SMS"
    })
})

app.post('/', (req, res) => {
    // res.send(req.body)
    // console.log(req.body)
    const number = req.body.number
    const text = req.body.text

    nexmo.message.sendSms(
        'VARTUAL_NUMBER', number, text, { type: 'unicode'},
        (err, responseData) => {
            if(err){
                console.log(err)
            } else{
                console.dir(responseData)
                //get data from response
                const data = {
                    id: responseData.messages[0]['message-id'],
                    number: responseData.messages[0]['to']
                }

                // emit to the client main.js
                io.emit('smsStatus', data)
            }
        }
    )
})

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log('Server started at port '+port)
})

// Connext to socket.io
const io = socketio(server)
io.on('connection', (socket) => {
    console.log('Socket connected')
    io.on('disconnect', () => {
        console.log('Disconnected')
    })
})