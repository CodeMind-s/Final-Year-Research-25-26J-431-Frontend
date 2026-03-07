interface SectionWrapperProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionWrapper({ id, children, className = "" }: SectionWrapperProps) {
  return (
    <section id={id} className={`py-16 md:py-20 lg:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
