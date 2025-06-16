import { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../auth';

function EditProfile({ profileData, setProfileData }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: profileData.name || '',
    headerTitle: profileData.headerTitle || '',
    headerSubtitle: profileData.headerSubtitle || '',
    collegeProgress: profileData.collegeProgress.join('\n') || '',
    projectTitle: profileData.projectTitle || '',
    projectSubtitle: profileData.projectSubtitle || '',
    projectDuration: profileData.projectDuration || '',
    projectDescription: profileData.projectDescription || '',
    projectDetails: profileData.projectDetails.join('\n') || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!user || !user.id) throw new Error('User is not authenticated');

      // Use formData.name as fallback for username if user.user_metadata.username is missing
      const username = user.user_metadata?.username || formData.name || 'default_user';

      // Check for username conflict
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username)
        .neq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existingProfile) throw new Error('Username is already taken by another user');

      const updates = {
        name: formData.name,
        header_title: formData.headerTitle,
        header_subtitle: formData.headerSubtitle,
        college_progress: formData.collegeProgress.split('\n').filter(Boolean),
        project_title: formData.projectTitle,
        project_subtitle: formData.projectSubtitle,
        project_duration: formData.projectDuration,
        project_description: formData.projectDescription,
        project_details: formData.projectDetails.split('\n').filter(Boolean),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(
          { user_id: user.id, username, ...updates },
          { onConflict: ['user_id'] }
        );

      if (error) throw error;

      setProfileData({
        name: formData.name,
        headerTitle: formData.headerTitle,
        headerSubtitle: formData.headerSubtitle,
        collegeProgress: formData.collegeProgress.split('\n').filter(Boolean),
        projectTitle: formData.projectTitle,
        projectSubtitle: formData.projectSubtitle,
        projectDuration: formData.projectDuration,
        projectDescription: formData.projectDescription,
        projectDetails: formData.projectDetails.split('\n').filter(Boolean),
      });
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err.message, err);
      alert(`Failed to update profile: ${err.message}`);
    }
  };

  return (
    <Container className='my-5'>
      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <h2>Edit Profile</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Header Title</Form.Label>
              <Form.Control
                type='text'
                name='headerTitle'
                value={formData.headerTitle}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Header Subtitle</Form.Label>
              <Form.Control
                type='text'
                name='headerSubtitle'
                value={formData.headerSubtitle}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>College Progress (one per line)</Form.Label>
              <Form.Control
                as='textarea'
                name='collegeProgress'
                value={formData.collegeProgress}
                onChange={handleChange}
                rows={5}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Project Title</Form.Label>
              <Form.Control
                type='text'
                name='projectTitle'
                value={formData.projectTitle}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Project Subtitle</Form.Label>
              <Form.Control
                type='text'
                name='projectSubtitle'
                value={formData.projectSubtitle}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Project Duration</Form.Label>
              <Form.Control
                type='text'
                name='projectDuration'
                value={formData.projectDuration}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Project Description</Form.Label>
              <Form.Control
                as='textarea'
                name='projectDescription'
                value={formData.projectDescription}
                onChange={handleChange}
                rows={3}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Project Details (one per line)</Form.Label>
              <Form.Control
                as='textarea'
                name='projectDetails'
                value={formData.projectDetails}
                onChange={handleChange}
                rows={5}
              />
            </Form.Group>
            <Button type='submit'>Save Changes</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default EditProfile;