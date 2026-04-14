import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectList } from '../components/ProjectList';
import type { Project } from '../types';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSelectProject = (project: Project) => {
    navigate(`/workspace/${project._id}`);
  };

  return <ProjectList onSelect={handleSelectProject} />;
};

export default Projects;
