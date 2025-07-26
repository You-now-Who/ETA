import Link from 'next/link';

function NavItem({ href, children, isActive }) {
  return (
    <Link 
      href={href}
      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
        isActive 
          ? 'bg-gray-100 text-gray-900' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            TimeCalibr
          </Link>
          
          <nav className="flex items-center space-x-1">
            <NavItem href="/predict">Predict</NavItem>
            <NavItem href="/log">Log</NavItem>
            <NavItem href="/dashboard">Dashboard</NavItem>
          </nav>
        </div>
      </div>
    </header>
  );
}
