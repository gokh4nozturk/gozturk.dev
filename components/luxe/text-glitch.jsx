export function TextGlitch({ children }) {
  return (
    <div className="group relative overflow-hidden font-medium">
      <span className="invisible">{children}</span>
      <span className="absolute top-0 left-0 text-p3-text-light transition-transform duration-500 ease-in-out hover:duration-300 group-hover:-translate-y-full dark:text-p3-text-light">
        {children}
      </span>
      <span className="absolute top-0 left-0 translate-y-full text-p3-text-light transition-transform duration-500 ease-in-out hover:duration-300 group-hover:translate-y-0 dark:text-p3-text-light">
        {children}
      </span>
    </div>
  );
}
