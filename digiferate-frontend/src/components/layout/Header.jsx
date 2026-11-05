import { Menu, Bell, Search, ChevronDown } from "lucide-react";

function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Welcome to Digiferate
          </h2>
          <p className="hidden text-xs text-slate-500 sm:block">
            Manage your digital signage from one place
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:block">
          <Search size={20} />
        </button>

        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <button className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
            A
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-700">
              Admin
            </p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-slate-400 sm:block"
          />
        </button>
      </div>
    </header>
  );
}

export default Header;