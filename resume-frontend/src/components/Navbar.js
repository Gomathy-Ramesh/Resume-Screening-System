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
} from "lucide-react";

import { Button } from "./ui/button";

function Navbar({ handleLogout }) {

  const location =
    useLocation();

  const [isOpen, setIsOpen] =
    useState(true);

  // =========================
  // MENU ITEMS
  // =========================

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <LayoutDashboard size={20} />
      ),
    },

    {
      name: "Candidates",
      path: "/candidates",
      icon: (
        <Users size={20} />
      ),
    },

    {
      name: "Ranking",
      path: "/ranking",
      icon: (
        <Trophy size={20} />
      ),
    },

    {
      name: "Jobs",
      path: "/jobs",
      icon: (
        <Briefcase size={20} />
      ),
    },
  ];

  return (

    <aside
      className={`
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

      {/* Decorative glow */}

      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-violet-100/60 to-transparent pointer-events-none"></div>

      {/* =========================
          TOP
      ========================= */}

      <div className="relative z-10">

        {/* TOGGLE */}

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
              border-violet-100
              text-slate-700
              transition-all
              duration-300
              hover:bg-violet-50
              hover:shadow-lg
              hover:scale-105
            "
          >
            <Menu size={22} />
          </button>

        </div>

        {/* =========================
            LOGO
        ========================= */}

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

            {/* LOGO */}

            <div
              className="
                h-14
                w-14
                rounded-3xl
                bg-gradient-to-r
                from-violet-600
                to-fuchsia-500
                flex
                items-center
                justify-center
                text-white
                text-2xl
                font-black
                shadow-[0_10px_30px_rgba(139,92,246,0.35)]
              "
            >
              S
            </div>

            {/* TEXT */}

            {isOpen && (

              <div>

                <h2
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                    bg-gradient-to-r
                    from-violet-600
                    to-fuchsia-500
                    bg-clip-text
                    text-transparent
                  "
                >
                  Selectra
                </h2>

                <p
                  className="
                    text-sm
                    text-slate-500
                    mt-1
                  "
                >
                  Smart Hiring Hub
                </p>

              </div>
            )}

          </div>

        </div>

        {/* =========================
            MENU
        ========================= */}

        <div className="space-y-2 px-4">

          {menuItems.map((item) => {

            const isActive =
              location.pathname ===
              item.path;

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
                        from-violet-600
                        to-fuchsia-500
                        text-white
                        shadow-[0_10px_25px_rgba(139,92,246,0.30)]
                      `
                        : `
                        text-slate-600
                        hover:bg-violet-50
                        hover:text-violet-700
                      `
                    }
                  `}
                >

                  {/* ACTIVE SIDE BAR */}

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

                  {/* ICON */}

                  <div
                    className="
                      min-w-[24px]
                      transition-transform
                      duration-300
                      group-hover:scale-110
                    "
                  >
                    {item.icon}
                  </div>

                  {/* TEXT */}

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

      {/* =========================
          BOTTOM
      ========================= */}

      <div className="relative z-10 p-4">

        <Button
          onClick={handleLogout}
          className="
            h-12
            w-full
            rounded-2xl
            bg-gradient-to-r
            from-violet-600
            to-fuchsia-500
            text-white
            font-semibold
            transition-all
            duration-300
            hover:scale-[1.02]
            hover:shadow-[0_10px_30px_rgba(139,92,246,0.35)]
            flex
            items-center
            justify-center
            gap-2
          "
        >

          <LogOut size={18} />

          {isOpen &&
            "Logout"}

        </Button>

        {isOpen && (
  <div className="mt-5 text-center">
    <p className="text-xs text-slate-400">
      Selectra v1.0
    </p>
  </div>
)}

      </div>

    </aside>
  );
}

export default Navbar;