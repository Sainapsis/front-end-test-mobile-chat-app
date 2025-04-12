/** @type {import('drizzle-kit').Config} */
module.exports = {
    schema: './database/schema',
    out: './database/migrations',
    dialect: 'sqlite',
    driver: 'expo',
    dbName: 'chat-app.db',
    verbose: true,
}; 