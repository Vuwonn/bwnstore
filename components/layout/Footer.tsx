export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-2">📞 We're here to deliver your orders instantly</p>
        <p className="font-bold text-xl">NEX STORE</p>
        <div className="mt-4 flex justify-center space-x-4">
          <a href="#" className="hover:text-orange-400 transition">Facebook</a>
          <a href="#" className="hover:text-orange-400 transition">Instagram</a>
          <a href="#" className="hover:text-orange-400 transition">WhatsApp</a>
        </div>
      </div>
    </footer>
  )
}