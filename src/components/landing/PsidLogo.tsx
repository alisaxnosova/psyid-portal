export function PsidLogo({ white = false }: { white?: boolean }) {
  return (
    <span className={`brand-mark${white ? ' white' : ''}`} data-size="md">
      <span className="mk">
        <svg viewBox="0 0 100 100">
          <polygon points="50,16 84,40 71,79 29,79 16,40" fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="3.5" />
          <circle cx="50" cy="16" r="8.5" fill="#2244E0" />
          <circle cx="84" cy="40" r="8.5" fill="#6A85F0" />
          <circle cx="71" cy="79" r="8.5" fill="#8A5CD6" />
          <circle cx="29" cy="79" r="8.5" fill="#FF7A3D" />
          <circle cx="16" cy="40" r="8.5" fill="#FF5A5A" />
        </svg>
      </span>
      <span className="wm">Psy<i>ID</i></span>
    </span>
  );
}
