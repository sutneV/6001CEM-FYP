-- Fix notification messages to show proper labels instead of enum values
-- This replaces "Your meet_greet" with "Your meet & greet", etc.

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
        'Your ' ||
        CASE
            WHEN NEW.type = 'interview' THEN 'interview'
            WHEN NEW.type = 'meet_greet' THEN 'meet & greet'
            WHEN NEW.type = 'home_visit' THEN 'home visit'
        END ||
        ' for ' || p.name || ' has been scheduled for ' ||
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

-- Also fix the response notification messages
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
                    'The adopter has accepted the ' ||
                    CASE
                        WHEN NEW.type = 'interview' THEN 'interview'
                        WHEN NEW.type = 'meet_greet' THEN 'meet & greet'
                        WHEN NEW.type = 'home_visit' THEN 'home visit'
                    END ||
                    ' for ' || p.name || ' scheduled on ' ||
                    TO_CHAR(NEW.scheduled_date, 'FMDay, FMMonth FMDDth, YYYY') || '.'
                ELSE
                    'The adopter has declined the ' ||
                    CASE
                        WHEN NEW.type = 'interview' THEN 'interview'
                        WHEN NEW.type = 'meet_greet' THEN 'meet & greet'
                        WHEN NEW.type = 'home_visit' THEN 'home visit'
                    END ||
                    ' for ' || p.name || ' scheduled on ' ||
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
