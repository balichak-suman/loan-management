const { executeSQL } = require('../database');

async function migrate() {
  console.log('Starting simplified migration (CASCADING)...');
  
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function generateUserId() {
    let result = 'NC';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  try {
    const { rows: numericUsers } = await executeSQL("SELECT id FROM users WHERE id::TEXT ~ '^[0-9]+$'");
    console.log(`Found ${numericUsers.length} users with numeric IDs.`);
    
    for (const user of numericUsers) {
      const oldId = user.id;
      const newId = generateUserId();
      console.log(`Migrating ${oldId} to ${newId}...`);
      
      // Since we added ON UPDATE CASCADE, we ONLY need to update the users table!
      await executeSQL('UPDATE users SET id = ? WHERE id = ?', [newId, oldId]);
      
      console.log(`Successfully migrated ${oldId} to ${newId} (and all related records cascaded)`);
    }
    
    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
