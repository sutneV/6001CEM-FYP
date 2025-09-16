-- =====================================================
-- Update Calendar Event Descriptions Migration
-- =====================================================
-- This migration updates the calendar event descriptions to include more detailed information
-- Run this in your Supabase SQL editor to update the calendar descriptions

-- Function to create calendar events when interview is scheduled (UPDATED)
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
        'Application ID: ' || NEW.application_id || E'\nApplicant: ' || a.first_name || ' ' || a.last_name,
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
        'Application ID: ' || NEW.application_id || E'\nShelter: ' || sh.name,
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

-- Optional: Update existing calendar events with the new description format
-- (Run this if you want to update existing events)
UPDATE calendar_events
SET description = CASE
    WHEN EXISTS (
        SELECT 1 FROM interviews i
        JOIN shelters s ON s.id = i.shelter_id
        WHERE i.id = calendar_events.interview_id
        AND s.user_id = calendar_events.user_id
    ) THEN (
        -- For shelter users: include Application ID and applicant name
        SELECT 'Application ID: ' || i.application_id || E'\nApplicant: ' || a.first_name || ' ' || a.last_name
        FROM interviews i
        JOIN applications a ON a.id = i.application_id
        WHERE i.id = calendar_events.interview_id
    )
    ELSE (
        -- For adopter users: include Application ID and shelter name
        SELECT 'Application ID: ' || i.application_id || E'\nShelter: ' || sh.name
        FROM interviews i
        JOIN shelters sh ON sh.id = i.shelter_id
        WHERE i.id = calendar_events.interview_id
    )
END
WHERE interview_id IS NOT NULL;