import * as SQLite from 'expo-sqlite';



// Create a table if it doesn't exist
const init = async () => {
    const db = await SQLite.openDatabaseAsync('Mydatabase');

        await db.execAsync(
            `CREATE TABLE IF NOT EXISTS locations11 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mobileNumber TEXT,
          url Text
        );`);
        console.log("Table created");
    };
// Insert data into the table
const insertLocation = async (mobileNumber, url) => {
    const db = await SQLite.openDatabaseAsync('Mydatabase');

        await db.runAsync('INSERT INTO locations (mobileNumber, url) VALUES (?, ?)',
        [mobileNumber, url], 
      );
      console.log('Data inserted:');
      const allRows = await db.getAllAsync('SELECT * FROM locations');
for (const row of allRows) {
  console.log(row.mobileNumber, row.url);
}
};

export { init, insertLocation };
