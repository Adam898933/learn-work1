CREATE TABLE public.account_data (
  firebase_uid TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.account_data TO service_role;
ALTER TABLE public.account_data ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.account_data IS 'Per-account saved app data (profile, friends, rooms, chat history). Only reachable through the verified server route; no client policies on purpose.';

CREATE OR REPLACE FUNCTION public.merge_account_data(_uid TEXT, _set JSONB, _remove TEXT[], _replace BOOLEAN)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result TIMESTAMPTZ;
BEGIN
  INSERT INTO public.account_data AS a (firebase_uid, data, updated_at)
  VALUES (_uid, COALESCE(_set, '{}'::jsonb), now())
  ON CONFLICT (firebase_uid) DO UPDATE
    SET data = CASE WHEN _replace THEN COALESCE(_set, '{}'::jsonb)
                    ELSE (a.data || COALESCE(_set, '{}'::jsonb)) - COALESCE(_remove, ARRAY[]::TEXT[]) END,
        updated_at = now()
  RETURNING a.updated_at INTO result;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.merge_account_data(TEXT, JSONB, TEXT[], BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.merge_account_data(TEXT, JSONB, TEXT[], BOOLEAN) TO service_role;