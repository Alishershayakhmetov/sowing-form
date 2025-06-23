import { Db, MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI as string
const dbName = process.env.MONGODB_NAME as string
const options = {}

let client
let clientPromise: Promise<MongoClient>
let mongoDBClient: Db

declare global {
  // чтобы избежать повторных подключений в dev режиме
  var _mongoClientPromise: Promise<MongoClient>
}

if (!process.env.MONGODB_URI) {
  throw new Error('Добавь MONGODB_URI в .env.local')
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
  mongoDBClient = (await clientPromise).db(dbName)
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
  mongoDBClient = (await clientPromise).db(dbName)
}

export default mongoDBClient