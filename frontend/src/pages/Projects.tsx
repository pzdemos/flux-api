import React from 'react';
import { ProjectList } from '../components/ProjectList';
import type { Project } from '../types';

export const Projects: React.FC = () => {
  const handleSelectProject = (project: Project) => {
    window.location.href = `/workspace/${project._id}`;
  };

  return <ProjectList onSelect={handleSelectProject} />;
};

export default Projects;
