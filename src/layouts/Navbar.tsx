import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Menu, X, Rocket, Search, ArrowUpRight, LogOut, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageStore } from "../store/useLanguageStore";
import { t } from "../i18n/messages";
import { SearchModal } from "../components/SearchModal";
import { useAuthStore } from "../store/useAuthStore";

const links = [
  { to: "/", labelKey: "nav_home" },
  { to: "/streams", labelKey: "nav_streams" },
  { to: "/departments", labelKey: "nav_departments" },
  { to: "/explore-3d", labelKey: "nav_explore" },
  { to: "/compare-courses", labelKey: "nav_compare" },
  { to: "/career-quiz", labelKey: "nav_quiz" },
  { to: "/career-roadmap", labelKey: "nav_roadmap" },
  { to: "/resume-builder", labelKey: "nav_resume" },
];

const menuLinks = [
  ...links,
  { to: "/cover-letter", labelKey: "nav_cover_letter" },
  { to: "/career-ai", labelKey: "nav_chatbot" },
  { to: "/mentors", labelKey: "nav_mentors" },
  { to: "/mock-interview", labelKey: "nav_interview" },
  { to: "/future-jobs", labelKey: "nav_career" },
  { to: "/services", labelKey: "nav_services" },
  { to: "/about", labelKey: "nav_about" },
  { to: "/contact", labelKey: "nav_contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const lang = useLanguageStore((s) => s.lang);
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    setShowProfileMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 rounded-t-[2rem] sm:rounded-t-[2.5rem]">
      <div className="px-5 sm:px-8 py-4 flex items-center justify-between min-w-0">
        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 min-w-0">
          <Rocket size={24} className="text-gray-900" fill="currentColor" />
          <span>FuturePath 3D</span>
        </Link>

        {/* Center Links */}
        <div className="hidden xl:flex flex-1 items-center justify-center gap-4 min-w-0">
          <nav className="flex items-center gap-4 text-[13px] font-medium text-gray-600">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "hover:text-black transition-colors whitespace-nowrap",
                    isActive ? "text-black font-semibold" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                {t(lang, item.labelKey as any)}
              </NavLink>
            ))}
          </nav>
          <div className="h-4 w-px bg-gray-300 mx-1" />
          
          {user ? (
            <div className="relative" onMouseEnter={() => setShowProfileMenu(true)} onMouseLeave={() => setShowProfileMenu(false)}>
              <Button as={Link} to="/admin" variant="outline" className="gap-2 px-5 py-2 rounded-xl group border-gray-200">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <UserIcon size={14} />
                </div>
                <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
              </Button>
              
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full pt-2 w-48"
                  >
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button as={Link} to="/admin" variant="primary" className="gap-2 px-5 py-2">
              Login <ArrowUpRight size={16} />
            </Button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white transition-colors cursor-pointer z-40"
            aria-label="Search site"
          >
            <Search size={16} />
          </button>
          
          <button
            className="inline-flex h-10 items-center justify-center rounded-full border border-gray-200 text-gray-900 px-4 hover:bg-gray-50 transition-colors shrink-0 bg-white shadow-sm"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className="mr-2 text-sm font-medium">Menu</span>
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-4 sm:right-8 top-20 w-64 bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden z-50 origin-top-right backdrop-blur-xl"
          >
            <div className="p-3 flex flex-col gap-1">
              {menuLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => 
                    `px-4 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50 ${isActive ? "text-black bg-gray-50/50" : "text-gray-600 hover:text-black"}`
                  }
                  onClick={() => setOpen(false)}
                >
                  {t(lang, item.labelKey as any)}
                </NavLink>
              ))}
              <div className="h-px bg-gray-100 my-1 mx-2" />
              {user ? (
                <Button variant="outline" className="justify-center mt-1 w-full gap-2 rounded-xl border-red-100 text-red-500 hover:bg-red-50" onClick={handleLogout}>
                  Logout <LogOut size={16} />
                </Button>
              ) : (
                <Button as={Link} to="/admin" variant="primary" className="justify-center mt-1 w-full gap-2 rounded-xl" onClick={() => setOpen(false)}>
                  Login <ArrowUpRight size={16} />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Navbar;
