const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function cleanupUnusedTables() {
    try {
        console.log('🧹 Starting cleanup of unused tables...');
        console.log('=====================================');

        // List of unused tables that can be safely removed
        const unusedTables = [
            'escalation_rules',
            'email_notifications'
        ];

        for (const tableName of unusedTables) {
            try {
                // Check if table exists
                const existsResult = await pool.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = $1
                    )
                `, [tableName]);

                if (existsResult.rows[0].exists) {
                    // Check if table has any data
                    const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
                    const rowCount = parseInt(countResult.rows[0].count);

                    if (rowCount > 0) {
                        console.log(`⚠️  Table '${tableName}' has ${rowCount} rows. Skipping deletion for safety.`);
                        console.log(`   If you want to delete it anyway, run: DROP TABLE ${tableName} CASCADE;`);
                    } else {
                        // Drop the table
                        await pool.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
                        console.log(`✅ Dropped unused table: ${tableName}`);
                    }
                } else {
                    console.log(`ℹ️  Table '${tableName}' does not exist. Skipping.`);
                }
            } catch (err) {
                console.error(`❌ Error processing table '${tableName}':`, err.message);
            }
        }

        console.log('\n🎉 Cleanup completed!');
        console.log('\n📊 Remaining tables:');
        
        // Show remaining tables
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name NOT LIKE '%keycloak%'
            AND table_name NOT LIKE '%admin%'
            AND table_name NOT LIKE '%auth%'
            AND table_name NOT LIKE '%client%'
            AND table_name NOT LIKE '%component%'
            AND table_name NOT LIKE '%credential%'
            AND table_name NOT LIKE '%database%'
            AND table_name NOT LIKE '%default%'
            AND table_name NOT LIKE '%email%'
            AND table_name NOT LIKE '%event%'
            AND table_name NOT LIKE '%fed%'
            AND table_name NOT LIKE '%group%'
            AND table_name NOT LIKE '%identity%'
            AND table_name NOT LIKE '%idp%'
            AND table_name NOT LIKE '%migration%'
            AND table_name NOT LIKE '%offline%'
            AND table_name NOT LIKE '%org%'
            AND table_name NOT LIKE '%policy%'
            AND table_name NOT LIKE '%protocol%'
            AND table_name NOT LIKE '%realm%'
            AND table_name NOT LIKE '%redirect%'
            AND table_name NOT LIKE '%required%'
            AND table_name NOT LIKE '%resource%'
            AND table_name NOT LIKE '%revoked%'
            AND table_name NOT LIKE '%role%'
            AND table_name NOT LIKE '%scope%'
            AND table_name NOT LIKE '%sla%'
            AND table_name NOT LIKE '%user%'
            AND table_name NOT LIKE '%web%'
            ORDER BY table_name
        `);

        result.rows.forEach((table, index) => {
            console.log(`${index + 1}. ${table.table_name}`);
        });

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    } finally {
        await pool.end();
    }
}

cleanupUnusedTables();
