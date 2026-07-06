'use client';

import Link from 'next/link';
import { useAuth, logout } from '@/lib/useAuth';
import { PsidLogo } from './PsidLogo';

export function PsidNav() {
  const { isLoggedIn } = useAuth();
  return (
    <nav className="psid-nav">
      <div className="wrap row">
        <Link href="/" aria-label="PsyID home"><PsidLogo white /></Link>
        <div className="links">
          <Link href="/#axes">The five axes</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/methodology">Method</Link>
          <Link href="/#price">Pricing</Link>
        </div>
        <div className="right">
          {isLoggedIn ? (
            <>
              <Link className="navlink" href="/portal">Your passport</Link>
              <button className="btn btn-ghost-white sm" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="navlink" href="/login">Log in</Link>
              <Link className="btn btn-orange sm" href="/reno">Begin →</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
