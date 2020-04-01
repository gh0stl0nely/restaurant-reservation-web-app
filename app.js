const express = require('express')
const app = express()
const path = require('path')
const middleware = require('./middleware.js')// -> Maybe put them inside another folder would be better

app.set('view engine', 'ejs')
app.set('port', process.env.PORT || 3000)
app.use(express.json()) // => This will parse incoming input with Content-type: application/json
app.use(express.static('public'))

// GET REQUEST (HOME PAGE)
app.get('/', middleware.readData, (req, res) => {
    // Read the data.json file
    // See the length in data.table and data.waitlist
    let localVar = res.locals
    const tables = localVar.data.tables.length
    const waitlist = localVar.data.waitlist.length

    let data = {
        tables,
        waitlist
    }

    res.render('home.ejs', data)
})

// GET REQUEST (Waitlist PAGE)
app.get('/reservations', middleware.readDataWaitlist, (req, res) => {
    // res.sendFile(path.join(__dirname, "/public", "/reservations.html"));
    let waitlist = res.locals.waitlistDateTemplate
    res.send(waitlist)
})

// GET REQUEST (Tables Page)
app.get('/tables', middleware.readDataTables, (req, res) => {
    let tables = res.locals.tableDateTemplate
    res.send(tables)
})

// GET REQUEST (Make reservation page)
app.get('/make-reservation', (req, res) => {
    res.sendFile(path.join(__dirname, "/public", "/make-reservation.html"));
})

// POST REQUEST 
app.post('/api/make-reservation', middleware.processIncomingData, (req, res) => {
    let waitlist = res.locals.waitlistArrayLength

    if (waitlist == 0) {
        res.json({
            'status': 200,
            'message': 'Your reservation is successfully made!'
        })
    } else {
        res.json({
            'status': 200,
            'message': 'Sorry! We are currently full. You are added to the waitlist'
        })
    }
})

// DELETE REQUEST

app.delete('/deleteTable', middleware.updateDatabase, (req, res) => {
    res.json({
        'status': 200,
        'message': 'Deletion Successful'
    })
})

// Listening to Port 3000

app.listen(app.get('port'))