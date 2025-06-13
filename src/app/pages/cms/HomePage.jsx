// HomePage.jsx
import { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "../../components/Header";
import MainContent from "../../components/MainContent";
import Footer from "../../components/Footer";
import EditProfile from "../../components/EditProfile";
import { axiosInstance } from "../../components/axiosInstance";
import * as supabaseService from "../../services/supabaseService";

function HomePage() {
  const aboutSectionRef = useRef(null);
  const [profileData, setProfileData] = useState({
    name: "",
    headerTitle: "",
    headerSubtitle: "",
    collegeProgress: [],
    javaSkills: [],
    sqlSkills: [],
    footerText: "",
    projectTitle: "",
    projectSubtitle: "",
    projectDuration: "",
    projectDescription: "",
    projectDetails: [],
  });

  useEffect(() => {
    fetchContentSectionData();
    fetchProfile();
  }, []);

  const fetchContentSectionData = async () => {
    const textContentSectionData =
      await supabaseService.getAllContentSections();
    console.log("textContentSectionData \n", textContentSectionData);
  };

  const fetchProfile = async () => {
    try {
      const { data } = await axiosInstance.get("/profile");
      setProfileData(data);
    } catch (err) {
      console.error(
        "Failed to fetch profile:",
        err.response?.data?.message || err.message
      );
      setProfileData({
        ...profileData,
        name: "AllenMahdi",
        headerTitle: "AllenMahdi",
        headerSubtitle: "Software Developer",
      });
    }
  };

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
