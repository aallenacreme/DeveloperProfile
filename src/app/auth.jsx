import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    console.log('Session:', session ? 'Logged in' : 'Logged out', session?.user || null);
    setUser(session?.user ?? null);
    setIsLoggedIn(!!session);
    setLoading(false);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    console.log('Auth change:', _event, session ? 'Logged in' : 'Logged out', session?.user || null);
    setUser(session?.user ?? null);
    setIsLoggedIn(!!session);
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;

    // Create profile after signup
    if (data.user) {
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        username,
        name: username,
      });
    }
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};




export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};