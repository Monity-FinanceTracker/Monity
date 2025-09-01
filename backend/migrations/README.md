# Data Re-encryption Migration

This migration fixes decryption errors by re-encrypting existing data with the current encryption key.

## 🚨 IMPORTANT: Before Running

1. **Backup your database** (the migration can do this automatically)
2. **Test in development environment first**
3. **Ensure your current `ENCRYPTION_KEY` is correct**
4. **Have a rollback plan ready**

## Quick Start

### Step 1: Verify Your Setup (Recommended)
```bash
cd backend
node migrations/test-encryption.js      # Test encryption is working
node migrations/verify-schema.js        # Check your database schema
```

### Step 2: Preview Changes (Recommended)
```bash
node migrations/run-migration.js --dry-run
```
This shows what would be changed without making any modifications.

### Step 3: Run Migration with Backup (Recommended for Production)
```bash
node migrations/run-migration.js --backup
```
This creates a backup and then runs the migration.

### Step 4: Run Migration Only (If you have external backups)
```bash
node migrations/run-migration.js
```

## Individual Scripts

### Test Encryption Setup
```bash
node migrations/test-encryption.js
```
Tests that your encryption/decryption is working correctly

### Verify Database Schema
```bash
node migrations/verify-schema.js  
```
Checks your database schema and samples encrypted data

### Create Backup Only
```bash
node migrations/backup-database.js
```
Creates a timestamped backup in `migrations/backups/`

### Re-encrypt Data Only  
```bash
node migrations/re-encrypt-data.js
```
Runs the re-encryption without backup

### Dry Run Re-encryption
```bash
node migrations/re-encrypt-data.js --dry-run
```
Shows what would be changed without making changes

### Cleanup Old Encrypted Data
```bash
node migrations/cleanup-old-encrypted.js           # Identify problematic records
node migrations/cleanup-old-encrypted.js --dry-run # Preview deletions
node migrations/cleanup-old-encrypted.js --delete  # Actually delete them
```
Finds and optionally deletes records with old encryption that can't be decrypted

## What the Migration Does

1. **Scans encrypted fields** in these tables:
   - `transactions` (description field)
   - `categories` (name field) 
   - `savings_goals` (goal_name field)
   - `groups` (name field)

2. **For each encrypted field**:
   - Attempts to decrypt with current key
   - If successful, re-encrypts with current key
   - If failed, logs as error (data encrypted with old key)
   - Updates the database record

3. **Handles different scenarios**:
   - ✅ Plain text → Encrypts it
   - ✅ Correctly encrypted → Re-encrypts if needed
   - ❌ Old encrypted data → Logs error (may need manual handling)

## Expected Output

```
🚀 Starting data re-encryption migration...
Current encryption key length: 64

📋 Processing table: transactions
📊 Found 150 records in transactions
✅ Updated transactions ID: abc-123
✅ Updated transactions ID: def-456
⚠️  Failed to decrypt transactions.description for ID xyz-789: possibly old key

📊 MIGRATION SUMMARY
====================
Total records processed: 150
✅ Successfully updated: 145
⏭️  Skipped (no changes): 3
❌ Failed: 2
```

## Troubleshooting

### "Failed to decrypt" errors
- **Cause**: Data was encrypted with a different key
- **Solution**: 
  1. If you have the old key, temporarily set it and re-run
  2. Accept data loss for those records
  3. Manually update those records with new data

### "Could not find a relationship" warnings
- **Cause**: Database schema relationships not properly defined
- **Impact**: Non-blocking, core functionality still works
- **Solution**: Define foreign key relationships in Supabase

### Migration fails completely
- **Check**: Encryption key is 64-character hex string
- **Check**: Database connection is working
- **Check**: You have admin permissions
- **Restore**: Use the backup files created

## Backup Files

Backups are stored in `migrations/backups/` with timestamps:
- `backup-YYYY-MM-DDTHH-mm-ss.json` - Full data backup
- `summary-YYYY-MM-DDTHH-mm-ss.txt` - Human-readable summary

## Rollback Process

If something goes wrong:

1. **Stop the application**
2. **Restore from backup**:
   ```bash
   # You'll need to write a restore script or manually import
   # the JSON backup back to your Supabase database
   ```
3. **Verify data integrity**
4. **Restart application**

## Security Notes

- ✅ Backups contain encrypted data (safe to store)
- ✅ Migration logs don't expose decrypted values
- ⚠️ Ensure backup files are stored securely
- ⚠️ Don't share encryption keys in logs or files

## Testing

Test the migration in development:

1. Copy production data to development database
2. Run migration in development
3. Verify application works correctly
4. Check that decryption errors are gone
5. Only then run in production
