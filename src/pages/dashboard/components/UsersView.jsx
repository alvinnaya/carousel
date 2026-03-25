import React from 'react';
import { Loader2 } from 'lucide-react';

const UsersView = ({ users, loadingUsers, fetchUserStats, handlePromote }) => {
  if (loadingUsers) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-3xl font-black">User Management</h2>
         <p className="font-bold text-[var(--text-muted)]">{users.length} registered users</p>
      </div>

      <div className="mus-panel bg-white overflow-hidden border-2 border-[var(--border-dark)]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[var(--bg-main)] border-b-2 border-[var(--border-dark)]">
            <tr>
              <th className="p-4 font-black">User</th>
              <th className="p-4 font-black">Email</th>
              <th className="p-4 font-black">Roles</th>
              <th className="p-4 font-black">Created At</th>
              <th className="p-4 font-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b mus-border-light hover:bg-[var(--bg-main)] transition-colors">
                <td className="p-4 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg border border-[var(--border-dark)] overflow-hidden bg-[var(--bg-main)]">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.userName}`} alt="av" />
                   </div>
                   <span className="font-bold">{u.userName}</span>
                </td>
                <td className="p-4 font-bold text-[var(--text-muted)]">{u.email}</td>
                <td className="p-4">
                   <div className="flex gap-1">
                     {u.roles.map(r => (
                       <span key={r} className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${r === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                         {r}
                       </span>
                     ))}
                   </div>
                </td>
                <td className="p-4 text-xs font-bold text-[var(--text-muted)]">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                     <button 
                       onClick={() => fetchUserStats(u.id)}
                       className="mus-button-ghost p-2 text-xs font-black uppercase"
                     >
                       Stats
                     </button>
                     {!u.roles.includes('Admin') && (
                       <button 
                         onClick={() => handlePromote(u.id)}
                         className="mus-button-amber px-3 py-1 text-xs"
                       >
                         Promote
                       </button>
                     )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersView;
