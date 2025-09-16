-- =====================================================
-- Interview Scheduling and Notifications Migration
-- =====================================================

-- Create enum for interview types
CREATE TYPE interview_type AS ENUM ('interview', 'meet_greet', 'home_visit');

-- Create enum for interview status
CREATE TYPE interview_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled');

-- Create enum for notification types
CREATE TYPE notification_type AS ENUM ('interview_scheduled', 'interview_response', 'interview_reminder', 'general');

-- Create enum for notification status
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'read', 'dismissed');

-- =====================================================
-- INTERVIEWS TABLE
-- =====================================================
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    adopter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type interview_type NOT NULL,
    status interview_status NOT NULL DEFAULT 'scheduled',
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location TEXT,
    notes TEXT,
    shelter_notes TEXT,
    adopter_response BOOLEAN, -- true = accepted, false = rejected, null = pending
    adopter_response_notes TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    status notification_status NOT NULL DEFAULT 'pending',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- Additional data like interview_id, application_id, etc.
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CALENDAR EVENTS TABLE
-- =====================================================
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location TEXT,
    event_type VARCHAR(50) DEFAULT 'interview',
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_shelter_id ON interviews(shelter_id);
CREATE INDEX idx_interviews_adopter_id ON interviews(adopter_id);
CREATE INDEX idx_interviews_scheduled_date ON interviews(scheduled_date);
CREATE INDEX idx_interviews_status ON interviews(status);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_interview_id ON calendar_events(interview_id);
CREATE INDEX idx_calendar_events_event_date ON calendar_events(event_date);

-- =====================================================
-- TRIGGER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create calendar events when interview is scheduled
CREATE OR REPLACE FUNCTION create_calendar_events_for_interview()
RETURNS TRIGGER AS $$
BEGIN
    -- Create calendar event for shelter user
    INSERT INTO calendar_events (
        user_id,
        interview_id,
        title,
        description,
        event_date,
        event_time,
        duration_minutes,
        location,
        event_type,
        is_confirmed
    )
    SELECT
        s.user_id,
        NEW.id,
        CASE
            WHEN NEW.type = 'interview' THEN 'Interview: ' || p.name
            WHEN NEW.type = 'meet_greet' THEN 'Meet & Greet: ' || p.name
            WHEN NEW.type = 'home_visit' THEN 'Home Visit: ' || p.name
        END,
        'Application ID: ' || NEW.application_id,
        NEW.scheduled_date,
        NEW.scheduled_time,
        NEW.duration_minutes,
        NEW.location,
        NEW.type::text,
        CASE WHEN NEW.adopter_response = true THEN true ELSE false END
    FROM shelters s
    JOIN applications a ON a.id = NEW.application_id
    JOIN pets p ON p.id = a.pet_id
    WHERE s.id = NEW.shelter_id;

    -- Create calendar event for adopter user
    INSERT INTO calendar_events (
        user_id,
        interview_id,
        title,
        description,
        event_date,
        event_time,
        duration_minutes,
        location,
        event_type,
        is_confirmed
    )
    SELECT
        NEW.adopter_id,
        NEW.id,
        CASE
            WHEN NEW.type = 'interview' THEN 'Interview: ' || p.name
            WHEN NEW.type = 'meet_greet' THEN 'Meet & Greet: ' || p.name
            WHEN NEW.type = 'home_visit' THEN 'Home Visit: ' || p.name
        END,
        'With ' || sh.name || ' shelter',
        NEW.scheduled_date,
        NEW.scheduled_time,
        NEW.duration_minutes,
        NEW.location,
        NEW.type::text,
        CASE WHEN NEW.adopter_response = true THEN true ELSE false END
    FROM applications a
    JOIN pets p ON p.id = a.pet_id
    JOIN shelters sh ON sh.id = NEW.shelter_id
    WHERE a.id = NEW.application_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification when interview is scheduled
CREATE OR REPLACE FUNCTION create_notification_for_interview()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for adopter
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        metadata
    )
    SELECT
        NEW.adopter_id,
        'interview_scheduled',
        CASE
            WHEN NEW.type = 'interview' THEN 'Interview Scheduled'
            WHEN NEW.type = 'meet_greet' THEN 'Meet & Greet Scheduled'
            WHEN NEW.type = 'home_visit' THEN 'Home Visit Scheduled'
        END,
        'Your ' || NEW.type::text || ' for ' || p.name || ' has been scheduled for ' ||
        TO_CHAR(NEW.scheduled_date, 'FMDay, FMMonth FMDDth, YYYY') || ' at ' ||
        TO_CHAR(NEW.scheduled_time, 'FMHH12:MI AM') || '. Please respond to confirm your availability.',
        jsonb_build_object(
            'interview_id', NEW.id,
            'application_id', NEW.application_id,
            'pet_name', p.name,
            'shelter_name', s.name,
            'interview_type', NEW.type,
            'scheduled_date', NEW.scheduled_date,
            'scheduled_time', NEW.scheduled_time,
            'location', NEW.location
        )
    FROM applications a
    JOIN pets p ON p.id = a.pet_id
    JOIN shelters s ON s.id = NEW.shelter_id
    WHERE a.id = NEW.application_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update calendar events when interview response changes
CREATE OR REPLACE FUNCTION update_calendar_events_on_response()
RETURNS TRIGGER AS $$
BEGIN
    -- Update calendar events confirmation status
    UPDATE calendar_events
    SET is_confirmed = CASE WHEN NEW.adopter_response = true THEN true ELSE false END
    WHERE interview_id = NEW.id;

    -- Create notification for shelter when adopter responds
    IF OLD.adopter_response IS DISTINCT FROM NEW.adopter_response AND NEW.adopter_response IS NOT NULL THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            metadata
        )
        SELECT
            s.user_id,
            'interview_response',
            CASE WHEN NEW.adopter_response = true THEN 'Interview Accepted' ELSE 'Interview Declined' END,
            CASE
                WHEN NEW.adopter_response = true THEN
                    'The adopter has accepted the ' || NEW.type::text || ' for ' || p.name || ' scheduled on ' ||
                    TO_CHAR(NEW.scheduled_date, 'FMDay, FMMonth FMDDth, YYYY') || '.'
                ELSE
                    'The adopter has declined the ' || NEW.type::text || ' for ' || p.name || ' scheduled on ' ||
                    TO_CHAR(NEW.scheduled_date, 'FMDay, FMMonth FMDDth, YYYY') || '. You may need to reschedule.'
            END,
            jsonb_build_object(
                'interview_id', NEW.id,
                'application_id', NEW.application_id,
                'pet_name', p.name,
                'adopter_response', NEW.adopter_response,
                'adopter_response_notes', NEW.adopter_response_notes,
                'interview_type', NEW.type
            )
        FROM shelters s
        JOIN applications a ON a.id = NEW.application_id
        JOIN pets p ON p.id = a.pet_id
        WHERE s.id = NEW.shelter_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers for updated_at
CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create calendar events when interview is scheduled
CREATE TRIGGER create_calendar_events_on_interview_insert
    AFTER INSERT ON interviews
    FOR EACH ROW EXECUTE FUNCTION create_calendar_events_for_interview();

-- Trigger to create notification when interview is scheduled
CREATE TRIGGER create_notification_on_interview_insert
    AFTER INSERT ON interviews
    FOR EACH ROW EXECUTE FUNCTION create_notification_for_interview();

-- Trigger to update calendar events when interview response changes
CREATE TRIGGER update_calendar_events_on_interview_response
    AFTER UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_calendar_events_on_response();

-- =====================================================
-- SAMPLE DATA FOR TESTING (Optional)
-- =====================================================

-- Example: Insert a sample interview (uncomment to use)
/*
INSERT INTO interviews (
    application_id,
    shelter_id,
    adopter_id,
    type,
    scheduled_date,
    scheduled_time,
    duration_minutes,
    location,
    notes
) VALUES (
    'your-application-id-here',
    'your-shelter-id-here',
    'your-adopter-id-here',
    'interview',
    '2024-12-20',
    '14:00:00',
    30,
    'Video Call (Zoom)',
    'Initial screening interview'
);
*/

-- =====================================================
-- QUERIES FOR VERIFICATION
-- =====================================================

-- Check if tables were created successfully
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('interviews', 'notifications', 'calendar_events');

-- Check if enums were created
SELECT enumname FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname IN ('interview_type', 'interview_status', 'notification_type', 'notification_status');

-- Check if indexes were created
SELECT indexname FROM pg_indexes
WHERE tablename IN ('interviews', 'notifications', 'calendar_events')
AND schemaname = 'public';