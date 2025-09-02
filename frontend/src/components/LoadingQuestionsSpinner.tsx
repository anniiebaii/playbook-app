import React, { useState } from "react";
  
export const LoadingQuestionsSpinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center py-16">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <span className="text-white/80 text-lg font-medium">Loading questions...</span>
    </div>
  );
};

export default LoadingQuestionsSpinner;