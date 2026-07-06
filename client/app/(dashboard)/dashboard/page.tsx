import React from "react";

const DashboardPage = () => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col justify-center items-center">
      <h1 className="text-3xl font-extrabold mb-4 bg-[linear-gradient(129deg,#108A00_6.67%,#C8E7A6_116%)] bg-clip-text text-transparent">
        Dashboard Overview
      </h1>
      <p className="text-gray-500 text-lg text-center max-w-md">
        Welcome to your dashboard area. The layout is fully ready and configured with Redux, QueryClient, and custom client hooks.
      </p>
    </div>
  );
};

export default DashboardPage;