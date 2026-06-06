-- V1: Core schema

-- Users
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    full_name     VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url    VARCHAR(500),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Recruiter profiles
CREATE TABLE recruiter_profiles (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    department   VARCHAR(255),
    phone        VARCHAR(50),
    bio          TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Candidate profiles
CREATE TABLE candidate_profiles (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone        VARCHAR(50),
    summary      TEXT,
    skills       TEXT[],
    resume_url   VARCHAR(500),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Jobs
CREATE TABLE jobs (
    id           BIGSERIAL PRIMARY KEY,
    recruiter_id BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    description  TEXT         NOT NULL,
    department   VARCHAR(255),
    location     VARCHAR(255),
    job_type     VARCHAR(50),
    salary_min   NUMERIC(12,2),
    salary_max   NUMERIC(12,2),
    status       VARCHAR(50)  NOT NULL DEFAULT 'DRAFT',
    closes_at    DATE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
    id              BIGSERIAL PRIMARY KEY,
    job_id          BIGINT      NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    cover_letter    TEXT,
    resume_url      VARCHAR(500),
    recruiter_notes TEXT,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (job_id, candidate_id)
);

-- Interviews
CREATE TABLE interviews (
    id             BIGSERIAL PRIMARY KEY,
    application_id BIGINT      NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    scheduled_at   TIMESTAMPTZ NOT NULL,
    duration_mins  INT         NOT NULL DEFAULT 60,
    location       VARCHAR(500),
    meeting_url    VARCHAR(500),
    interviewer_id BIGINT      REFERENCES users(id),
    status         VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    feedback       TEXT,
    rating         SMALLINT CHECK (rating BETWEEN 1 AND 5),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Offers
CREATE TABLE offers (
    id             BIGSERIAL PRIMARY KEY,
    application_id BIGINT        NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    salary         NUMERIC(12,2) NOT NULL,
    start_date     DATE          NOT NULL,
    expires_at     DATE,
    status         VARCHAR(50)   NOT NULL DEFAULT 'DRAFT',
    notes          TEXT,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL,
    title      VARCHAR(255) NOT NULL,
    body       TEXT,
    read       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_jobs_recruiter   ON jobs(recruiter_id);
CREATE INDEX idx_jobs_status      ON jobs(status);
CREATE INDEX idx_applications_job       ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_notifications_user     ON notifications(user_id, read);
