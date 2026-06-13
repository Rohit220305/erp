"use client";

import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout({ children }) {
  return (
    <div className="h-screen flex flex-col bg-[#ebe9e9e8]">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[74px] bg-white">
        <Header />
      </div>

      {/* Fixed Navbar */}
      <div className="fixed top-[74px] left-0 right-0 z-40  ">
        <Navbar />
      </div>

      {/* Scrollable Content */}
      <main
        className="
          flex-1
          overflow-y-scroll
          mt-[150px]
          mb-[45px]
          px-4
        "
      >
        <div className="min-h-full bg-[#ebe9e9e8]">{children}</div>
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50  bg-[#ebe9e9e8]">
        <Footer />
      </div>
    </div>
  );
}
