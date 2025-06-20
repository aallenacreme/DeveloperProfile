import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iwikoypoupxvpiortcci.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aWtveXBvdXB4dnBpb3J0Y2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDM1MzEsImV4cCI6MjA2NTA3OTUzMX0.I0bXgKw4bVPYdx0bEvnFfuqzfaNa27h_A0JRRdP71dU";

export const supabase = createClient(supabaseUrl, supabaseKey);

