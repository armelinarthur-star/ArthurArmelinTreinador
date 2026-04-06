-- Recreate handle_new_user trigger to auto-confirm email on signup
-- This removes the need for email verification entirely
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  _role public.user_role;
BEGIN
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'athlete');

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''),
    _role
  );

  -- Only create streak for athletes
  IF _role = 'athlete' THEN
    INSERT INTO public.streaks (athlete_id) VALUES (NEW.id);
  END IF;

  -- Auto-confirm email — skip email verification entirely
  UPDATE auth.users SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;

  RETURN NEW;
END;
$$;
