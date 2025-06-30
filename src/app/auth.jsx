import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false); // New state for employee status
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEmployeeStatusAndProfile = async (userId) => {
      if (!userId) {
        setIsEmployee(false);
        return;
      }

      try {
        // Check if user is an employee by querying employees table
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('id, name')
          .eq('user_id', userId)
          .single();

        if (employeeError && employeeError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned", which is fine; other errors are logged
          console.error('Error checking employee status:', employeeError);
          setIsEmployee(false);
          return;
        }

        setIsEmployee(!!employee); // Set true if employee record exists

        // Check if profile exists, create if missing (for employees)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking profile:', profileError);
          return;
        }

        if (!profile && employee) {
          // No profile exists, create one for employee using name from employees table
          const baseUsername = employee.name.toLowerCase().replace(/\s+/g, '.');
          let username = baseUsername;
          let suffix = 1;

          // Ensure username is unique
          while (true) {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('username', username)
              .single();

            if (!existingProfile) break;
            username = `${baseUsername}${suffix}`;
            suffix++;
          }

          const { error: insertError } = await supabase.from('profiles').insert({
            user_id: userId,
            username,
            name: employee.name,
          });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }
      } catch (err) {
        console.error('Unexpected error in checkEmployeeStatusAndProfile:', err);
        setIsEmployee(false);
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session:', session ? 'Logged in' : 'Logged out', session?.user || null);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
      if (session?.user) {
        checkEmployeeStatusAndProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth change:', _event, session ? 'Logged in' : 'Logged out', session?.user || null);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
      if (session?.user) {
        checkEmployeeStatusAndProfile(session.user.id);
      } else {
        setIsEmployee(false);
      }
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
    <AuthContext.Provider value={{ user, isLoggedIn, isEmployee, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};