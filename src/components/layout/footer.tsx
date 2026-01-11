import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 px-6 py-8 bg-stone-50">
      <div className="max-w-3xl mx-auto">
        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
          <div>
            <h3 className="font-medium text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Surah
            </h3>
            <ul className="space-y-2 text-slate-500">
              <li>
                <Link href="/quran/1" className="hover:text-sky-600 transition-colors">
                  Al-Fatihah
                </Link>
              </li>
              <li>
                <Link href="/quran/2" className="hover:text-sky-600 transition-colors">
                  Al-Baqarah
                </Link>
              </li>
              <li>
                <Link href="/quran/36" className="hover:text-sky-600 transition-colors">
                  Yasin
                </Link>
              </li>
              <li>
                <Link href="/quran/55" className="hover:text-sky-600 transition-colors">
                  Ar-Rahman
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Ayat
            </h3>
            <ul className="space-y-2 text-slate-500">
              <li>
                <Link href="/quran/2/255" className="hover:text-sky-600 transition-colors">
                  Ayatul Kursi
                </Link>
              </li>
              <li>
                <Link href="/quran/2/286" className="hover:text-sky-600 transition-colors">
                  Al-Baqarah 286
                </Link>
              </li>
              <li>
                <Link href="/quran/3/190" className="hover:text-sky-600 transition-colors">
                  Ali Imran 190
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Juz Amma
            </h3>
            <ul className="space-y-2 text-slate-500">
              <li>
                <Link href="/quran/78" className="hover:text-sky-600 transition-colors">
                  An-Naba
                </Link>
              </li>
              <li>
                <Link href="/quran/112" className="hover:text-sky-600 transition-colors">
                  Al-Ikhlas
                </Link>
              </li>
              <li>
                <Link href="/quran/113" className="hover:text-sky-600 transition-colors">
                  Al-Falaq
                </Link>
              </li>
              <li>
                <Link href="/quran/114" className="hover:text-sky-600 transition-colors">
                  An-Nas
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Navigasi
            </h3>
            <ul className="space-y-2 text-slate-500">
              <li>
                <Link href="/quran" className="hover:text-sky-600 transition-colors">
                  Daftar Surah
                </Link>
              </li>
              <li>
                <Link href="/quran/search" className="hover:text-sky-600 transition-colors">
                  Cari Ayat
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-sky-600 transition-colors">
                  Asisten AI
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-stone-200 text-center">
          <p className="text-xs text-slate-400">
            Dibuat dengan{" "}
            <Heart className="w-3 h-3 inline text-sky-500" strokeWidth={1.5} /> untuk
            umat Islam Indonesia
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Data dari Quran.com API · Terjemahan Kemenag RI
          </p>
        </div>
      </div>
    </footer>
  );
}
