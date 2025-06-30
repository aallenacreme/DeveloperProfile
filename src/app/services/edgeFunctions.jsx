import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://iwikoypoupxvpiortcci.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aWtveXBvdXB4dnBpb3J0Y2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDM1MzEsImV4cCI6MjA2NTA3OTUzMX0.I0bXgKw4bVPYdx0bEvnFfuqzfaNa27h_A0JRRdP71dU"
);

const getCloudFunction = async () => {
  try {
    const { data, error } = await supabase.functions.invoke("hello-world", {
      body: { name: "Functions" },
    });
    if (error) {
      console.error("Error invoking function:", error);
      return;
    }
    console.log("Response:", data);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};

getCloudFunction();

export default getCloudFunction;
