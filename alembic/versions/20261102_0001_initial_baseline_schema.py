"""initial_baseline_schema

Revision ID: 20261102_0001
Revises: 1f1146440072
Create Date: 2026-11-02 05:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import String, Text, Boolean, DateTime, Integer, Float, JSON


# revision identifiers, used by Alembic.
revision: str = '20261102_0001'
down_revision: Union[str, Sequence[str], None] = '1f1146440072'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Table: tenants
    op.create_table(
        'tenants',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('slug', String(length=100), nullable=False),
        sa.Column('name', String(length=255), nullable=False),
        sa.Column('domain', String(length=255), nullable=True),
        sa.Column('description', Text(), nullable=True),
        sa.Column('is_active', Boolean(), nullable=False),
        sa.Column('created_at', DateTime(), nullable=True)
    )
    op.create_index('ix_tenants_slug', 'tenants', ['slug'], unique=True)
    op.create_index('ix_tenants_domain', 'tenants', ['domain'], unique=False)
    # Table: users
    op.create_table(
        'users',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('email', String(length=255), nullable=False),
        sa.Column('hashed_password', String(length=255), nullable=False),
        sa.Column('role', String(length=50), nullable=False),
        sa.Column('is_active', Boolean(), nullable=True),
        sa.Column('created_at', DateTime(), nullable=True)
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    # Table: counselling_requests
    op.create_table(
        'counselling_requests',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('tenant_id', String(length=36), nullable=False),
        sa.Column('student_name', String(length=255), nullable=False),
        sa.Column('student_email', String(length=255), nullable=False),
        sa.Column('student_phone', String(length=100), nullable=True),
        sa.Column('preferred_contact_method', String(length=50), nullable=False),
        sa.Column('urgency_level', String(length=50), nullable=False),
        sa.Column('notes', Text(), nullable=True),
        sa.Column('consent_to_contact', Boolean(), nullable=False),
        sa.Column('status', String(length=50), nullable=False),
        sa.Column('assigned_counsellor_id', String(length=36), nullable=True),
        sa.Column('counsellor_notes', Text(), nullable=True),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.Column('updated_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['assigned_counsellor_id'], ['users.id'])
    )
    op.create_index('ix_counselling_requests_tenant_id', 'counselling_requests', ['tenant_id'], unique=False)
    # Table: institutional_resources
    op.create_table(
        'institutional_resources',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('tenant_id', String(length=36), nullable=False),
        sa.Column('title', String(length=255), nullable=False),
        sa.Column('category', String(length=100), nullable=False),
        sa.Column('summary', Text(), nullable=False),
        sa.Column('contact_info', String(length=255), nullable=False),
        sa.Column('is_emergency', Boolean(), nullable=False),
        sa.Column('is_active', Boolean(), nullable=False),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'])
    )
    op.create_index('ix_institutional_resources_tenant_id', 'institutional_resources', ['tenant_id'], unique=False)
    # Table: organizations
    op.create_table(
        'organizations',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('name', String(length=255), nullable=False),
        sa.Column('org_type', String(length=100), nullable=False),
        sa.Column('official_email', String(length=255), nullable=False),
        sa.Column('contact_name', String(length=255), nullable=False),
        sa.Column('contact_designation', String(length=100), nullable=False),
        sa.Column('contact_phone', String(length=50), nullable=False),
        sa.Column('country', String(length=100), nullable=False),
        sa.Column('state', String(length=100), nullable=False),
        sa.Column('city', String(length=100), nullable=False),
        sa.Column('website', String(length=255), nullable=True),
        sa.Column('description', Text(), nullable=True),
        sa.Column('status', String(length=50), nullable=False),
        sa.Column('rejection_reason', Text(), nullable=True),
        sa.Column('verified_at', DateTime(), nullable=True),
        sa.Column('tenant_id', String(length=36), nullable=True),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.Column('updated_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'])
    )
    op.create_index('ix_organizations_official_email', 'organizations', ['official_email'], unique=True)
    # Table: research_consortia
    op.create_table(
        'research_consortia',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('name', String(length=255), nullable=False),
        sa.Column('master_irb_ref', String(length=100), nullable=False),
        sa.Column('lead_tenant_id', String(length=36), nullable=False),
        sa.Column('description', Text(), nullable=True),
        sa.Column('is_active', Boolean(), nullable=False),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['lead_tenant_id'], ['tenants.id'])
    )
    # Table: screening_campaigns
    op.create_table(
        'screening_campaigns',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('tenant_id', String(length=36), nullable=False),
        sa.Column('title', String(length=255), nullable=False),
        sa.Column('description', Text(), nullable=True),
        sa.Column('start_date', DateTime(), nullable=True),
        sa.Column('end_date', DateTime(), nullable=True),
        sa.Column('supported_instruments', JSON(), nullable=False),
        sa.Column('target_audience', String(length=255), nullable=False),
        sa.Column('is_published', Boolean(), nullable=False),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'])
    )
    op.create_index('ix_screening_campaigns_tenant_id', 'screening_campaigns', ['tenant_id'], unique=False)
    # Table: student_profiles
    op.create_table(
        'student_profiles',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('user_id', String(length=36), nullable=False),
        sa.Column('age', String(length=50), nullable=False),
        sa.Column('gender', String(length=50), nullable=False),
        sa.Column('university', String(length=255), nullable=False),
        sa.Column('department', String(length=255), nullable=False),
        sa.Column('academic_year', String(length=100), nullable=False),
        sa.Column('current_cgpa', String(length=50), nullable=False),
        sa.Column('waiver_or_scholarship', String(length=10), nullable=False),
        sa.Column('consent_given', Boolean(), nullable=False),
        sa.Column('consent_timestamp', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'])
    )
    # Table: tenant_brandings
    op.create_table(
        'tenant_brandings',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('tenant_id', String(length=36), nullable=False),
        sa.Column('logo_url', String(length=500), nullable=True),
        sa.Column('primary_color', String(length=50), nullable=False),
        sa.Column('accent_color', String(length=50), nullable=False),
        sa.Column('portal_title', String(length=255), nullable=False),
        sa.Column('support_email', String(length=255), nullable=True),
        sa.Column('support_phone', String(length=100), nullable=True),
        sa.Column('custom_welcome_text', Text(), nullable=True),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.Column('updated_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'])
    )
    # Table: tenant_memberships
    op.create_table(
        'tenant_memberships',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('tenant_id', String(length=36), nullable=False),
        sa.Column('user_id', String(length=36), nullable=False),
        sa.Column('role', String(length=50), nullable=False),
        sa.Column('is_active', Boolean(), nullable=False),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'])
    )
    op.create_index('ix_tenant_memberships_user_id', 'tenant_memberships', ['user_id'], unique=False)
    op.create_index('ix_tenant_memberships_tenant_id', 'tenant_memberships', ['tenant_id'], unique=False)
    # Table: consortium_memberships
    op.create_table(
        'consortium_memberships',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('consortium_id', String(length=36), nullable=False),
        sa.Column('tenant_id', String(length=36), nullable=False),
        sa.Column('local_ethics_ref', String(length=100), nullable=False),
        sa.Column('is_active', Boolean(), nullable=False),
        sa.Column('joined_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['consortium_id'], ['research_consortia.id']),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'])
    )
    op.create_index('ix_consortium_memberships_consortium_id', 'consortium_memberships', ['consortium_id'], unique=False)
    op.create_index('ix_consortium_memberships_tenant_id', 'consortium_memberships', ['tenant_id'], unique=False)
    # Table: notifications
    op.create_table(
        'notifications',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('user_id', String(length=36), nullable=True),
        sa.Column('organization_id', String(length=36), nullable=True),
        sa.Column('recipient_role', String(length=50), nullable=True),
        sa.Column('title', String(length=255), nullable=False),
        sa.Column('message', Text(), nullable=False),
        sa.Column('notification_type', String(length=50), nullable=False),
        sa.Column('link', String(length=255), nullable=True),
        sa.Column('is_read', Boolean(), nullable=False),
        sa.Column('created_at', DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'])
    )
    op.create_index('ix_notifications_organization_id', 'notifications', ['organization_id'], unique=False)
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'], unique=False)
    # Table: organization_template_requests
    op.create_table(
        'organization_template_requests',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('organization_id', String(length=36), nullable=False),
        sa.Column('requester_user_id', String(length=36), nullable=False),
        sa.Column('expected_participants', Integer(), nullable=False),
        sa.Column('intended_use', Text(), nullable=False),
        sa.Column('requested_modules', JSON(), nullable=False),
        sa.Column('desired_branding', JSON(), nullable=True),
        sa.Column('additional_requirements', Text(), nullable=True),
        sa.Column('authorized_contact_info', JSON(), nullable=False),
        sa.Column('status', String(length=50), nullable=False),
        sa.Column('review_notes', Text(), nullable=True),
        sa.Column('decision_reason', Text(), nullable=True),
        sa.Column('internal_notes', Text(), nullable=True),
        sa.Column('assigned_reviewer_id', String(length=36), nullable=True),
        sa.Column('reviewed_by_user_id', String(length=36), nullable=True),
        sa.Column('reviewed_at', DateTime(), nullable=True),
        sa.Column('provisioned_tenant_id', String(length=36), nullable=True),
        sa.Column('provisioned_at', DateTime(), nullable=True),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.Column('updated_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['requester_user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['reviewed_by_user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['provisioned_tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id']),
        sa.ForeignKeyConstraint(['assigned_reviewer_id'], ['users.id'])
    )
    op.create_index('ix_organization_template_requests_requester_user_id', 'organization_template_requests', ['requester_user_id'], unique=False)
    op.create_index('ix_organization_template_requests_organization_id', 'organization_template_requests', ['organization_id'], unique=False)
    op.create_index('ix_organization_template_requests_provisioned_tenant_id', 'organization_template_requests', ['provisioned_tenant_id'], unique=False)
    # Table: organization_users
    op.create_table(
        'organization_users',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('organization_id', String(length=36), nullable=False),
        sa.Column('user_id', String(length=36), nullable=False),
        sa.Column('role', String(length=50), nullable=False),
        sa.Column('is_primary_contact', Boolean(), nullable=False),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'])
    )
    op.create_index('ix_organization_users_organization_id', 'organization_users', ['organization_id'], unique=False)
    op.create_index('ix_organization_users_user_id', 'organization_users', ['user_id'], unique=False)
    # Table: research_surveys
    op.create_table(
        'research_surveys',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('tenant_id', String(length=36), nullable=False),
        sa.Column('title', String(length=255), nullable=False),
        sa.Column('description', Text(), nullable=True),
        sa.Column('purpose', Text(), nullable=False),
        sa.Column('target_audience', String(length=255), nullable=False),
        sa.Column('ethics_approval_ref', String(length=100), nullable=False),
        sa.Column('principal_investigator', String(length=255), nullable=False),
        sa.Column('pi_email', String(length=255), nullable=False),
        sa.Column('version', Integer(), nullable=False),
        sa.Column('is_published', Boolean(), nullable=False),
        sa.Column('allow_anonymous', Boolean(), nullable=False),
        sa.Column('consortium_id', String(length=36), nullable=True),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.Column('updated_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['consortium_id'], ['research_consortia.id'])
    )
    op.create_index('ix_research_surveys_tenant_id', 'research_surveys', ['tenant_id'], unique=False)
    op.create_index('ix_research_surveys_consortium_id', 'research_surveys', ['consortium_id'], unique=False)
    # Table: screening_sessions
    op.create_table(
        'screening_sessions',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('student_id', String(length=36), nullable=False),
        sa.Column('tenant_id', String(length=36), nullable=True),
        sa.Column('campaign_id', String(length=36), nullable=True),
        sa.Column('phq_responses', JSON(), nullable=False),
        sa.Column('gad_responses', JSON(), nullable=False),
        sa.Column('pss_responses', JSON(), nullable=False),
        sa.Column('pss_score', Integer(), nullable=False),
        sa.Column('depression_prob', Float(), nullable=False),
        sa.Column('depression_flag', Boolean(), nullable=False),
        sa.Column('depression_tier', String(length=50), nullable=False),
        sa.Column('anxiety_prob', Float(), nullable=False),
        sa.Column('anxiety_flag', Boolean(), nullable=False),
        sa.Column('anxiety_tier', String(length=50), nullable=False),
        sa.Column('safety_flag', Boolean(), nullable=False),
        sa.Column('safety_rule_triggered', String(length=100), nullable=True),
        sa.Column('safety_message', Text(), nullable=True),
        sa.Column('shap_summary', JSON(), nullable=True),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['campaign_id'], ['screening_campaigns.id']),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id'])
    )
    op.create_index('ix_screening_sessions_campaign_id', 'screening_sessions', ['campaign_id'], unique=False)
    op.create_index('ix_screening_sessions_created_at', 'screening_sessions', ['created_at'], unique=False)
    op.create_index('ix_screening_sessions_tenant_id', 'screening_sessions', ['tenant_id'], unique=False)
    # Table: crisis_audit_logs
    op.create_table(
        'crisis_audit_logs',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('session_id', String(length=36), nullable=False),
        sa.Column('safety_rule_triggered', String(length=100), nullable=False),
        sa.Column('action_taken', String(length=255), nullable=False),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['screening_sessions.id'])
    )
    # Table: organization_request_history
    op.create_table(
        'organization_request_history',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('request_id', String(length=36), nullable=False),
        sa.Column('from_status', String(length=50), nullable=True),
        sa.Column('to_status', String(length=50), nullable=False),
        sa.Column('changed_by_user_id', String(length=36), nullable=False),
        sa.Column('comments', Text(), nullable=True),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['request_id'], ['organization_template_requests.id']),
        sa.ForeignKeyConstraint(['changed_by_user_id'], ['users.id'])
    )
    op.create_index('ix_organization_request_history_request_id', 'organization_request_history', ['request_id'], unique=False)
    # Table: research_consent_records
    op.create_table(
        'research_consent_records',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('tenant_id', String(length=36), nullable=False),
        sa.Column('survey_id', String(length=36), nullable=False),
        sa.Column('irb_protocol_number', String(length=100), nullable=False),
        sa.Column('study_title', String(length=255), nullable=False),
        sa.Column('versioned_consent_text', Text(), nullable=False),
        sa.Column('participant_token', String(length=100), nullable=False),
        sa.Column('consent_given', Boolean(), nullable=False),
        sa.Column('consented_at', DateTime(), nullable=False),
        sa.Column('withdrawal_requested', Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['survey_id'], ['research_surveys.id'])
    )
    op.create_index('ix_research_consent_records_survey_id', 'research_consent_records', ['survey_id'], unique=False)
    op.create_index('ix_research_consent_records_participant_token', 'research_consent_records', ['participant_token'], unique=False)
    op.create_index('ix_research_consent_records_tenant_id', 'research_consent_records', ['tenant_id'], unique=False)
    # Table: survey_questions
    op.create_table(
        'survey_questions',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('survey_id', String(length=36), nullable=False),
        sa.Column('question_text', Text(), nullable=False),
        sa.Column('question_type', String(length=50), nullable=False),
        sa.Column('options', JSON(), nullable=True),
        sa.Column('order_index', Integer(), nullable=False),
        sa.Column('is_required', Boolean(), nullable=False),
        sa.Column('helper_text', Text(), nullable=True),
        sa.Column('created_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['survey_id'], ['research_surveys.id'])
    )
    op.create_index('ix_survey_questions_survey_id', 'survey_questions', ['survey_id'], unique=False)
    # Table: survey_responses
    op.create_table(
        'survey_responses',
        sa.Column('id', String(length=36), primary_key=True),
        sa.Column('survey_id', String(length=36), nullable=False),
        sa.Column('consent_record_id', String(length=36), nullable=False),
        sa.Column('respondent_token', String(length=100), nullable=False),
        sa.Column('answers', JSON(), nullable=False),
        sa.Column('submitted_at', DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['consent_record_id'], ['research_consent_records.id']),
        sa.ForeignKeyConstraint(['survey_id'], ['research_surveys.id'])
    )
    op.create_index('ix_survey_responses_consent_record_id', 'survey_responses', ['consent_record_id'], unique=False)
    op.create_index('ix_survey_responses_respondent_token', 'survey_responses', ['respondent_token'], unique=False)
    op.create_index('ix_survey_responses_submitted_at', 'survey_responses', ['submitted_at'], unique=False)
    op.create_index('ix_survey_responses_survey_id', 'survey_responses', ['survey_id'], unique=False)


def downgrade() -> None:
    op.drop_table('survey_responses')
    op.drop_table('survey_questions')
    op.drop_table('research_consent_records')
    op.drop_table('organization_request_history')
    op.drop_table('crisis_audit_logs')
    op.drop_table('screening_sessions')
    op.drop_table('research_surveys')
    op.drop_table('organization_users')
    op.drop_table('organization_template_requests')
    op.drop_table('notifications')
    op.drop_table('consortium_memberships')
    op.drop_table('tenant_memberships')
    op.drop_table('tenant_brandings')
    op.drop_table('student_profiles')
    op.drop_table('screening_campaigns')
    op.drop_table('research_consortia')
    op.drop_table('organizations')
    op.drop_table('institutional_resources')
    op.drop_table('counselling_requests')
    op.drop_table('users')
    op.drop_table('tenants')
