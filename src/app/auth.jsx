import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./services/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEmployeeStatusAndCreateProfile = async (userId) => {
      if (!userId) {
        setIsEmployee(false);
        return;
      }

      try {
        // Step 1: Check if user is an employee
        const { data: employee, error: employeeError } = await supabase
          .from("employees")
          .select("id, name")
          .eq("user_id", userId)
          .maybeSingle(); // <- THIS avoids 406 when no row found

        if (employeeError && employeeError.code !== "PGRST116") {
          console.warn("Employee check error:", employeeError.message);
          setIsEmployee(false);
          return;
        }

        const isEmp = !!employee;
        setIsEmployee(isEmp);

        if (!isEmp) return; // Skip profile creation if not employee

        // Step 2: Check if profile already exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error checking profile:", profileError);
          return;
        }

        // Step 3: Create profile if missing
        if (!profile) {
          const baseUsername = employee.name.toLowerCase().replace(/\s+/g, ".");
          let username = baseUsername;
          let suffix = 1;

          while (true) {
            const { data: existingProfile } = await supabase
              .from("profiles")
              .select("id")
              .eq("username", username)
              .single();

            if (!existingProfile) break;
            username = `${baseUsername}${suffix}`;
            suffix++;
          }

          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              user_id: userId,
              username,
              name: employee.name,
            });

          if (insertError) {
            console.error("Error creating profile:", insertError);
          }
        }
      } catch (err) {
        console.error("Unexpected error in employee/profile check:", err);
        setIsEmployee(false);
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
      if (session?.user) {
        checkEmployeeStatusAndCreateProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session);
      if (session?.user) {
        checkEmployeeStatusAndCreateProfile(session.user.id);
      } else {
        setIsEmployee(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signup = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;

    if (data.user) {
      await supabase.from("profiles").insert({
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
    <AuthContext.Provider
      value={{ user, isLoggedIn, isEmployee, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
