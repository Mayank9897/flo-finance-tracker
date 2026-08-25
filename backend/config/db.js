const fs = require('fs')
const path = require('path')

const dataPath = path.join(__dirname, '..', '..', 'flo_data.json')
const emptyData = { users: [], transactions: [], budgets: [], nextUserId: 1, nextTxId: 1, nextBudgetId: 1 }

function readData() {
	try { return JSON.parse(fs.readFileSync(dataPath, 'utf8')) } catch { return { ...emptyData } }
}

function writeData(data) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); return data }

module.exports = { readData, writeData }
