import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  Edit2,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input, TextArea } from '../components/Input';
import api from '../services/api';

export const Profile = () => {
  const { currentUser, profileData, fetchProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    bio: '',
    skills: '',
    targetRoles: '',
  });

  useEffect(() => {
    if (profileData) {
      setForm({
        name: profileData.user?.name || '',
        bio: profileData.profile?.bio || 'Computer Science student passionate about web development and AI.',
        skills: (profileData.profile?.skills || ['JavaScript', 'React', 'Node.js', 'Python']).join(', '),
        targetRoles: (profileData.profile?.targetRoles || ['Frontend Engineer', 'SDE 1']).join(', '),
      });
    }
  }, [profileData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/profile', {
        name: form.name,
        bio: form.bio,
        skills: form.skills.split(',').map((s) => s.trim()),
        targetRoles: form.targetRoles.split(',').map((s) => s.trim()),
      });
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const displayName = profileData?.user?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-[#e6eeff] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#121c2a] flex items-center gap-2">
            <User className="w-7 h-7 text-[#4648d4]" /> Student Profile
          </h1>
          <p className="text-xs text-[#767586] mt-1">Manage your academic profile and placement preferences.</p>
        </div>
        <Button variant={editing ? 'primary' : 'secondary'} onClick={editing ? handleSave : () => setEditing(true)} loading={saving}>
          {editing ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
          {editing ? 'Save Profile' : 'Edit Profile'}
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#4648d4] text-white font-extrabold text-3xl flex items-center justify-center shadow-md">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-[#121c2a]">{displayName}</h2>
            <p className="text-xs text-[#767586] flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5" /> {currentUser?.email}
            </p>
            <p className="text-xs text-[#464554] pt-1">{form.bio}</p>
          </div>
        </div>
      </Card>

      {editing ? (
        <Card title="Edit Information">
          <div className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextArea label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <Input label="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            <Input label="Target Roles" value={form.targetRoles} onChange={(e) => setForm({ ...form, targetRoles: e.target.value })} />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Technical Skills">
            <div className="flex flex-wrap gap-2 pt-1">
              {form.skills.split(',').map((s, i) => (
                <span key={i} className="px-3 py-1 bg-[#e6eeff] text-[#4648d4] font-semibold text-xs rounded-full">
                  {s.trim()}
                </span>
              ))}
            </div>
          </Card>

          <Card title="Target Roles">
            <div className="flex flex-wrap gap-2 pt-1">
              {form.targetRoles.split(',').map((r, i) => (
                <span key={i} className="px-3 py-1 bg-[#f8f9ff] border border-[#e6eeff] text-[#121c2a] font-semibold text-xs rounded-full">
                  {r.trim()}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
