import { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "../../components/Header";
import MainContent from "../../components/MainContent";
import Footer from "../../components/Footer";
import EditProfile from "../../components/EditProfile";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../auth";

const defaultProfile = {
  name: "",
  headerTitle: "",
  headerSubtitle: "",
  bio: "",
  collegeProgress: [],
  projectTitle: "",
  projectSubtitle: "",
  projectDuration: "",
  projectDescription: "",
  projectDetails: [],
};

const fallbackProfile = {
  ...defaultProfile,
  name: "AllenMahdi",
  headerTitle: "AllenMahdi",
  headerSubtitle: "Software Developer",
};

function HomePage() {
  const aboutSectionRef = useRef(null);
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(defaultProfile);

  useEffect(() => {
    if (!user) {
      setProfileData(defaultProfile);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        setProfileData({
          name: data.name || "",
          headerTitle: data.header_title || "",
          headerSubtitle: data.header_subtitle || "",
          bio: data.bio || "",
          collegeProgress: data.college_progress || [],
          projectTitle: data.project_title || "",
          projectSubtitle: data.project_subtitle || "",
          projectDuration: data.project_duration || "",
          projectDescription: data.project_description || "",
          projectDetails: data.project_details || [],
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err.message);
        setProfileData(fallbackProfile);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <>
      <Header aboutSectionRef={aboutSectionRef} profileData={profileData} />
      <Routes>
        <Route
          path="/"
          element={
            <MainContent
              aboutSectionRef={aboutSectionRef}
              profileData={profileData}
            />
          }
        />
        <Route
          path="/edit-profile"
          element={
            <EditProfile
              profileData={profileData}
              setProfileData={setProfileData}
            />
          }
        />
      </Routes>
      <Footer profileData={profileData} />
    </>
  );
}

export default HomePage;
