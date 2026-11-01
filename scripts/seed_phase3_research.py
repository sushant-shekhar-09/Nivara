"""
Seed Phase 3 Research Survey & Ethics Data for 'demo-univ'.
"""

import sys
import os
import secrets
import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select, func

# Add workspace root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from nivara.backend.database import AsyncSessionLocal, engine, Base
from nivara.backend.models import (
    Tenant,
    ResearchSurvey,
    SurveyQuestion,
    ResearchConsentRecord,
    SurveyResponse,
)

async def seed_phase3_research():
    print("🌱 Initializing Phase 3 Research Tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        try:
            stmt = select(Tenant).where(Tenant.slug == "demo-univ")
            res = await db.execute(stmt)
            tenant = res.scalars().first()
            if not tenant:
                print("❌ Tenant 'demo-univ' not found. Please run seed_phase2_tenants.py first.")
                return

            print(f"🏛️ Found Tenant: {tenant.name} ({tenant.slug})")

            # Check existing survey
            surv_stmt = select(ResearchSurvey).where(
                ResearchSurvey.tenant_id == tenant.id,
                ResearchSurvey.ethics_approval_ref == "IRB-2026-DU-RES-108"
            )
            surv_res = await db.execute(surv_stmt)
            existing = surv_res.scalars().first()

            if existing:
                print(f"ℹ️ Survey '{existing.title}' already exists. Skipping duplicate creation.")
                survey = existing
            else:
                survey = ResearchSurvey(
                    tenant_id=tenant.id,
                    title="Academic Pacing, Sleep Architecture & Wellbeing Study",
                    description="Annual cross-sectional study evaluating the impact of semester academic pacing on student sleep quality and cognitive fatigue.",
                    purpose="Investigating empirical associations between credit load, sleep architecture, and subjective wellbeing under ethical review.",
                    target_audience="Undergraduate Engineering & Sciences",
                    ethics_approval_ref="IRB-2026-DU-RES-108",
                    principal_investigator="Dr. Aris Thorne",
                    pi_email="athorne@demo-univ.ac.in",
                    version=1,
                    is_published=True,
                    allow_anonymous=True,
                    created_at=datetime.utcnow() - timedelta(days=14),
                )
                db.add(survey)
                await db.flush()

                # Add Questions
                q1 = SurveyQuestion(
                    survey_id=survey.id,
                    question_text="On average, how manageable do you find your current weekly course and assignment workload?",
                    question_type="likert",
                    options=["1 - Unmanageable", "2 - Challenging", "3 - Moderate", "4 - Manageable", "5 - Very Manageable"],
                    order_index=0,
                    is_required=True,
                    helper_text="Reflect on your academic load over the past 2 weeks.",
                )
                q2 = SurveyQuestion(
                    survey_id=survey.id,
                    question_text="How many hours of uninterrupted sleep do you typically get on weekdays?",
                    question_type="single_choice",
                    options=["< 5 hours", "5-6 hours", "6-7 hours", "7-8 hours", "> 8 hours"],
                    order_index=1,
                    is_required=True,
                )
                q3 = SurveyQuestion(
                    survey_id=survey.id,
                    question_text="Which coping mechanisms do you primarily use during peak exam or deadline periods?",
                    question_type="multiple_choice",
                    options=["Peer study groups", "Physical exercise", "Mindfulness / meditation", "Late-night caffeine", "Creative hobbies", "Campus counselling"],
                    order_index=2,
                    is_required=True,
                )
                q4 = SurveyQuestion(
                    survey_id=survey.id,
                    question_text="What specific institutional change or resource would best support your academic wellbeing this semester?",
                    question_type="text",
                    options=None,
                    order_index=3,
                    is_required=False,
                    helper_text="Optional open feedback for the research committee.",
                )
                db.add_all([q1, q2, q3, q4])
                await db.commit()
                print(f"✅ Created Survey: '{survey.title}' with 4 questions.")

            # Check seeded responses
            count_stmt = select(func.count(SurveyResponse.id)).where(SurveyResponse.survey_id == survey.id)
            count_res = await db.execute(count_stmt)
            resp_count = count_res.scalar() or 0

            if resp_count < 6:
                print(f"📊 Seeding 6 participant cohorts to surpass k >= 5 export threshold...")
                q_stmt = select(SurveyQuestion).where(SurveyQuestion.survey_id == survey.id).order_by(SurveyQuestion.order_index)
                q_res = await db.execute(q_stmt)
                questions = q_res.scalars().all()
                q_ids = [q.id for q in questions]

                cohort_answers = [
                    {
                        q_ids[0]: "2 - Challenging",
                        q_ids[1]: "5-6 hours",
                        q_ids[2]: ["Peer study groups", "Late-night caffeine"],
                        q_ids[3]: "Better scheduling between major assignment due dates.",
                    },
                    {
                        q_ids[0]: "3 - Moderate",
                        q_ids[1]: "6-7 hours",
                        q_ids[2]: ["Physical exercise", "Music / creative hobbies"],
                        q_ids[3]: "Access to 24/7 quiet study spaces.",
                    },
                    {
                        q_ids[0]: "1 - Unmanageable",
                        q_ids[1]: "< 5 hours",
                        q_ids[2]: ["Late-night caffeine"],
                        q_ids[3]: "More flexible submission deadlines when exams coincide.",
                    },
                    {
                        q_ids[0]: "4 - Manageable",
                        q_ids[1]: "7-8 hours",
                        q_ids[2]: ["Physical exercise", "Mindfulness / meditation"],
                        q_ids[3]: "Wellness breaks during midterms.",
                    },
                    {
                        q_ids[0]: "2 - Challenging",
                        q_ids[1]: "5-6 hours",
                        q_ids[2]: ["Peer study groups"],
                        q_ids[3]: "Shorter lab report requirements.",
                    },
                    {
                        q_ids[0]: "3 - Moderate",
                        q_ids[1]: "6-7 hours",
                        q_ids[2]: ["Campus counselling", "Mindfulness / meditation"],
                        q_ids[3]: "Increased peer mentorship hours.",
                    },
                ]

                for i, answers in enumerate(cohort_answers):
                    token = f"part_token_{secrets.token_hex(12)}"
                    consent = ResearchConsentRecord(
                        tenant_id=tenant.id,
                        survey_id=survey.id,
                        irb_protocol_number=survey.ethics_approval_ref,
                        study_title=survey.title,
                        versioned_consent_text=f"STUDY: {survey.title}\nIRB: {survey.ethics_approval_ref}\nCONSENT: Affirmative.",
                        participant_token=token,
                        consent_given=True,
                        consented_at=datetime.utcnow() - timedelta(days=i + 1, hours=i * 2),
                    )
                    db.add(consent)
                    await db.flush()

                    response = SurveyResponse(
                        survey_id=survey.id,
                        consent_record_id=consent.id,
                        respondent_token=token,
                        answers=answers,
                        submitted_at=datetime.utcnow() - timedelta(days=i + 1, hours=i),
                    )
                    db.add(response)

                await db.commit()
                print("✅ Successfully seeded 6 research consent records and survey responses.")
            else:
                print(f"ℹ️ Survey already has {resp_count} responses.")

            print("\n✨ Phase 3 Research Survey Seeding Complete!")

        except Exception as e:
            await db.rollback()
            print(f"❌ Error during seeding: {e}")
            raise e

if __name__ == "__main__":
    asyncio.run(seed_phase3_research())
