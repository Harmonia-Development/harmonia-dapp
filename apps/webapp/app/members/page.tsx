"use client";
import React from "react";
import Header from "@/components/dashboard/Header";
import MembersDashboard from "@/components/members/MembersDashboard";
// import DAODashboard from '@/components/dashboard/DAODashboard'

const page = () => {
  return (
    <div className="bg-black h-full md:h-screen">
      <Header />
      <div className="min-w-screen flex justify-between items-center px-5 pt-4">
        <MembersDashboard />
      </div>
    </div>
  );  
};

export default page;
