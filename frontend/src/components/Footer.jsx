export default function Footer() {
  return <footer className="mt-20 border-t border-slate-200 bg-white">
    <div className="container-page grid gap-8 py-12 sm:grid-cols-3">
      <div><div className="text-xl font-black">Vanshi<span className="text-brand-600">Cart</span></div><p className="mt-2 text-sm text-slate-500">A modern grocery shopping platform built with React and FastAPI.</p></div>
      <div><h3 className="font-bold">Shop</h3><p className="mt-3 text-sm text-slate-500">Fresh groceries, everyday essentials and smart shopping.</p></div>
      <div><h3 className="font-bold">Project</h3><p className="mt-3 text-sm text-slate-500">Portfolio project demonstrating REST APIs, authentication, database design and responsive UI.</p></div>
    </div>
    <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} VanshiCart</div>
  </footer>;
}