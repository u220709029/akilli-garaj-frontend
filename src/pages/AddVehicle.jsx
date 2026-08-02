import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function AddVehicle() {
  const navigate = useNavigate() // Kayıt başarılı olunca anasayfaya dönmek için

  // Formdaki girdileri tutacağımız hafıza (State)
  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    productionYear: '',
    currentOdometer: ''
  })

  // Kullanıcı inputlara yazı yazdıkça hafızayı güncelleyen fonksiyon
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // "Kaydet" butonuna basıldığında çalışacak fonksiyon
  const handleSubmit = (e) => {
    e.preventDefault() // Sayfanın yenilenmesini engeller

    // ID'si 1 olan kullanıcıya aracı ekliyoruz
    axios.post('http://localhost:8080/api/v1/vehicles/user/1', formData)
      .then(() => {
        alert("Araç başarıyla garaja eklendi!")
        navigate('/') // İşlem bitince Dashboard'a geri dön
      })
      .catch(error => {
        alert("Hata oluştu! Backend validasyonlarını kontrol edin.")
        console.error(error)
      })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-blue-600">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-slate-800">Yeni Araç Ekle</h2>
          <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 underline">İptal</Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Plaka</label>
            <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} 
                   className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                   placeholder="Örn: 34 ABC 123" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Marka</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} 
                     className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                     placeholder="Örn: Renault" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Model</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} 
                     className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                     placeholder="Örn: Megane 1" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Üretim Yılı</label>
              <input type="number" name="productionYear" value={formData.productionYear} onChange={handleChange} 
                     className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                     placeholder="Örn: 2001" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Güncel Kilometre</label>
              <input type="number" name="currentOdometer" value={formData.currentOdometer} onChange={handleChange} 
                     className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                     placeholder="Örn: 245000" required />
            </div>
          </div>

          <button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded shadow-lg transition-colors">
            Garaja Kaydet
          </button>
        </form>

      </div>
    </div>
  )
}

export default AddVehicle