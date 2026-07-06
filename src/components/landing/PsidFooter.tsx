import Link from 'next/link';
import { PsidLogo } from './PsidLogo';

export function PsidFooter() {
  return (
    <footer className="psid-foot">
      <div className="wrap">
        <div className="fg">
          <div>
            <Link href="/" aria-label="PsyID home"><PsidLogo /></Link>
            <p className="fdesc">A personality passport for adults. Five axes, grounded in the ReNo v1.1 methodology.</p>
          </div>
          <div className="fcol">
            <h4>Explore</h4>
            <Link href="/#axes">The five axes</Link>
            <Link href="/#how">How it works</Link>
            <Link href="/#code">Your code</Link>
            <Link href="/#price">Pricing</Link>
          </div>
          <div className="fcol">
            <h4>Account</h4>
            <Link href="/reno">Take the test</Link>
            <Link href="/register">Create account</Link>
            <Link href="/login">Log in</Link>
            <Link href="/portal">Your passport</Link>
          </div>
          <div className="fcol">
            <h4>More</h4>
            <Link href="/methodology">The method</Link>
            <a href="mailto:hello@psyid.me">hello@psyid.me</a>
            <Link href="/admin/login">Admin login</Link>
          </div>
        </div>
        <div className="fbase">
          <span>© 2026 PsyID · psyid.me</span>
          <span>Privacy · Terms</span>
        </div>
      </div>
    </footer>
  );
}
