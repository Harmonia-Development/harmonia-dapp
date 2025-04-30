"use client"
import React, { useState } from 'react';

interface NotificationSettingsProps {
  // You can add props if needed, e.g., for saving settings to a backend
}

const NotificationSettings: React.FC<NotificationSettingsProps> = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('System');

  // State for toggle switches
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [inAppEnabled, setInAppEnabled] = useState(false);

  // Tabs data
  const tabs = ['Governance', 'Community', 'Treasury', 'System'];

  // Handle Save Settings button click
  const handleSaveSettings = () => {
    console.log('Settings saved:', {
      email: emailEnabled,
      push: pushEnabled,
      inApp: inAppEnabled,
    });
    // Add logic to save settings (e.g., API call)
  };

  return (
    <div className="w-full mt-4 mx-auto p-6 bg-gray-900 rounded-xl shadow-lg text-white">
      {/* Header */}
      <h2 className="text-xl font-semibold mb-2">Notification Settings</h2>
      <p className="text-gray-400 text-sm mb-6">Manage how you receive notifications</p>

      {/* Tabs */}
      <div className="flex justify-between mb-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === tab
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content (System Tab) */}
      {activeTab === 'System' && (
        <div className="space-y-6">
          {/* Email Toggle */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium">Email</h3>
              <p className="text-xs text-gray-400">Receive system notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={emailEnabled}
                onChange={() => setEmailEnabled(!emailEnabled)}
              />
              <div
                className={`w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-purple-600 transition-colors duration-300`}
              >
                <div
                  className={`w-5 h-5 bg-gray-400 rounded-full absolute top-0.5 left-0.5 peer-checked:bg-white peer-checked:translate-x-5 transition-all duration-300`}
                />
              </div>
            </label>
          </div>

          {/* Push Toggle */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium">Push</h3>
              <p className="text-xs text-gray-400">Receive system notifications via push</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={pushEnabled}
                onChange={() => setPushEnabled(!pushEnabled)}
              />
              <div
                className={`w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-purple-600 transition-colors duration-300`}
              >
                <div
                  className={`w-5 h-5 bg-gray-400 rounded-full absolute top-0.5 left-0.5 peer-checked:bg-white peer-checked:translate-x-5 transition-all duration-300`}
                />
              </div>
            </label>
          </div>

          {/* In-App Toggle */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium">In-App</h3>
              <p className="text-xs text-gray-400">Receive system notifications in-app</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={inAppEnabled}
                onChange={() => setInAppEnabled(!inAppEnabled)}
              />
              <div
                className={`w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-purple-600 transition-colors duration-300`}
              >
                <div
                  className={`w-5 h-5 bg-gray-400 rounded-full absolute top-0.5 left-0.5 peer-checked:bg-white peer-checked:translate-x-5 transition-all duration-300`}
                />
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Save Settings Button */}
      <div className="mt-8">
        <button
          className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          onClick={handleSaveSettings}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;