export default function NoAccess() {
  return (
    <div className="rounded-kort border-2 border-streg bg-kort px-4 py-6">
      <h1 className="font-display text-2xl text-ketchup">IKKE HELT ENDNU</h1>
      <p className="mt-2">
        Du er logget ind, men din konto har ikke adgang til dashboardet. Snart kan du indsende
        anmeldelser herfra.
      </p>
    </div>
  );
}
