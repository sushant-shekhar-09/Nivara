"""
Seed script to ensure all demo accounts (demo-univ and test.com) exist with correct passwords.
"""

import asyncio
from sqlalchemy import select
from nivara.backend.database import AsyncSessionLocal
from nivara.backend.models import User, Tenant, TenantMembership
from nivara.privacy.auth import hash_password

ACCOUNTS = [
    {
        "email": "counsellor@demo-univ.ac.in",
        "password": "DemoCounsellor2026!",
        "role": "counsellor",
        "tenant_slug": "demo-univ"
    },
    {
        "email": "admin@demo-univ.ac.in",
        "password": "DemoAdmin2026!",
        "role": "institution_admin",
        "tenant_slug": "demo-univ"
    },
    {
        "email": "counsellor@test.com",
        "password": "DemoCounsellor2026!",
        "role": "counsellor",
        "tenant_slug": "demo-univ"
    },
    {
        "email": "admin@test.com",
        "password": "DemoAdmin2026!",
        "role": "platform_admin",
        "tenant_slug": "demo-univ"
    }
]

async def seed_accounts():
    async with AsyncSessionLocal() as session:
        # Get demo-univ tenant if it exists
        stmt_t = select(Tenant).where(Tenant.slug == "demo-univ")
        tenant = (await session.execute(stmt_t)).scalars().first()

        for acc in ACCOUNTS:
            stmt = select(User).where(User.email == acc["email"])
            user = (await session.execute(stmt)).scalars().first()
            if not user:
                print(f"Creating user {acc['email']} ({acc['role']})...")
                user = User(
                    email=acc["email"],
                    hashed_password=hash_password(acc["password"]),
                    role=acc["role"],
                    is_active=True
                )
                session.add(user)
                await session.flush()
            else:
                print(f"Updating password & role for {acc['email']}...")
                user.hashed_password = hash_password(acc["password"])
                user.role = acc["role"]
                user.is_active = True

            # Ensure tenant membership if tenant exists
            if tenant:
                stmt_m = select(TenantMembership).where(
                    TenantMembership.user_id == user.id,
                    TenantMembership.tenant_id == tenant.id
                )
                membership = (await session.execute(stmt_m)).scalars().first()
                if not membership:
                    print(f"Linking {acc['email']} to tenant {tenant.slug}...")
                    session.add(TenantMembership(
                        tenant_id=tenant.id,
                        user_id=user.id,
                        role=acc["role"]
                    ))

        await session.commit()
        print("All demo accounts successfully seeded and verified!")

if __name__ == "__main__":
    asyncio.run(seed_accounts())

