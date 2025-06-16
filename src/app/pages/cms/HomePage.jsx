import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from '../../components/Header';
import MainContent from '../../components/MainContent';
import Footer from '../../components/Footer';
import EditProfile from '../../components/EditProfile';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../auth';

function HomePage() {
  const aboutSectionRef = useRef(null);
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    headerTitle: '',
    headerSubtitle: '',
    collegeProgress: [],
    projectTitle: '',
    projectSubtitle: '',
    projectDuration: '',
    projectDescription: '',
    projectDetails: [],
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      // Reset profileData when user is logged out
      setProfileData({
        name: '',
        headerTitle: '',
        headerSubtitle: '',
        collegeProgress: [],
        projectTitle: '',
        projectSubtitle: '',
        projectDuration: '',
        projectDescription: '',
        projectDetails: [],
      });
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          name: data.name || '',
          headerTitle: data.header_title || '',
          headerSubtitle: data.header_subtitle || '',
          collegeProgress: data.college_progress || [],
          projectTitle: data.project_title || '',
          projectSubtitle: data.project_subtitle || '',
          projectDuration: data.project_duration || '',
          projectDescription: data.project_description || '',
          projectDetails: data.project_details || [],
        });
      } else {
        // Fallback if no profile exists
        setProfileData({
          ...profileData,
          name: 'AllenMahdi',
          headerTitle: 'AllenMahdi',
          headerSubtitle: 'Software Developer',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err.message);
      setProfileData({
        ...profileData,
        name: 'AllenMahdi',
        headerTitle: 'AllenMahdi',
        headerSubtitle: 'Software Developer',
      });
    }
  };

  return (
    <>
      <Header aboutSectionRef={aboutSectionRef} profileData={profileData} />
      <Routes>
        <Route
          path='/'
          element={
            <MainContent aboutSectionRef={aboutSectionRef} profileData={profileData} />
          }
        />
        <Route
          path='/edit-profile'
          element={
            <EditProfile profileData={profileData} setProfileData={setProfileData} />
          }
        />
      </Routes>
      <Footer profileData={profileData} />
    </>
  );
}

export default HomePage;