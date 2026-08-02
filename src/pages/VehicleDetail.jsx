import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function VehicleDetail() {
  const { id } = useParams(); // URL'deki araç ID'sini yakalar (/vehicle/1)
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicleSummary();
  }, [id]);

  const fetchVehicleSummary = () => {
    setIsLoading(true);
    setError(null);
    axios.get(`http://localhost:8080/api/v1/fuels/vehicle/${id}/summary`)
      .then(response => {
        setSummary(response.data);
      })
      .catch(err => {
        console.error("Özet veri çekme hatası:", err);
        setError("Araç yakıt istatistikleri yüklenirken bir hata oluştu.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="font-medium text-slate-400">Mühendislik metrikleri hesaplanıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md">
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button onClick={fetchVehicleSummary} className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg font-semibold hover:bg-red-500/30 transition-colors">Yeniden Dene</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Üst Navigasyon Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h10" /></svg>
            Garaja Dön
          </Link>
          <span className="font-black tracking-tight text-slate-400">Araç Analitikleri</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Başlık Alanı */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Yakıt Analiz Raporu</h1>
          <p className="text-slate-400 mt-1 text-sm">Veritabanından çekilen son iki full depo verisiyle hesaplanan reel tüketim değerleri.</p>
        </div>

        {/* METRİK KARTLARI (Mühendislik Hesaplamaları) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          
          {/* Ortalama Tüketim */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl"></div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ortalama Tüketim</p>
            <p className="text-3xl font-black text-indigo-400 mt-2">
              {summary.averageConsumption > 0 ? `${summary.averageConsumption}` : '0.00'} 
              <span className="text-sm font-medium text-slate-500 ml-1">L/100km</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">Son iki full depo arasındaki mesafe baz alınmıştır.</p>
          </div>

          {/* Kilometre Başı Maliyet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-2xl"></div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">KM Başına Maliyet</p>
            <p className="text-3xl font-black text-emerald-400 mt-2">
              {summary.costPerKm > 0 ? `${summary.costPerKm}` : '0.00'} 
              <span className="text-sm font-medium text-slate-500 ml-1">TL/km</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">Son yakıt alım maliyetinin yapılan mesafeye oranı.</p>
          </div>

          {/* Yapılan Mesafe */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/5 rounded-full blur-2xl"></div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ölçülen Son Mesafe</p>
            <p className="text-3xl font-black text-amber-400 mt-2">
              {summary.totalDistance?.toLocaleString('tr-TR')} 
              <span className="text-sm font-medium text-slate-500 ml-1">km</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">İki yakıt alımı arasında kat edilen net yol.</p>
          </div>

          {/* Toplam Harcama */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/5 rounded-full blur-2xl"></div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Toplam Yakıt Harcaması</p>
            <p className="text-3xl font-black text-rose-400 mt-2">
              {summary.totalSpent?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} 
              <span className="text-sm font-medium text-slate-500 ml-1">TL</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">Sistemdeki tüm fişlerin kümülatif toplamı.</p>
          </div>
        </div>

        {/* GEÇMİŞ FİŞLERİN TABLOSU */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <span>📋</span> Geçmiş Yakıt Fişleri Kayıtları
            </h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-semibold">
              {summary.fuelRecords?.length || 0} Fiş Bulundu
            </span>
          </div>

          {summary.fuelRecords?.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              Bu araca ait henüz yakıt fişi girilmemiş.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-950/20">
                    <th className="py-4 px-6">Tarih</th>
                    <th className="py-4 px-6">Dolum Kilometresi</th>
                    <th className="py-4 px-6">Alınan Miktar</th>
                    <th className="py-4 px-6">Litre Fiyatı</th>
                    <th className="py-4 px-6">Toplam Tutar</th>
                    <th className="py-4 px-6">Depo Durumu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm font-medium text-slate-300">
                  {summary.fuelRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(record.fillDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-200">
                        {record.odometerAtFill?.toLocaleString('tr-TR')} km
                      </td>
                      <td className="py-4 px-6 text-indigo-400">
                        {record.liters} LT
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {record.pricePerLiter?.toFixed(2)} TL
                      </td>
                      <td className="py-4 px-6 font-bold text-white">
                        {record.totalCost?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                      </td>
                      <td className="py-4 px-6">
                        {record.isFullTank ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Full Depo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Kısmi Dolum
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default VehicleDetail;