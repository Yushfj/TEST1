"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const EmployeeManagementPage = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen">
      {/* Background Image */}
      <Image
        src="https://picsum.photos/1920/1080"
        alt="Lal's Motor Winders Background"
        fill
        style={{ objectFit: 'cover' }}
        className="absolute top-0 left-0 w-full h-full -z-10"
      />

      {/* Overlay for better readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 -z-9" />

      {/* Menu on Top */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-center bg-transparent backdrop-blur-md text-white shadow-lg rounded-lg border border-accent/40">
        <h1 className="text-2xl text-center">Employee Management</h1>
      </div>

      {/* Options Menu */}
      <div className="absolute top-20 left-0 w-full p-4 flex justify-center bg-transparent backdrop-blur-md text-black shadow-lg rounded-lg border border-accent/40">
        <nav className="flex space-x-4">
          <Button asChild variant="gradient">
            <Link href="/employees/create">New Employee</Link>
          </Button>
          <Button asChild variant="gradient">
            <Link href="/employees/change">Change Employee Information</Link>
          </Button>
          <Button asChild variant="gradient">
            <Link href="/employees/information">Employee Informations</Link>
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default EmployeeManagementPage;
