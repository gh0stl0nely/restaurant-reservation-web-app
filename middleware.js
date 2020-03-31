const util = require('util');
const fs = require('fs')
const ejs = require('ejs')

//Promisified async functions
const readFilePromise = util.promisify(fs.readFile)
const writeFilePromise = util.promisify(fs.writeFile)

async function readData(req, res, next) {
    let d = await readFilePromise('./data.json')
    let parsedData = JSON.parse(d)
    res.locals.data = parsedData
    next()
}

async function readDataTables(req, res, next) {
    try {
        // Read data from data.json first
        // store it in an array, pass to next

        let d = await readFilePromise('./data.json')
        let parsedData = JSON.parse(d)
        let tables = parsedData.tables

        let template = await readFilePromise('./views/tables.ejs', 'utf-8') // Template from tables.ejs
        let dataFilledTemplate = ejs.render(template, {
            tables
        })
        
        // console.log(dataFilledTemplate)
        res.locals.tableDateTemplate = dataFilledTemplate
        next()
    } catch (e) {
        throw e
    }
}

async function readDataWaitlist(req, res, next) {
    try {
        
        let d = await readFilePromise('./data.json')
        let parsedData = JSON.parse(d)
        let waitlist = parsedData.waitlist

        let template = await readFilePromise('./views/reservations.ejs', 'utf-8') // Template from tables.ejs
        let dataFilledTemplate = ejs.render(template, {
            waitlist
        })

        res.locals.waitlistDateTemplate = dataFilledTemplate
        next()
    } catch (e) {
        throw e
    }
}

async function processIncomingData(req, res, next) {
    try {
        let newUserData = req.body
        let readData = await readFilePromise('./data.json')
        let parsedReadData = JSON.parse(readData)

        let tableArray = parsedReadData.tables
        let waitlistArray = parsedReadData.waitlist

        // If array is > 5, then add to wait list
        // If the current table is less than five, which mean you can add more
        // If more than or equal to five, which means all or full
        if (tableArray.length < 5) {
            tableArray.push(newUserData)
        } else {
            waitlistArray.push(newUserData)
        }

        // Store in a local variable to be passed to the final middleware
        res.locals.waitlistArrayLength = waitlistArray.length

        await writeFilePromise('./data.json', JSON.stringify(parsedReadData))
        next()
    } catch (e) {
        throw e
    }
}

async function updateDatabase(req, res, next) {
    try {
        const dataToBeDeleted = req.body
        // console.log(dataToBeDeleted)
        let dataBase = await readFilePromise('./data.json')
        let parsedDataBase = JSON.parse(dataBase)
        let tables = parsedDataBase.tables
        let waitlist = parsedDataBase.waitlist

        // Delete the tobeDeleted  (ASSUMING SEPERATE DATA)
        for (let i = 0; i < tables.length; i++) {
            if (tables[i].email == dataToBeDeleted.email) {
                tables.splice(i, 1)
            }
        }

        // take the first one from waitlist (splice) and add it to the back of tables :)

        if(waitlist.length > 0){
            let nextInLine = waitlist.splice(0,1)
            tables.push(nextInLine[0])
        }

        // // Waitlist has been updated
        // console.log(waitlist)

        const newData = {
            tables,
            waitlist
        }

        // Update the database
        await writeFilePromise('./data.json', JSON.stringify(newData))
        next()

    } catch (e) {
        throw e
    }
}

module.exports.readData = readData
module.exports.readDataTables = readDataTables
module.exports.readDataWaitlist = readDataWaitlist
module.exports.processIncomingData = processIncomingData
module.exports.updateDatabase = updateDatabase