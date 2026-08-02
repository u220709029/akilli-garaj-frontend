import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Dashboard() {
  // Temel State'ler
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bakım Geçmişi Çekmecesi (Drawer) State'leri
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

// Bakım Modalı Kontrol State'leri
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isMaintenanceSubmitting, setIsMaintenanceSubmitting] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({
    description: '',
    cost: '',
    type: 'PERIODIC', // Enum default değeri
    odometerAtMaintenance: '',
    maintenanceDate: new Date().toISOString().split('T')[0] // Varsayılan olarak bugün
  });

  // Modal ve İşlem State'leri
  const [activeModal, setActiveModal] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State'leri
 const [fuelData, setFuelData] = useState({ 
  liters: '', 
  pricePerLiter: '', // totalCost yerine bu geldi
  odometerAtFill: '', 
  isFullTank: true,  // Yeni eklendi
  fillDate: new Date().toISOString().split('T')[0] // Yeni eklendi (YYYY-MM-DD formatında bugün)
});
  

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = () => {
    setIsLoading(true);
    setError(null);
    axios.get('http://localhost:8080/api/v1/vehicles/user/1')
      .then(response => {
        setVehicles(response.data);
      })
      .catch(err => {
        console.error("Veri çekme hatası:", err);
        setError("Araç bilgileri yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edin.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const openModal = (type, vehicle) => {
    setSelectedVehicle(vehicle);
    setActiveModal(type);
    document.body.style.overflow = 'hidden'; // Modal açıldığında arka plan kaydırmasını engelle
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedVehicle(null);
    setFuelData({ liters: '', totalCost: '', odometerAtFill: '' });
    document.body.style.overflow = 'auto'; // Kaydırmayı geri aç
  };

const handleFuelSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Spring Boot FuelRecordCreateRequest DTO'su ile birebir eşleşen payload
    const payload = {
      vehicleId: selectedVehicle.id,
      liters: parseFloat(fuelData.liters),
      pricePerLiter: parseFloat(fuelData.pricePerLiter),
      odometerAtFill: parseInt(fuelData.odometerAtFill),
      isFullTank: fuelData.isFullTank,
      fillDate: fuelData.fillDate
    };

    axios.post('http://localhost:8080/api/v1/fuels', payload)
      .then(() => {
        closeModal();
        fetchVehicles(); // Tabloyu güncelle
      })
      .catch(err => {
        // Backend'den özel 'message' geldiyse onu al, yoksa varsayılan metni kullan
        const errorMessage = err.response?.data?.message || "Yakıt verisi kaydedilirken sistemsel bir hata oluştu.";
        
        // Console'a yine yazdıralım ama kullanıcıya backend'in cevabını gösterelim
        console.error("Backend Hatası:", err.response?.data || err.message);
        alert(`Kayıt Başarısız: ${errorMessage}`);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const handleMaintenanceSubmit = (e) => {
    e.preventDefault();
    setIsMaintenanceSubmitting(true);

    // Spring Boot MaintenanceCreateRequest DTO'su ile birebir eşleşen payload
    // Spring Boot MaintenanceCreateRequest DTO'su ile birebir eşleşen payload
    const payload = {
      vehicleId: selectedVehicle.id,
      description: maintenanceData.description,
      cost: parseFloat(maintenanceData.cost),
      type: maintenanceData.type,
      odometerAtMaintenance: parseInt(maintenanceData.odometerAtMaintenance),
      recordDate: maintenanceData.maintenanceDate // <--- 'maintenanceDate' yerine 'recordDate' YAPTIK
    };

    axios.post('http://localhost:8080/api/v1/maintenances', payload)
      .then(() => {
        setIsMaintenanceModalOpen(false); // Modalı kapat
        // Formu temizle
        setMaintenanceData({
          description: '',
          cost: '',
          type: 'PERIODIC',
          odometerAtMaintenance: '',
          maintenanceDate: new Date().toISOString().split('T')[0]
        });
        fetchVehicles(); // Araç kilometresini güncel tutmak için garajı yenile
        alert("Bakım/Sanayi kaydı başarıyla veritabanına işlendi!");
      })
      .catch(err => {
        console.error("Bakım Backend Hatası:", err.response?.data || err.message);
        const errorMsg = err.response?.data?.message || "Bakım kaydı girilirken bir hata oluştu.";
        alert(`Kayıt Başarısız: ${errorMsg}`);
      })
      .finally(() => {
        setIsMaintenanceSubmitting(false);
      });
  };
  const fetchMaintenanceHistory = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsHistoryDrawerOpen(true);
    setIsHistoryLoading(true);

    axios.get(`http://localhost:8080/api/v1/maintenances/vehicle/${vehicle.id}`)
      .then((res) => {
        setMaintenanceHistory(res.data);
      })
      .catch((err) => {
        console.error("Bakım geçmişi çekilirken hata:", err);
        alert("Bakım geçmişi yüklenemedi.");
      })
      .finally(() => {
        setIsHistoryLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Premium Üst Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <span className="font-black text-lg tracking-tight text-slate-100">AkıllıGaraj</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-400">Kullanıcı</p>
              <p className="text-sm font-bold text-slate-200">Hakan</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 shadow-inner">H</div>
          </div>
        </div>
      </header>

      {/* Ana Gövde */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Karşılama Paneli */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Garaj Kontrol Paneli</h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base max-w-xl">Mühendislik standartlarında araç, yakıt ve bakım takip otomasyonu.</p>
          </div>
          <Link to="/add-vehicle" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Yeni Araç Ekle
          </Link>
        </div>

        {/* Hızlı Analitik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Toplam Araç</p>
              <p className="text-2xl font-black text-white mt-0.5">{vehicles.length}</p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sistem Durumu</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">Çevrimiçi</p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm12 0v-3a2 2 0 00-2-2h-2a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2zm0 0v-7a2 2 0 00-2-2h-2a2 2 0 00-2 2v9a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Veritabanı</p>
              <p className="text-2xl font-black text-white mt-0.5">Bağlı</p>
            </div>
          </div>
        </div>

        {/* Dinamik İçerik Alanı (Yükleniyor, Hata, Boş, Veri) */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="font-medium text-lg">Araç verileri senkronize ediliyor...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-medium mb-4">{error}</p>
            <button onClick={fetchVehicles} className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg font-semibold hover:bg-red-500/30 transition-colors">Tekrar Dene</button>
          </div>
        ) : vehicles.length === 0 ? (
           <div className="bg-slate-900/30 border border-dashed border-slate-700 rounded-3xl p-12 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
               <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" /></svg>
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">Henüz araç eklenmemiş</h3>
             <p className="text-slate-400 mb-6 max-w-md">Garajınız şu an boş görünüyor. Yakıt ve bakım takibi yapabilmek için hemen ilk aracınızı sisteme kaydedin.</p>
             <Link to="/add-vehicle" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20">Araç Ekle</Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
                {/* Yarı saydam arka plan efekti */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-600/10 transition-colors pointer-events-none"></div>
                
                {/* Üst Kart Alanı */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center rounded-lg overflow-hidden border border-slate-700 shadow-md font-sans font-bold bg-slate-950 select-none">
                    <div className="bg-indigo-600 text-white text-[10px] px-2 py-3 flex flex-col justify-end items-center font-black">
                      <span>TR</span>
                    </div>
                    <div className="text-slate-100 px-4 text-lg tracking-widest font-extrabold py-1.5">
                      {vehicle.licensePlate}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                    {vehicle.productionYear} MODEL
                  </span>
                </div>

                {/* Marka ve Model */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                    {vehicle.brand} <span className="text-slate-400 font-medium ml-1">{vehicle.model}</span>
                  </h3>
                  
                  <div className="mt-2">
                    <Link 
                      to={`/vehicle/${vehicle.id}`} 
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group/link"
                    >
                      Araç Analiz Raporunu Gör 
                      <svg className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Kilometre Bilgisi */}
                <div className="mt-5 bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4 flex items-center justify-between relative z-10">
                  <span className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Güncel Kilometre
                  </span>
                  <span className="text-lg font-black text-slate-200 tracking-wide">
                    {vehicle.currentOdometer?.toLocaleString('tr-TR')} <span className="text-xs font-medium text-slate-500">km</span>
                  </span>
                </div>

                {/* Aksiyon Butonları */}
                <div className="mt-6 grid grid-cols-2 gap-4 relative z-10">
                  <button 
                    onClick={() => openModal('fuel', vehicle)}
                    className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-300 hover:text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-indigo-400 text-lg">⛽</span> Yakıt Gir
                  </button>
                  
                  {/* Butonlar Grubu (Mevcut Bakım Ekle butonunun yanına ekle) */}
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => { setSelectedVehicle(vehicle); setIsMaintenanceModalOpen(true); }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl transition-all text-xs border border-slate-700/50"
                  >
                    🔧 Bakım Ekle
                  </button>
                  
                  {/* YENİ EKLENEN BUTON */}
                  <button 
                    onClick={() => fetchMaintenanceHistory(vehicle)}
                    className="flex-1 bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 font-bold py-2.5 px-4 rounded-xl transition-all text-xs border border-indigo-700/50"
                  >
                    📜 Geçmişi Gör
                  </button>
                </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* YAKIT MODALI */}
      {activeModal === 'fuel' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl shadow-indigo-900/20 transform transition-all">
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">⛽</span> Yakıt Verisi Girişi
              </h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-200 font-bold text-2xl transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800">&times;</button>
            </div>
            
<form onSubmit={handleFuelSubmit} className="p-6 space-y-5">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 font-bold">TR</div>
                 <div>
                   <p className="text-xs text-slate-400">Seçili Araç</p>
                   <p className="font-bold text-white">{selectedVehicle?.licensePlate} <span className="text-slate-400 font-normal">- {selectedVehicle?.brand}</span></p>
                 </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Alınan Yakıt</label>
                    <div className="relative">
                      <input type="number" step="0.01" required value={fuelData.liters} onChange={(e) => setFuelData({...fuelData, liters: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium placeholder-slate-600" placeholder="42.15" />
                      <span className="absolute right-4 top-3.5 text-slate-500 font-medium">LT</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Birim Fiyat</label>
                    <div className="relative">
                      <input type="number" step="0.01" required value={fuelData.pricePerLiter} onChange={(e) => setFuelData({...fuelData, pricePerLiter: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium placeholder-slate-600" placeholder="39.50" />
                      <span className="absolute right-4 top-3.5 text-slate-500 font-medium">TL</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Güncel KM</label>
                    <input type="number" required value={fuelData.odometerAtFill} onChange={(e) => setFuelData({...fuelData, odometerAtFill: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium placeholder-slate-600" placeholder={`Örn: ${selectedVehicle?.currentOdometer || 120000}`} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Alım Tarihi</label>
                    <input type="date" required value={fuelData.fillDate} onChange={(e) => setFuelData({...fuelData, fillDate: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium [color-scheme:dark]" />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-4 rounded-xl mt-2 cursor-pointer" onClick={() => setFuelData({...fuelData, isFullTank: !fuelData.isFullTank})}>
                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${fuelData.isFullTank ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 bg-transparent'}`}>
                    {fuelData.isFullTank && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="select-none">
                    <p className="text-sm font-bold text-white">Depo tam dolduruldu mu?</p>
                    <p className="text-xs text-slate-400">Yakıt tüketimi hesaplamaları için önemlidir.</p>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex justify-center items-center gap-2 mt-4">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Kaydediliyor...
                  </>
                ) : 'Veritabanına İşle'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BAKIM EKLEME MODALI */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
            
            {/* Modal Başlığı */}
            <div className="px-6 py-5 border-b border-slate-800/60 flex justify-between items-center bg-slate-950/20">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>🔧</span> Yeni Bakım / Sanayi Kaydı
              </h2>
              <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-slate-500 hover:text-white transition-colors text-xl">✕</button>
            </div>

            {/* Form Alanı */}
            <form onSubmit={handleMaintenanceSubmit} className="p-6 space-y-5">
              
              {/* Seçili Araç Bilgisi */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 font-bold">TR</div>
                <div>
                  <p className="text-xs text-slate-400">Seçili Araç</p>
                  <p className="font-bold text-white">{selectedVehicle?.licensePlate} <span className="text-slate-400 font-normal">- {selectedVehicle?.brand}</span></p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Bakım Türü (Enum Seçimi) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Bakım / Onarım Türü</label>
                  <select 
                    value={maintenanceData.type} 
                    onChange={(e) => setMaintenanceData({...maintenanceData, type: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium"
                  >
                    <option value="PERIODIC">Periyodik Bakım (Yağ, Filtre vb.)</option>
                    <option value="HEAVY">Ağır Bakım (Triger, Baskı Balata vb.)</option>
                    <option value="REPAIR">Arıza Onarım / Tamirat</option>
                    <option value="BODYWORK">Kaporta / Boya / Estetik</option>
                    <option value="TYRE">Lastik / Rot-Balans</option>
                  </select>
                </div>

                {/* Açıklama */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Yapılan İşlemler (Açıklama)</label>
                  <textarea 
                    required
                    rows="2"
                    value={maintenanceData.description} 
                    onChange={(e) => setMaintenanceData({...maintenanceData, description: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium placeholder-slate-600 resize-none" 
                    placeholder="Örn: 10.000 km bakımı yapıldı. Motor yağı, hava ve polen filtreleri Castrol marka ile değiştirildi." 
                  />
                </div>
                
                {/* Maliyet ve Kilometre */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Toplam Toplam Maliyet</label>
                    <div className="relative">
                      <input type="number" step="0.01" required value={maintenanceData.cost} onChange={(e) => setMaintenanceData({...maintenanceData, cost: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium placeholder-slate-600" placeholder="4500" />
                      <span className="absolute right-4 top-3.5 text-slate-500 font-medium">TL</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Bakım Kilometresi</label>
                    <input type="number" required value={maintenanceData.odometerAtMaintenance} onChange={(e) => setMaintenanceData({...maintenanceData, odometerAtMaintenance: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium placeholder-slate-600" placeholder={`Örn: ${selectedVehicle?.currentOdometer || 222222}`} />
                  </div>
                </div>

                {/* Bakım Tarihi */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Bakım Tarihi</label>
                  <input type="date" required value={maintenanceData.maintenanceDate} onChange={(e) => setMaintenanceData({...maintenanceData, maintenanceDate: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium [color-scheme:dark]" />
                </div>
              </div>

              {/* Gönder Butonu */}
              <button type="submit" disabled={isMaintenanceSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex justify-center items-center gap-2 mt-4">
                {isMaintenanceSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Servis Fişi İşleniyor...
                  </>
                ) : 'Bakım Kaydını Tamamla'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* BAKIM GEÇMİŞİ ÇEKMECESİ (DRAWER) */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Arka plan karartması (Tıklayınca kapanması için) */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsHistoryDrawerOpen(false)}
          ></div>

          {/* Sağdan Kayan Panel */}
          <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col transform transition-transform duration-300">
            
            {/* Header (Başlık) */}
            <div className="px-6 py-5 border-b border-slate-800/60 flex justify-between items-center bg-slate-950/40">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>📜</span> Bakım Geçmişi
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {selectedVehicle?.licensePlate} <span className="opacity-50">|</span> {selectedVehicle?.brand}
                </p>
              </div>
              <button onClick={() => setIsHistoryDrawerOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg">✕</button>
            </div>

            {/* İçerik (Timeline - Zaman Çizelgesi) */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {isHistoryLoading ? (
                <div className="flex justify-center items-center h-40">
                  <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
              ) : !Array.isArray(maintenanceHistory) || maintenanceHistory.length === 0 ? (
                <div className="text-center text-slate-500 mt-10 bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50">
                  <span className="text-4xl block mb-3 opacity-50">📭</span>
                  <p className="font-medium text-sm">Bu araca ait henüz bir bakım kaydı bulunmuyor.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-700/50 ml-3 space-y-8 pb-10">
                  {maintenanceHistory.map((record, index) => (
                    <div key={record?.id || index} className="relative pl-6">
                      {/* Timeline Noktası */}
                      <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-slate-900 shadow-lg shadow-indigo-500/20"></span>
                      
                      {/* Kayıt Kartı */}
                      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 transition-all hover:bg-slate-800/60 hover:border-slate-600/80 hover:shadow-lg">
                        <div className="flex justify-between items-start mb-3">
                          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {record?.type === 'PERIODIC' ? 'Periyodik' : record?.type === 'HEAVY' ? 'Ağır Bakım' : record?.type === 'REPAIR' ? 'Onarım' : (record?.type || 'Bakım')}
                          </span>
                          <span className="text-xs font-bold text-slate-400 bg-slate-950/50 px-2 py-1 rounded">
                            {record?.recordDate || record?.maintenanceDate || record?.date || 'Tarih Yok'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-200 mb-4 leading-relaxed font-medium">
                          {record?.description || 'Açıklama detayı bulunmuyor.'}
                        </p>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded-md">
                            <span>⏱️</span> {record?.odometerAtMaintenance ? record.odometerAtMaintenance.toLocaleString('tr-TR') : (record?.odometer || '---')} km
                          </span>
                          <span className="text-sm font-black text-emerald-400 drop-shadow-md">
                            {record?.cost || '0'} TL
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default Dashboard;