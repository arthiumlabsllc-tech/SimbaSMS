'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Shield, Bell, AlertTriangle, Eye, EyeOff, Lock,
  Mail, Phone, Globe, Clock, Camera, Trash2, LogOut,
  Check, X, Monitor, Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'danger';

const tabs: { key: SettingsTab; label: string; icon: any }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between py-3 cursor-pointer group">
      <span className="text-body-sm text-content">{label}</span>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative w-10 h-5.5 rounded-full transition-colors duration-200',
          enabled ? 'bg-primary' : 'bg-line'
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled && 'translate-x-[18px]'
        )} />
      </button>
    </label>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    codeReceived: true,
    refundProcessed: true,
    marketing: false,
    telegram: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-heading-lg font-bold text-content">Settings</h1>
        <p className="text-body-sm text-content-secondary mt-1">Manage your account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-body-sm font-medium whitespace-nowrap transition-all',
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-content-secondary hover:text-content hover:bg-elevated-secondary'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.key === 'danger' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-error" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Profile tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                      <span className="text-heading-md font-bold text-primary">U</span>
                    </div>
                    <div>
                      <Button variant="secondary" size="sm" icon={<Camera className="h-4 w-4" />}>
                        Change Avatar
                      </Button>
                      <p className="text-body-xs text-content-tertiary mt-1">JPG or PNG, max 2MB</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Full Name" placeholder="John Doe" startContent={<User className="h-4 w-4" />} />
                    <Input label="Email" placeholder="you@example.com" startContent={<Mail className="h-4 w-4" />} disabled />
                    <Input label="Phone (optional)" placeholder="+234 800 000 000" startContent={<Phone className="h-4 w-4" />} />
                    <Input label="Country" placeholder="Nigeria" startContent={<Globe className="h-4 w-4" />} />
                  </div>

                  <div className="flex justify-end">
                    <Button>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Ensure your account is secure with a strong password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      label="Current Password"
                      type={showOldPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      startContent={<Lock className="h-4 w-4" />}
                      endContent={
                        <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="text-content-tertiary hover:text-content">
                          {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />
                    <Input
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      startContent={<Lock className="h-4 w-4" />}
                      endContent={
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="text-content-tertiary hover:text-content">
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="Repeat new password"
                      startContent={<Lock className="h-4 w-4" />}
                    />
                    <div className="flex justify-end">
                      <Button>Update Password</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>Devices currently logged into your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { device: 'Chrome on Windows', location: 'Lagos, NG', current: true, icon: Monitor },
                        { device: 'Safari on iPhone', location: 'Lagos, NG', current: false, icon: Smartphone },
                      ].map((session, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-line last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-elevated-secondary flex items-center justify-center">
                              <session.icon className="h-4 w-4 text-content-secondary" />
                            </div>
                            <div>
                              <p className="text-body-sm font-medium text-content flex items-center gap-2">
                                {session.device}
                                {session.current && <Badge variant="success" size="sm">Current</Badge>}
                              </p>
                              <p className="text-body-xs text-content-tertiary">{session.location}</p>
                            </div>
                          </div>
                          {!session.current && (
                            <Button variant="ghost" size="sm" className="text-error hover:text-error hover:bg-error/10">
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what you want to be notified about</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 divide-y divide-border">
                    <Toggle
                      label="Order updates"
                      enabled={notifications.orderUpdates}
                      onChange={(v) => setNotifications({ ...notifications, orderUpdates: v })}
                    />
                    <Toggle
                      label="Code received"
                      enabled={notifications.codeReceived}
                      onChange={(v) => setNotifications({ ...notifications, codeReceived: v })}
                    />
                    <Toggle
                      label="Refund processed"
                      enabled={notifications.refundProcessed}
                      onChange={(v) => setNotifications({ ...notifications, refundProcessed: v })}
                    />
                    <Toggle
                      label="Marketing & promotions"
                      enabled={notifications.marketing}
                      onChange={(v) => setNotifications({ ...notifications, marketing: v })}
                    />
                    <Toggle
                      label="Telegram notifications"
                      enabled={notifications.telegram}
                      onChange={(v) => setNotifications({ ...notifications, telegram: v })}
                    />
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button>Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Danger zone */}
            {activeTab === 'danger' && (
              <Card className="border-error/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-error">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>Irreversible actions that affect your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg border border-error/20 bg-error/5">
                    <h4 className="text-body-sm font-semibold text-content mb-1">Delete Account</h4>
                    <p className="text-body-xs text-content-secondary mb-4">
                      This will permanently delete your account, balance, and all order history. This action cannot be undone.
                    </p>
                    <div className="max-w-xs">
                      <Input
                        placeholder='Type "DELETE" to confirm'
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                      />
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="danger"
                        disabled={deleteConfirm !== 'DELETE'}
                        icon={<Trash2 className="h-4 w-4" />}
                      >
                        Delete My Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
