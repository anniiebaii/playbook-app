import React, { useState } from "react";
import { X, Shield, Star } from "lucide-react";
import { User, QuestionWithRelations } from "../../lib/supabase";

type ExpertsModalProps = {
  showExperts: boolean;
  setShowExperts: (show: boolean) => void;
  setSelectedExpert: (expert: User | null) => void;
  setShowAskExpert: (show: boolean) => void;
  users: User[];
};

export const ExpertsModal: React.FC<ExpertsModalProps> = ({
  showExperts,
  setShowExperts,
  setSelectedExpert,
  setShowAskExpert,
  users,
}) => {
  if (!showExperts) return null;
  const experts = users.filter((u) => u.isAdmin);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/20">
        <div className="p-6 border-b border-white/20 flex justify-between items-center">
          <h2 className="text-3xl font-bold">Meet Our Expert Advisors</h2>
          <button
            onClick={() => setShowExperts(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] grid grid-cols-1 md:grid-cols-2 gap-6">
          {experts.map((expert) => (
            <div
              key={expert.email}
              className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl bg-white/10 rounded-full w-16 h-16 flex items-center justify-center font-semibold">
                  {expert.avatar || "EX"}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    {expert.name}
                    <Shield className="w-5 h-5 text-yellow-400" />
                  </h3>
                  <p className="text-white/80">{expert.title || "Expert Advisor"}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {expert.rating || 5.0}
                    </span>
                    <span>{expert.responseTime || "< 24 hours"}</span>
                  </div>
                </div>
              </div>
              <p className="text-white/80 mb-4">
                {expert.bio || "Experienced professional ready to help."}
              </p>
              {expert.expertise && (
                <div className="mb-4">
                  <p className="text-sm text-white/60 mb-2">Areas of Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {expert.expertise.map((exp) => (
                      <span
                        key={exp}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedExpert(expert);
                    setShowExperts(false);
                  }}
                  className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setSelectedExpert(expert);
                    setShowAskExpert(true);
                    setShowExperts(false);
                  }}
                  className="flex-1 py-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition text-blue-300"
                >
                  Ask Question
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type ExpertProfileModalProps = {
  selectedExpert: User | null;
  showAskExpert: boolean;
  setSelectedExpert: (expert: User | null) => void;
  setShowAskExpert: (show: boolean) => void;
};

export const ExpertProfileModal: React.FC<ExpertProfileModalProps> = ({
  selectedExpert,
  showAskExpert,
  setSelectedExpert,
  setShowAskExpert,
}) => {
  if (!selectedExpert || showAskExpert) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20">
        <div className="relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-8 border-b border-white/20">
          <button
            onClick={() => setSelectedExpert(null)}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-6">
            <div className="text-6xl bg-white/10 rounded-full w-24 h-24 flex items-center justify-center font-semibold">
              {selectedExpert.avatar || "EX"}
            </div>
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                {selectedExpert.name}
                <Shield className="w-6 h-6 text-yellow-400" />
              </h2>
              <p className="text-xl text-white/80 mt-1">
                {selectedExpert.title || "Expert Advisor"}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <button
            onClick={() => setShowAskExpert(true)}
            className="w-full py-3 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition text-blue-300 font-semibold"
          >
            Ask {selectedExpert.name} a Question
          </button>
        </div>
      </div>
    </div>
  );
};