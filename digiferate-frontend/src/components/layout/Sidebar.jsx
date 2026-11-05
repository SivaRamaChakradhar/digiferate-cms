import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Monitor,
  PanelsTopLeft,
  Images,
  FileText,
  Wallpaper,
  Building2,
  Play,
  Settings,
  X,
} from "lucide-react";

const navigation = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "SCREEN MANAGEMENT",
    items: [
      { name: "Pair Screen", path: "/screens", icon: Monitor },
      { name: "Layout Editor", path: "/layout", icon: PanelsTopLeft },
      { name: "Playback Screen", path: "/playback", icon: Play },
    ],
  },
  {
    title: "CONTENT MANAGEMENT",
    items: [
      { name: "Content", path: "/content", icon: FileText },
      { name: "Media Library", path: "/media", icon: Images },
      { name: "Wallpapers", path: "/wallpapers", icon: Wallpaper },
      { name: "Facilities", path: "/facilities", icon: Building2 },
    ],
  },
  {
    title: "CONFIGURATION",
    items: [
      { name: "CV Configuration", path: "/cv-configuration", icon: Settings },
    ],
  },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold">
              D
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-wide">
                Digiferate
              </h1>
              <p className="text-xs text-slate-400">
                Digital Signage CMS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <p className="mb-3 px-3 text-[11px] font-semibold tracking-widest text-slate-500">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                          isActive
                            ? "bg-indigo-500/15 text-indigo-400"
                            : "text-slate-400 hover:bg-slate-900 hover:text-white"
                        }`
                      }
                    >
                      <Icon size={19} />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-5">
          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-sm font-medium">Digiferate CMS</p>
            <p className="mt-1 text-xs text-slate-500">
              Manage your digital experiences
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;