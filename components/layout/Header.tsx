"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, Briefcase, CreditCard, Users, Settings } from "lucide-react";

interface AppUser {
  id: string
  name: string
  email: string
  credit?: number
  isAdmin?: boolean
  // Add any other properties your user object has
  [key: string]: unknown // Use unknown instead of any
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
const [user, setUser] = useState<AppUser | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Check login status on component mount
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const userData = JSON.parse(userStr);
            setIsLoggedIn(true);
            setUser(userData);
          } catch (err) {
            console.error('Error parsing user data:', err);
            setIsLoggedIn(false);
            setUser(null);
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    };

    checkAuth();
    
    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setDropdownOpen(false);
    setIsMenuOpen(false);
    window.location.href = '/';
  };

  // Separate navigation links component
  const PublicNavLinks = () => (
    <>
      <Link
        href="/about-us"
        className="block px-4 py-2 hover:bg-gray-50 hover:text-kwontum-darkRed transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        About Us
      </Link>
      <Link
        href="/#contact"
        className="block px-4 py-2 hover:bg-gray-50 hover:text-kwontum-darkRed transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        Contact Us
      </Link>
      <Link
        href="/about-us/coaches"
        className="block px-4 py-2 hover:bg-gray-50 hover:text-kwontum-darkRed transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        Meet Our Coaches
      </Link>
    </>
  );

  const DesktopNavLinks = () => (
    <>
      <Link
        href="/about-us"
        className="nav-link hover:text-brand-secondary hover:scale-105 transition-colors duration-100"
      >
        About Us
      </Link>
      <Link
        href="/#contact"
        className="nav-link hover:text-brand-secondary hover:scale-105 transition-colors duration-100"
      >
        Contact Us
      </Link>
      <Link
        href="/about-us/coaches"
        className="nav-link hover:text-brand-secondary hover:scale-105 transition-colors duration-100"
      >
        Meet Our Coaches
      </Link>
    </>
  );

  return (
    <header className="flex items-center justify-between py-5 px-5 sm:px-0 bg-transparent">
      {/* Logo */}
      <div className="bg-white p-2 rounded-md">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/img/logo.png"
            alt="Logo"
            width={150}
            height={80}
            priority
            style={{
              filter: "invert(0)",
              color: "white",
            }}
          />
        </Link>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden flex items-center gap-4">
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{user?.name?.split(' ')[0] || 'User'}</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <div className="py-1">
                  <Link
                    href="/jobs"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => { setDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <Briefcase className="h-4 w-4" />
                    Jobs
                  </Link>
                  <Link
                    href="/credits"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => { setDropdownOpen(false); setIsMenuOpen(false); }}
                  >
                    <CreditCard className="h-4 w-4" />
                    My Credits
                  </Link>
                  {user?.isAdmin && (
                    <>
                      <div className="border-t my-1"></div>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => { setDropdownOpen(false); setIsMenuOpen(false); }}
                      >
                        <Settings className="h-4 w-4" />
                        Admin Panel
                      </Link>
                      <Link
                        href="/admin/jobs"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-blue-600"
                        onClick={() => { setDropdownOpen(false); setIsMenuOpen(false); }}
                      >
                        <Briefcase className="h-4 w-4" />
                        Manage Jobs
                      </Link>
                      <Link
                        href="/admin/users"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-blue-600"
                        onClick={() => { setDropdownOpen(false); setIsMenuOpen(false); }}
                      >
                        <Users className="h-4 w-4" />
                        Manage Users
                      </Link>
                      <Link
                        href="/admin/jobs/create"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-green-600"
                        onClick={() => { setDropdownOpen(false); setIsMenuOpen(false); }}
                      >
                        <Briefcase className="h-4 w-4" />
                        + Create Job
                      </Link>
                    </>
                  )}
                  <div className="border-t my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-50 overflow-y-auto">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="bg-white p-2 rounded-md">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  <Image
                    src="/img/logo.png"
                    alt="Logo"
                    width={120}
                    height={64}
                    style={{
                      filter: "invert(0)",
                      color: "white",
                    }}
                  />
                </Link>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User Info (if logged in) */}
            {isLoggedIn && user && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="font-bold text-kwontum-darkRed">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
                {user?.isAdmin && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                    Admin
                  </span>
                )}
              </div>
            )}

            {/* Navigation Links */}
            <nav className="mb-8">
              <div className="space-y-1">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/jobs"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Briefcase className="h-5 w-5 text-gray-600" />
                      <span>Jobs</span>
                    </Link>
                    <Link
                      href="/credits"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <span>My Credits</span>
                    </Link>

                    {user?.isAdmin && (
                      <>
                        <div className="pt-2 mt-2 border-t">
                          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Admin Tools
                          </p>
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="h-5 w-5 text-blue-600" />
                            <span>Admin Panel</span>
                          </Link>
                          <Link
                            href="/admin/jobs"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            <span>Manage Jobs</span>
                          </Link>
                          <Link
                            href="/admin/users"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Users className="h-5 w-5 text-blue-600" />
                            <span>Manage Users</span>
                          </Link>
                          <Link
                            href="/admin/jobs/create"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-green-600"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Briefcase className="h-5 w-5" />
                            <span>+ Create Job</span>
                          </Link>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <PublicNavLinks />
                )}
              </div>
            </nav>

            {/* Public Navigation Links (always visible) */}
            <div className="mb-8">
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Explore Kwontum
              </p>
              <div className="space-y-1">
                <PublicNavLinks />
              </div>
            </div>

            {/* Logout button (if logged in) */}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            )}

            {/* Login/Register links (if not logged in) */}
            {!isLoggedIn && (
              <div className="mt-8 pt-6 border-t">
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="block w-full text-center px-4 py-3 bg-kwontum-darkRed text-white rounded-lg hover:bg-[#5a1219] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <p className="text-center text-sm text-gray-600">
                    Admin accounts: Contact system administrator
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8 font-[550] font-dolceVita">
        {/* Always show these links */}
        <DesktopNavLinks />
        
        {/* Auth section - only show when logged in */}
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">{user?.name?.split(' ')[0] || 'User'}</span>
                {user?.isAdmin && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                    Admin
                  </span>
                )}
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
                  {/* User Info Section */}
                  {user && (
                    <div className="p-3 border-b bg-gray-50">
                      <p className="font-bold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                      {user?.credit !== undefined && (
                        <div className="mt-2 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            Credits: {user?.credit || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="py-1">
                    <Link
                      href="/jobs"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Briefcase className="h-4 w-4" />
                      Jobs Dashboard
                    </Link>
                    <Link
                      href="/credits"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <CreditCard className="h-4 w-4" />
                      My Credits & History
                    </Link>
                    
                    {user?.isAdmin && (
                      <>
                        <div className="border-t my-1"></div>
                        <Link
                          href="/admin/users"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-blue-600"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Users className="h-4 w-4" />
                          Manage Users
                        </Link>
                        <Link
                          href="/admin/jobs/create"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-green-600"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Briefcase className="h-4 w-4" />
                          + Create Job
                        </Link>
                      </>
                    )}
                    
                    <div className="border-t my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}