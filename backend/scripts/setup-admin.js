const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'database.json');

async function setupAdmin() {
    const [, , username, password] = process.argv;

    if (!username || !password) {
        console.error('Usage: node setup-admin.js <username> <password>');
        process.exit(1);
    }

    try {
        let db = { folders: [], users: [] };
        if (fs.existsSync(DB_PATH)) {
            const content = fs.readFileSync(DB_PATH, 'utf-8');
            db = JSON.parse(content);
        }

        if (!db.users) db.users = [];

        // Check if user already exists
        if (db.users.find(u => u.username === username)) {
            console.log(`User ${username} already exists. Skipping creation.`);
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now(),
            username: username,
            passwordHash: passwordHash,
            role: 'admin',
            createdAt: new Date().toISOString()
        };

        db.users.push(newUser);
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        console.log(`Successfully created admin user: ${username}`);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

setupAdmin();
