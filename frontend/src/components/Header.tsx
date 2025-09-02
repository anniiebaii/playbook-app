
import { Search, Menu, Plus, Video, Mic, FileText, ThumbsUp, Bookmark, LogIn, LogOut, User as LucideUser, Shield, X, Upload, Play, Pause, Mail, Lock, ArrowRight, Eye, EyeOff, LayoutDashboard, Users, MessageSquare, TrendingUp, Settings, Bell, CheckCircle, Clock, AlertCircle, BarChart3, Activity, Award, Star, ChevronDown, HelpCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface HeaderProps {
    title: string,
    subtitle: string,
    highlight_1: string,
    highlight_2: string,
    highlight_3: string
}

const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    highlight_1,
    highlight_2,
    highlight_3
}) => {
    return (
    <div className="mb-12 p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/20 text-center">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
              {subtitle}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{highlight_1}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{highlight_2}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{highlight_3}</span>
              </div>
            </div>
          </div>
    );
}

export default Header;