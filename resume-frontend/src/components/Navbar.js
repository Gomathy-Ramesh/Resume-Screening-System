// src/components/Navbar.js

import React, { useState } from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Trophy,
  Briefcase,
  LogOut,
  Menu,
  Brain,
  Calendar,
} from "lucide-react";

import { Button } from "./ui/button";

function Navbar({ handleLogout }) {

  const location = useLocation();

  const [isOpen, setIsOpen] = useState(true);


  // ======================================================
  // MENU ITEMS
  // ======================================================

  const menuItems = [

    // ====================================================
    // DASHBOARD
    // ====================================================

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <LayoutDashboard size={20} />
      ),
    },


    // ====================================================
    // CANDIDATES
    // ====================================================

    {
      name: "Candidates",
      path: "/candidates",
      icon: (
        <Users size={20} />
      ),
    },


    // ====================================================
    // RANKING
    // ====================================================

    {
      name: "Ranking",
      path: "/ranking",
      icon: (
        <Trophy size={20} />
      ),
    },


    // ====================================================
    // JOBS
    // ====================================================

    {
      name: "Jobs",
      path: "/jobs",
      icon: (
        <Briefcase size={20} />
      ),
    },


    // ====================================================
    // SKILL GAP ANALYSIS
    // ====================================================

    {
      name: "Skill Gap Analysis",
      path: "/skills",
      icon: (
        <Brain size={20} />
      ),
    },


    // ====================================================
    // INTERVIEWS
    // ====================================================

    {
      name: "Interviews",
      path: "/interviews",
      icon: (
        <Calendar size={20} />
      ),
    },

  ];


  // ======================================================
  // CHECK ACTIVE ROUTE
  // ======================================================

  const isMenuItemActive = (path) => {

    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(
        `${path}/`
      )
    );
  };


  // ======================================================
  // RENDER
  // ======================================================

  return (

    <aside
      className={`
        relative
        h-screen
        bg-white
        border-r
        border-slate-200
        flex
        flex-col
        justify-between
        shadow-[2px_0_12px_rgba(15,23,42,0.04)]
        transition-all
        duration-300
        overflow-hidden

        ${isOpen ? "w-[240px]" : "w-[80px]"}
      `}
    >

      {/* ==================================================
          DECORATIVE GLOW
      ================================================== */}

      <div
        className="
          absolute
          top-0
          left-0
          w-full
          h-40
          bg-gradient-to-b
          from-blue-100/50
          via-cyan-50/40
          to-transparent
          pointer-events-none
        "
      />


      {/* ==================================================
          TOP
      ================================================== */}

      <div className="relative z-10">


        {/* ==================================================
            TOGGLE BUTTON
        ================================================== */}

        <div className="flex justify-end p-4">

          <button
            onClick={() =>
              setIsOpen(!isOpen)
            }
            className="
              h-11
              w-11
              rounded-2xl
              flex
              items-center
              justify-center
              bg-white
              border
              border-cyan-100
              text-slate-700
              transition-all
              duration-300
              hover:bg-cyan-50
              hover:border-cyan-200
              hover:text-blue-600
              hover:shadow-lg
              hover:scale-105
            "
          >

            <Menu size={22} />

          </button>

        </div>


        {/* ==================================================
            LOGO
        ================================================== */}

        <div className="mb-10 px-5">

          <div
            className={`
              flex
              items-center

              ${
                isOpen
                  ? "gap-4"
                  : "justify-center"
              }
            `}
          >


            {/* ==================================================
                LOGO ICON
            ================================================== */}

            <div
              className="
                h-14
                w-14
                shrink-0
                rounded-2xl
                bg-gradient-to-br
                from-blue-600
                to-cyan-500
                flex
                items-center
                justify-center
                text-white
                text-2xl
                font-bold
                shadow-[0_10px_25px_rgba(37,99,235,0.25)]
              "
            >
              T
            </div>


            {/* ==================================================
                LOGO TEXT
            ================================================== */}

            {isOpen && (

              <div>

                <h2
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                    bg-gradient-to-r
                    from-blue-600
                    to-cyan-500
                    bg-clip-text
                    text-transparent
                  "
                >
                  TalentIQ
                </h2>

                <p
                  className="
                    text-sm
                    text-slate-500
                    mt-1
                  "
                >
                  Intelligent Recruitment
                </p>

              </div>

            )}

          </div>

        </div>


        {/* ==================================================
            MENU
        ================================================== */}

        <div className="space-y-2 px-4">

          {menuItems.map((item) => {

            const isActive =
              isMenuItemActive(
                item.path
              );

            return (

              <Link
                key={item.path}
                to={item.path}
                className="block no-underline"
              >

                <div
                  className={`
                    relative
                    flex
                    items-center

                    ${
                      isOpen
                        ? "justify-start"
                        : "justify-center"
                    }

                    gap-4
                    rounded-2xl
                    px-4
                    py-3.5
                    font-semibold
                    transition-all
                    duration-300
                    group

                    ${
                      isActive
                        ? `
                          bg-gradient-to-r
                          from-blue-600
                          to-cyan-500
                          text-white
                          shadow-[0_10px_25px_rgba(37,99,235,0.30)]
                        `
                        : `
                          text-slate-600
                          hover:bg-gradient-to-r
                          hover:from-blue-50
                          hover:to-cyan-50
                          hover:text-blue-700
                        `
                    }
                  `}
                >


                  {/* ==================================================
                      ACTIVE SIDE BAR
                  ================================================== */}

                  {isActive && (

                    <div
                      className="
                        absolute
                        left-0
                        top-3
                        bottom-3
                        w-1
                        rounded-r-full
                        bg-white
                      "
                    />

                  )}


                  {/* ==================================================
                      ICON
                  ================================================== */}

                  <div
                    className={`
                      min-w-[24px]
                      transition-all
                      duration-300
                      group-hover:scale-110

                      ${
                        isActive
                          ? "text-white"
                          : "text-blue-600"
                      }
                    `}
                  >

                    {item.icon}

                  </div>


                  {/* ==================================================
                      TEXT
                  ================================================== */}

                  {isOpen && (

                    <span>
                      {item.name}
                    </span>

                  )}

                </div>

              </Link>

            );

          })}

        </div>

      </div>


      {/* ==================================================
          BOTTOM
      ================================================== */}

      <div className="relative z-10 p-4">

        <Button
          onClick={handleLogout}
          className="
            h-12
            w-full
            rounded-2xl
            bg-gradient-to-r
            from-blue-600
            to-cyan-500
            text-white
            font-semibold
            transition-all
            duration-300
            hover:scale-[1.02]
            hover:shadow-[0_10px_30px_rgba(37,99,235,0.35)]
            flex
            items-center
            justify-center
            gap-2
          "
        >

          <LogOut size={18} />

          {isOpen && "Logout"}

        </Button>


        {/* ==================================================
            VERSION
        ================================================== */}

        {isOpen && (

          <p
            className="
              mt-4
              text-center
              text-xs
              text-slate-400
            "
          >
            TalentIQ v1.0
          </p>

        )}

      </div>

    </aside>
  );
}

export default Navbar;