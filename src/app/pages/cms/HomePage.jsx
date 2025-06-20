import { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "../../components/Header";
import MainContent from "../../components/MainContent";
import Footer from "../../components/Footer";
import EditProfile from "../../components/EditProfile";
import EmployeeManagement from "../../components/employeeManagement/employeeManagement";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../auth";

function HomePage() {
  const aboutSectionRef = useRef(null);
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: "",
    headerTitle: "",
    headerSubtitle: "",
    bio: "",
    interests: [],
    collegeProgress: [],
    projectTitle: "",
    projectSubtitle: "",
    projectDuration: "",
    projectDescription: "",
    projectDetails: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user ? user.id : "2c21ff55-494a-4e13-bd95-80505ceed600")
        .single();

      setProfileData({
        name: data.name || "",
        headerTitle: data.header_title || "",
        headerSubtitle: data.header_subtitle || "",
        bio: data.bio || "",
        interests: data.interests || [],
        collegeProgress: data.college_progress || [],
        projectTitle: data.project_title || "",
        projectSubtitle: data.project_subtitle || "",
        projectDuration: data.project_duration || "",
        projectDescription: data.project_description || "",
        projectDetails: data.project_details || [],
      });
      setIsLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
        <Route
          path="/employee-management"
          element={<EmployeeManagement />}
        />
      </Routes>
      <Footer profileData={profileData} />
    </>
  );
}

export default HomePage;