function WizardStep({ title, subtitle, children }) {
  return (
    <section className="panel p-6 md:p-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">{subtitle}</p>
        <h2 className="mt-2 font-display text-3xl text-maroon">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default WizardStep;
