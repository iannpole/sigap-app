import FiturManager from './FiturManager';

export default function BerandaAdminPage() {
  return (
    <section>
      <h1 className="text-2xl font-extrabold">Fitur beranda</h1>
      <p className="mt-1 text-sm text-[#3F4945]">
        Tampilkan 4 sampai 6 fitur aktif. Deskripsi cukup satu kalimat.
      </p>
      <div className="mt-6">
        <FiturManager />
      </div>
    </section>
  );
}
