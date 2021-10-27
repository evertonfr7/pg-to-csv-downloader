const TABLE_NAME = '';

const Client = require('pg').Client;
const fastcsv = require('fast-csv');
const dotenv = require('dotenv');

dotenv.config();

const connection = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    database: process.env.DB_NAME || 'database',
    password: process.env.DB_PASSWORD || 'root',
    port: process.env.DB_PORT || 5432
}

function downloadTables(tables) {

    tables.map(table => {
        const client = new Client(connection);
        client.connect((err, client, done) => {

            if (err) throw err;
            client.query(`SELECT * FROM ${table}`, (err, res) => {

                if (res) {
                    const jsonData = JSON.parse(JSON.stringify(res));

                    fastcsv.writeToPath(`${table}.csv`, jsonData.rows, {
                        headers: true
                    });
                }
                console.log(`${table} table exported to csv`);
                client.end();
            });
        });
    });
}

if (TABLE_NAME) {
    downloadTables([TABLE_NAME]);

} else {
    const client = new Client(connection);
    client.connect((err, client, done) => {

        if (err) throw err;

        client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`, (err, res) => {
            res.rows.map(row => {
                downloadTables([row.table_name]);
            });

            client.end();
        });

    });
}