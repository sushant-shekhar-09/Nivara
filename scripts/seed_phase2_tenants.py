"""
Database Seed Script for Phase 2 Multi-Tenant Institutional Workspaces.
Provisions:
1. Reference Tenant: 'demo-univ' (National Institute of Technology & Sciences).
2. Custom Institutional Branding (forest sage & terracotta).
3. Institution Admin account: admin@demo-univ.ac.in / DemoAdmin2026!
4. Counsellor account: counsellor@demo-univ.ac.in / DemoCounsellor2026!
5. Published Screening Campaign: 'Fall 2026 Student Wellbeing Campaign'.
6. Verified Campus Support Resources.
7. Initial voluntary counselling requests for triage demonstration.
8. Cohort screening sessions (N=8) to demonstrate unsuppressed (k >= 5) aggregate analytics.
"""

import asyncio
import uuid
from datetime import datetime, timedelta

from nivara.backend.database import AsyncSessionLocal, engine, Base
from nivara.backend.models import (
    Tenant, TenantBranding, TenantMembership, User, InstitutionalResource,
    ScreeningCampaign, CounsellingRequest, StudentProfile, ScreeningSession
)
from nivara.privacy.auth import hash_password

async def seed_phase2_data():
    print("Connecting to database and verifying schema...")
    from sqlalchemy import text
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Ensure new columns exist on pre-existing screening_sessions table
        try:
            await conn.execute(text("ALTER TABLE screening_sessions ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);"))
            await conn.execute(text("ALTER TABLE screening_sessions ADD COLUMN IF NOT EXISTS campaign_id VARCHAR(36) REFERENCES screening_campaigns(id);"))
        except Exception as e:
            print(f"Schema alter note: {e}")

    async with AsyncSessionLocal() as session:
        # Check if demo-univ already exists
        from sqlalchemy import select
        stmt = select(Tenant).where(Tenant.slug == "demo-univ")
        res = await session.execute(stmt)
        existing_tenant = res.scalars().first()

        if existing_tenant:
            print("Reference tenant 'demo-univ' already seeded.")
            return

        print("Seeding reference tenant 'demo-univ'...")
        tenant = Tenant(
            slug="demo-univ",
            name="National Institute of Technology & Sciences",
            domain="demo-univ.ac.in",
            description="Leading premier technical university fostering student academic success and mental wellbeing.",
            is_active=True
        )
        session.add(tenant)
        await session.flush()

        # Branding
        branding = TenantBranding(
            tenant_id=tenant.id,
            logo_url=None,
            primary_color="#2d4436",
            accent_color="#c25e3e",
            portal_title="Campus Wellbeing Sanctuary",
            support_email="wellbeing@demo-univ.ac.in",
            support_phone="+91 11 2659 1000",
            custom_welcome_text="Welcome to the NITS Student Wellbeing Sanctuary. All screenings are strictly confidential."
        )
        session.add(branding)

        # Admin user
        admin_user = User(
            email="admin@demo-univ.ac.in",
            hashed_password=hash_password("DemoAdmin2026!"),
            role="institution_admin"
        )
        session.add(admin_user)

        # Counsellor user
        counsellor_user = User(
            email="counsellor@demo-univ.ac.in",
            hashed_password=hash_password("DemoCounsellor2026!"),
            role="counsellor"
        )
        session.add(counsellor_user)
        await session.flush()

        # Memberships
        session.add(TenantMembership(
            tenant_id=tenant.id,
            user_id=admin_user.id,
            role="institution_admin"
        ))
        session.add(TenantMembership(
            tenant_id=tenant.id,
            user_id=counsellor_user.id,
            role="counsellor"
        ))

        # Campus Resources
        session.add(InstitutionalResource(
            tenant_id=tenant.id,
            title="NITS Student Counseling & Wellness Cell",
            category="counselling",
            summary="Free one-on-one psychological counseling, stress reduction workshops, and peer support.",
            contact_info="wellbeing-clinic@demo-univ.ac.in | Student Activity Center, Room 204",
            is_emergency=False,
            is_active=True
        ))
        session.add(InstitutionalResource(
            tenant_id=tenant.id,
            title="Campus Health Center & 24/7 Medical Emergency",
            category="crisis",
            summary="Immediate campus emergency response, physician consultations, and medical support.",
            contact_info="Internal Ext: 2222 / +91 11 2659 2222 (24/7)",
            is_emergency=True,
            is_active=True
        ))

        # Campaign
        now = datetime.utcnow()
        campaign = ScreeningCampaign(
            tenant_id=tenant.id,
            title="Fall 2026 Student Wellbeing Campaign",
            description="Campus-wide mental health check-in to assess semester stress and emotional wellbeing.",
            start_date=now - timedelta(days=14),
            end_date=now + timedelta(days=45),
            supported_instruments=["phq9", "gad7", "pss10"],
            target_audience="All Enrolled Undergraduates & Postgraduates",
            is_published=True
        )
        session.add(campaign)
        await session.flush()

        # Voluntary Counselling Requests (Triage cases)
        req1 = CounsellingRequest(
            tenant_id=tenant.id,
            student_name="Aarav Sharma",
            student_email="aarav.s@demo-univ.ac.in",
            student_phone="+91 98765 43210",
            preferred_contact_method="email",
            urgency_level="standard",
            notes="Feeling persistent anxiety before upcoming mid-semester examinations. Would like to talk to a counsellor.",
            consent_to_contact=True,
            status="pending"
        )
        session.add(req1)

        req2 = CounsellingRequest(
            tenant_id=tenant.id,
            student_name="Priya Patel",
            student_email="priya.p@demo-univ.ac.in",
            student_phone="+91 98765 12345",
            preferred_contact_method="in_person",
            urgency_level="priority",
            notes="Experiencing sleep disruption and fatigue over the past few weeks.",
            consent_to_contact=True,
            status="assigned",
            assigned_counsellor_id=counsellor_user.id,
            counsellor_notes="Scheduled initial intake for Tuesday at 3:00 PM in SAC 204."
        )
        session.add(req2)

        # Seed 8 anonymous screening sessions for demo-univ to establish N >= 5 reportable cohort
        for i in range(8):
            student_u = User(
                email=f"cohort_student_{i}_{uuid.uuid4().hex[:6]}@demo-univ.ac.in",
                hashed_password=hash_password("CohortStudentPass2026!"),
                role="student"
            )
            session.add(student_u)
            await session.flush()

            profile = StudentProfile(
                user_id=student_u.id,
                age="18-22",
                gender="Female" if i % 2 == 0 else "Male",
                university=tenant.name,
                department="Engineering - CS / CSE / CSC / Similar to CS",
                academic_year="Second Year or Equivalent",
                current_cgpa="3.00 - 3.39",
                waiver_or_scholarship="No",
                consent_given=True
            )
            session.add(profile)
            await session.flush()

            is_elevated = (i % 3 == 0)
            session.add(ScreeningSession(
                id=str(uuid.uuid4()),
                student_id=profile.id,
                tenant_id=tenant.id,
                campaign_id=campaign.id,
                phq_responses=[1] * 9 if not is_elevated else [2] * 9,
                gad_responses=[1] * 7 if not is_elevated else [2] * 7,
                pss_responses=[2] * 10,
                pss_score=20,
                depression_prob=0.25 if not is_elevated else 0.72,
                depression_flag=is_elevated,
                depression_tier="Low Screening Risk" if not is_elevated else "Elevated Screening Risk",
                anxiety_prob=0.20 if not is_elevated else 0.68,
                anxiety_flag=is_elevated,
                anxiety_tier="Low Screening Risk" if not is_elevated else "Elevated Screening Risk",
                safety_flag=False,
                safety_rule_triggered=None,
                safety_message=None
            ))

        await session.commit()
        print("Successfully seeded Phase 2 multi-tenant reference workspace!")
        print("Tenant slug: 'demo-univ'")
        print("Admin user: admin@demo-univ.ac.in (Password: DemoAdmin2026!)")
        print("Counsellor user: counsellor@demo-univ.ac.in (Password: DemoCounsellor2026!)")

if __name__ == "__main__":
    asyncio.run(seed_phase2_data())
