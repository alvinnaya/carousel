import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Palette,
  Grid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import designService from '../../api/designService';
import userService from '../../api/userService';

// Modular Components
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import ProjectsView from './components/ProjectsView';
import UsersView from './components/UsersView';
import UserStatsModal from './components/UserStatsModal';
import AssetsView from './components/AssetsView';
import { ConfirmModal } from '../../components/ui/Modal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Projects');
  const [designs, setDesigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });

  const showConfirm = (title, message, onConfirm, isDanger = false) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, isDanger });
  };

  const isAdmin = user?.roles?.includes('Admin');

  useEffect(() => {
    if (activeTab === 'Projects') {
      fetchDesigns();
    } else if (activeTab === 'Users' && isAdmin) {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const response = await designService.getAll();
      console.log('Dashboard fetch response full:', response);

      let extractedDesigns = [];
      if (Array.isArray(response)) {
        extractedDesigns = response;
      } else if (response?.success && Array.isArray(response.data)) {
        extractedDesigns = response.data;
      } else if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        const possibleArray = Object.values(response.data).find(val => Array.isArray(val));
        if (possibleArray) extractedDesigns = possibleArray;
      } else if (response?.success === false) {
        setError(response.message || 'Server returned an error');
      }

      setDesigns(extractedDesigns);
    } catch (err) {
      console.error('Fetch designs error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please sign in again.');
      } else {
        setError('Failed to load designs. Check console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const response = await designService.create({ title: 'Untitled Design' });
      if (response.success) {
        navigate(`/editor/${response.data.id}`);
      }
    } catch (err) {
      console.error('Failed to create design', err);
    }
  };

  const handleDeleteDesign = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    showConfirm(
      'Hapus Desain?',
      'Desain ini akan dihapus secara permanen dan tidak dapat dikembalikan.',
      async () => {
        try {
          const response = await designService.delete(id);
          if (response.success) {
            setDesigns(designs.filter(d => d.id !== id));
          }
        } catch (err) {
          console.error('Failed to delete design', err);
        }
      },
      true
    );
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userService.getAll();
      console.log('User list response:', response);

      let extractedUsers = [];
      if (Array.isArray(response)) {
        extractedUsers = response;
      } else if (response?.success && Array.isArray(response.data)) {
        extractedUsers = response.data;
      }

      setUsers(extractedUsers);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserStats = async (id) => {
    try {
      const response = await userService.getStats(id);
      if (response.success) {
        setSelectedUserStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch user stats', err);
    }
  };

  const handlePromote = (id) => {
    showConfirm(
      'Promosikan ke Admin?',
      'User ini akan diberikan hak akses Admin. Tindakan ini tidak dapat dibatalkan dengan mudah.',
      async () => {
        try {
          const response = await userService.promoteToAdmin(id);
          if (response.success) {
            fetchUsers();
          }
        } catch (err) {
          console.error('Failed to promote user', err);
        }
      },
      true
    );
  };

  const tools = [
    { name: 'Projects', label: 'Projects', icon: <LayoutDashboard size={20} /> },
    { name: 'Templates', label: 'Templates', icon: <Palette size={20} /> },
    { name: 'Assets', label: 'Assets', icon: <FolderOpen size={20} /> },
    ...(isAdmin ? [{ name: 'Users', label: 'Users', icon: <Grid size={20} /> }] : []),
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-main)] font-['DM_Sans'] overflow-hidden relative">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(s => ({ ...s, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
        confirmLabel="Ya, lanjutkan"
        cancelLabel="Batal"
      />
      <Sidebar
        tools={tools}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logout={logout}
      />

      <main className="flex-1 flex flex-col ml-24 overflow-hidden h-full">
        <DashboardHeader user={user} />

        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
          {activeTab === 'Users' && isAdmin ? (
            <UsersView
              users={users}
              loadingUsers={loadingUsers}
              fetchUserStats={fetchUserStats}
              handlePromote={handlePromote}
            />
          ) : activeTab === 'Assets' ? (
            <AssetsView user={user} />
          ) : (
            <ProjectsView
              designs={designs}
              loading={loading}
              error={error}
              fetchDesigns={fetchDesigns}
              handleCreateNew={handleCreateNew}
              handleDeleteDesign={handleDeleteDesign}
              user={user}
            />
          )}
        </div>
      </main>

      <UserStatsModal
        stats={selectedUserStats}
        onClose={() => setSelectedUserStats(null)}
      />
    </div>
  );
};

export default Dashboard;
