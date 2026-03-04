const fs = require('fs');
const db = JSON.parse(fs.readFileSync('/opt/filesystem-sas/backend/database.json', 'utf8'));
db.users = db.users.map(u => {
    if (u.username === 'g.azevedo') u.role = 'admin';
    return u;
});
fs.writeFileSync('/opt/filesystem-sas/backend/database.json', JSON.stringify(db, null, 2));
console.log('User g.azevedo promoted to admin');
