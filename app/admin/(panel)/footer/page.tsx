import FooterManager from './FooterManager';

export default function FooterAdminPage() {
  return (
    <section>
      <h1 className="text-2xl font-extrabold">Footer</h1>
      <p className="mt-1 text-sm text-[#3F4945]">
        Satu data footer untuk seluruh beranda. Atribusi peta OpenStreetMap tampil otomatis dan tidak bisa dihapus dari sini.
      </p>
      <div className="mt-6">
        <FooterManager />
      </div>
    </section>
  );
}
