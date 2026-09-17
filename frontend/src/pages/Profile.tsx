import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="page-title">Profile</h1>

      <div className="card p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center mb-4 shadow-glow">
            <span className="text-white text-3xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">{user.name}</h2>
          <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 mt-2 capitalize">
            {user.role}
          </span>
        </div>

        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: user.email },
            { icon: Phone, label: 'Phone', value: user.phone || 'Not provided' },
            { icon: Shield, label: 'Role', value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
            { icon: Calendar, label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <item.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-surface-400 uppercase font-medium">{item.label}</p>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
