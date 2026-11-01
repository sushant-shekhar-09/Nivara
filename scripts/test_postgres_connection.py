import asyncio
import asyncpg

async def test_conn():
    conn = await asyncpg.connect(
        user="postgres",
        host="localhost",
        port=5432,
        database="nivara"
    )
    version = await conn.fetchval("SELECT version();")
    print("PostgreSQL 16 Connection Success!")
    print(f"Version: {version}")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(test_conn())
