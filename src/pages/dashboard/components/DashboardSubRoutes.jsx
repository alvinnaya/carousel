import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ProjectsView from './ProjectsView';
import TemplatesView from './TemplatesView';
import AssetsView from './AssetsView';
import UsersView from './UsersView';
import ElementsView from './ElementsView';

export const DashboardProjects = () => {
  const { designs, loading, error, fetchDesigns, handleCreateNew, handleDeleteDesign, user } = useOutletContext();
  return (
    <ProjectsView
      designs={designs}
      loading={loading}
      error={error}
      fetchDesigns={fetchDesigns}
      handleCreateNew={handleCreateNew}
      handleDeleteDesign={handleDeleteDesign}
      user={user}
    />
  );
};

export const DashboardTemplates = () => {
  const { 
    templates, 
    loadingTemplates, 
    error, 
    fetchTemplates, 
    handleDeleteTemplate, 
    isAdmin, 
    handleToggleVisibility,
    showConfirm
  } = useOutletContext();
  
  return (
    <TemplatesView 
      templates={templates}
      loading={loadingTemplates}
      error={error}
      fetchTemplates={fetchTemplates}
      handleDeleteTemplate={handleDeleteTemplate}
      isAdmin={isAdmin}
      handleToggleVisibility={handleToggleVisibility}
      showConfirm={showConfirm}
    />
  );
};

export const DashboardAssets = () => {
  const { user } = useOutletContext();
  return <AssetsView user={user} />;
};

export const DashboardUsers = () => {
  const { users, loadingUsers, fetchUserStats, handlePromote } = useOutletContext();
  return (
    <UsersView
      users={users}
      loadingUsers={loadingUsers}
      fetchUserStats={fetchUserStats}
      handlePromote={handlePromote}
    />
  );
};

export const DashboardElements = () => {
  const { user } = useOutletContext();
  return <ElementsView user={user} />;
};
