import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Globe, Building2, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import api from '../services/api';

export const Settings = () => {
  const { currentUser, logout, profileData, fetchProfile } = useAuth();

  const [domain, setDomain] = useState('Software Engineering');
  const [dreamCompany, setDreamCompany] = useState('Google');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profileData?.user) {
      if (profileData.user.targetDomain) setDomain(profileData.user.targetDomain);
      if (profileData.user.dreamCompany) setDreamCompany(profileData.user.dreamCompany);
    }
  }, [profileData]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await api.post('/profile', {
        targetDomain: domain,
        dreamCompany: dreamCompany,
      });

      if (res.data.success) {
        await fetchProfile();
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      alert('Failed to save settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="border-b border-[#e6eeff] pb-4">
        <h1 className="text-2xl font-extrabold text-[#121c2a] flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-[#4648d4]" /> Application Settings
        </h1>
        <p className="text-xs text-[#767586] mt-1">Configure your target career domain and dream target companies.</p>
      </div>

      <Card title="Career Targets & Preferences">
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Target Tech Domain / Field"
              placeholder="e.g. Software Engineering / Full Stack"
              icon={Globe}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />

            <Input
              label="Dream Target Company"
              placeholder="e.g. Google / Microsoft / Amazon"
              icon={Building2}
              value={dreamCompany}
              onChange={(e) => setDreamCompany(e.target.value)}
              required
            />
          </div>

          {savedSuccess && (
            <div className="p-3 text-xs bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Settings updated successfully!
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={saving}>
              <Save className="w-4 h-4 mr-2" /> Save Preferences
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Danger Zone">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-[#ba1a1a]">Log Out Account</div>
            <div className="text-xs text-[#767586]">End current user session on this device</div>
          </div>
          <Button variant="danger" size="sm" onClick={logout}>
            <Trash2 className="w-4 h-4 mr-2" /> Log Out
          </Button>
        </div>
      </Card>

      <div className="text-center pt-8">
        <p className="text-xs text-[#767586]">Developed by Amareswar Nayak</p>
      </div>
    </div>
  );
};
