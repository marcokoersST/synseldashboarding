export function WelcomeHeader() {
  const currentDate = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-foreground">
        Welkom terug, <span className="text-primary">Jouw naam</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-1 capitalize">{currentDate}</p>
    </div>
  );
}
