import React, { useState } from 'react';
import { Notification } from '../lib/supabase';
import { Utils } from '../lib/utils';
import { Search, Menu, Plus, Video, Mic, FileText, ThumbsUp, Bookmark, LogIn, LogOut, User as LucideUser, Shield, X, Upload, Play, Pause, Mail, Lock, ArrowRight, Eye, EyeOff, LayoutDashboard, Users, MessageSquare, TrendingUp, Settings, Bell, CheckCircle, Clock, AlertCircle, BarChart3, Activity, Award, Star, ChevronDown, HelpCircle } from 'lucide-react';


interface NotificationsProp {
    setShowNotifications: (show: boolean) => void;
    notifications: Notification[]
}
const NotificationsModal: React.FC<NotificationsProp> = ({
    setShowNotifications,
    notifications
}) => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl max-w-md w-full border border-white/20">
          <div className="p-6 border-b border-white/20 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Notifications</h2>
            <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {notifications.map(notification => {
              const Icon = notification.icon;
              return (
                <div key={notification.id} className="flex gap-3">
                  <div className={`p-2 bg-white/10 rounded-lg ${notification.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="text-sm text-white/80">{notification.message}</p>
                    <span className="text-xs text-white/60">{Utils.formatTimestamp(notification.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
}

export default NotificationsModal;