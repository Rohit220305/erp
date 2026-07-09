"use client";

import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout({ children }) {
  return (
    <div className="h-screen flex flex-col bg-[#ebe9e9e8]">
      <div className="fixed top-0 left-0 right-0 z-50 h-[74px] bg-white">
        <Header />
      </div>

      <div className="fixed top-[74px] left-0 right-0 z-40  ">
        <Navbar />
      </div>

      <main
        className="
          flex-1
          overflow-y-hidden
          mt-[150px]
          mb-[45px]
          px-4
        "
      >
        <div className="h-full bg-[#ebe9e9e8]">{children}</div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50  bg-[#ebe9e9e8]">
        <Footer />
      </div>
    </div>
  );
}
