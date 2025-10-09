-- Enhanced version with window tracking
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requests_count INT NOT NULL DEFAULT 0,
    window_start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_request_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id UUID,
    p_max_requests INT,
    p_time_window_seconds INT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INT;
    window_start TIMESTAMPTZ;
    time_window_expired BOOLEAN;
BEGIN
    SELECT requests_count, window_start_at 
    INTO current_count, window_start
    FROM public.rate_limits
    WHERE user_id = p_user_id;

    -- Check if time window has expired
    time_window_expired := (window_start IS NULL) OR 
                          (NOW() - window_start >= (p_time_window_seconds * INTERVAL '1 second'));

    IF time_window_expired THEN
        -- Start new time window
        INSERT INTO public.rate_limits (user_id, requests_count, window_start_at, last_request_at) 
        VALUES (p_user_id, 1, NOW(), NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            requests_count = 1, 
            window_start_at = NOW(),
            last_request_at = NOW();
        RETURN TRUE;
    ELSE
        -- Within time window
        IF current_count >= p_max_requests THEN
            RETURN FALSE; -- Rate limit exceeded
        ELSE
            -- Increment count
            UPDATE public.rate_limits 
            SET 
                requests_count = requests_count + 1,
                last_request_at = NOW()
            WHERE user_id = p_user_id;
            RETURN TRUE;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;