import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    let subscription: any;
    try {
      const authSub = supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
          setSession(session);
          if (session?.user) {
            setRoleLoading(true);
            try {
              // First try direct table query
              const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .eq('role', 'admin')
                .maybeSingle();

              if (error) {
                // If table query fails due to RLS, try RPC `has_role` which is SECURITY DEFINER
                // eslint-disable-next-line no-console
                console.warn('[useAuth] user_roles query error, falling back to rpc has_role', error.message ?? error);
                const { data: rpcData, error: rpcErr } = await supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' });
                if (rpcErr) {
                  // eslint-disable-next-line no-console
                  console.error('[useAuth] rpc has_role failed', rpcErr);
                  setIsAdmin(false);
                } else {
                  setIsAdmin(Boolean(rpcData));
                }
              } else {
                setIsAdmin(!!data);
              }
              } catch (err) {
              // eslint-disable-next-line no-console
              console.error('[useAuth] unexpected error checking admin role', err);
              setIsAdmin(false);
            } finally {
              setRoleLoading(false);
            }
          } else {
            setIsAdmin(false);
            setRoleLoading(false);
          }
        } catch (err) {
          // log and fallback
          // eslint-disable-next-line no-console
          console.error('[useAuth] error during onAuthStateChange handler', err);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      });
      subscription = authSub?.data?.subscription ?? authSub?.subscription;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[useAuth] failed to subscribe to auth changes', err);
      setLoading(false);
    }

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          setRoleLoading(true);
          try {
            const { data } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .eq('role', 'admin')
              .maybeSingle();
            setIsAdmin(!!data);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[useAuth] error fetching session or roles', err);
            setIsAdmin(false);
          } finally {
            setRoleLoading(false);
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[useAuth] error fetching session or roles', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      try {
        subscription?.unsubscribe?.();
      } catch (e) {
        // noop
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  return { session, isAdmin, loading, roleLoading, signIn, signOut };
}
