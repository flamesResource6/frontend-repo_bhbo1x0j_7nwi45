import { useEffect, useMemo, useState } from 'react'
import { api } from './components/api'
import { Star, MapPin, PlusCircle, LogIn, User, Search, Tag, Handshake } from 'lucide-react'

function Field({ label, children }) {
  return (
    <label className="block text-sm mb-3">
      <span className="block text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  )
}

function AuthSection({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [campus, setCampus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let res
      if (mode === 'signup') {
        res = await api.signup({ name, email, password, campus })
      } else {
        res = await api.login({ email, password })
      }
      onAuthed(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border w-full max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <LogIn className="w-5 h-5 text-blue-600"/>
        <h2 className="text-xl font-semibold">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'signup' && (
          <Field label="Name">
            <input className="w-full border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} required/>
          </Field>
        )}
        <Field label="Email">
          <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </Field>
        <Field label="Password">
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} required/>
        </Field>
        {mode === 'signup' && (
          <Field label="Campus / College">
            <input className="w-full border rounded px-3 py-2" value={campus} onChange={e=>setCampus(e.target.value)} />
          </Field>
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 flex items-center justify-center gap-2">
          {loading ? 'Please wait...' : (mode === 'signup' ? 'Sign up' : 'Log in')}
        </button>
      </form>
      <p className="text-xs text-center mt-3">
        {mode === 'signup' ? 'Already have an account?' : "New here?"}
        <button className="text-blue-600 ml-1" onClick={()=>setMode(mode==='signup'?'login':'signup')}>
          {mode === 'signup' ? 'Log in' : 'Create one'}
        </button>
      </p>
    </div>
  )
}

function Header({ user, onLogout }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Handshake className="w-6 h-6 text-blue-600"/>
        <div>
          <h1 className="text-2xl font-bold">Campus Marketplace</h1>
          <p className="text-sm text-gray-500">Buy & sell books, medical instruments, and more near your college</p>
        </div>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <User className="w-4 h-4"/>
            <span className="text-sm">{user.name}</span>
            {user.campus && <span className="text-xs text-gray-500">• {user.campus}</span>}
          </div>
          <button onClick={onLogout} className="text-sm text-red-600">Logout</button>
        </div>
      )}
    </div>
  )
}

function ItemCard({ item, onOffer }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="text-xs text-gray-500">{item.category} • {item.condition} {item.campus ? `• ${item.campus}`: ''}</p>
        </div>
        <div className="text-blue-600 font-bold">₹{item.price}</div>
      </div>
      {item.description && <p className="text-sm text-gray-700 mt-2 line-clamp-2">{item.description}</p>}
      <div className="mt-3 flex items-center gap-2">
        <button onClick={()=>onOffer(item)} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Make offer</button>
      </div>
    </div>
  )
}

function CreateItem({ user, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'books', condition: 'Good', price: '', campus: user?.campus || '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, price: Number(form.price), seller_id: user.user_id }
      await api.createItem(payload)
      setForm({ title: '', description: '', category: 'books', condition: 'Good', price: '', campus: user?.campus || '' })
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow border">
      <h3 className="font-semibold mb-3 flex items-center gap-2"><PlusCircle className="w-4 h-4"/> List an item</h3>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
        <Field label="Title"><input className="w-full border rounded px-3 py-2" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} required/></Field>
        <Field label="Price (₹)"><input type="number" className="w-full border rounded px-3 py-2" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} required/></Field>
        <Field label="Category">
          <select className="w-full border rounded px-3 py-2" value={form.category} onChange={e=>setForm({...form, category: e.target.value})}>
            <option value="books">Books</option>
            <option value="medical-instruments">Medical Instruments</option>
            <option value="electronics">Electronics</option>
            <option value="hostel">Hostel/Personal</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Condition">
          <select className="w-full border rounded px-3 py-2" value={form.condition} onChange={e=>setForm({...form, condition: e.target.value})}>
            <option>New</option>
            <option>Like New</option>
            <option>Good</option>
            <option>Fair</option>
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Description"><textarea className="w-full border rounded px-3 py-2" rows={3} value={form.description} onChange={e=>setForm({...form, description: e.target.value})}/></Field>
        </div>
        <Field label="Campus"><input className="w-full border rounded px-3 py-2" value={form.campus} onChange={e=>setForm({...form, campus: e.target.value})}/></Field>
        <div className="md:col-span-2">
          <button disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2">{loading ? 'Listing...' : 'List item'}</button>
          {error && <span className="text-red-600 text-sm ml-3">{error}</span>}
        </div>
      </form>
    </div>
  )
}

function OfferModal({ open, onClose, item, user, onSubmit }) {
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')
  useEffect(()=>{ if (open) { setPrice(item ? item.price : ''); setMessage('') } }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow">
        <h3 className="font-semibold text-lg">Make an offer for {item?.title}</h3>
        <p className="text-sm text-gray-500 mb-3">Original price ₹{item?.price}</p>
        <Field label="Your offer (₹)"><input type="number" className="w-full border rounded px-3 py-2" value={price} onChange={e=>setPrice(e.target.value)} /></Field>
        <Field label="Message (optional)"><textarea className="w-full border rounded px-3 py-2" rows={3} value={message} onChange={e=>setMessage(e.target.value)} /></Field>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
          <button onClick={()=>onSubmit({ price: Number(price), message })} className="px-3 py-1 rounded bg-blue-600 text-white">Send offer</button>
        </div>
      </div>
    </div>
  )
}

function OffersPanel({ user }) {
  const [offers, setOffers] = useState([])
  const refresh = async () => {
    const data = await api.listOffersForUser(user.user_id)
    setOffers(data)
  }
  useEffect(()=>{ refresh() }, [])
  const takeAction = async (offerId, action) => {
    await api.actOnOffer(offerId, action)
    refresh()
  }
  return (
    <div className="bg-white p-4 rounded-xl shadow border">
      <h3 className="font-semibold mb-3">Negotiations</h3>
      <div className="space-y-3 max-h-72 overflow-auto">
        {offers.length === 0 && <p className="text-sm text-gray-500">No offers yet</p>}
        {offers.map(o => (
          <div key={o._id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">Item: {o.item_id}</p>
                <p>Offer: ₹{o.offered_price}</p>
                {o.message && <p className="text-gray-600">“{o.message}”</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded ${o.status==='pending'?'bg-yellow-100 text-yellow-700': o.status==='accepted'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{o.status}</span>
            </div>
            {o.seller_id === user.user_id && o.status==='pending' && (
              <div className="flex gap-2 mt-2">
                <button onClick={()=>takeAction(o._id, 'accept')} className="text-sm bg-green-600 text-white px-2 py-1 rounded">Accept</button>
                <button onClick={()=>takeAction(o._id, 'decline')} className="text-sm bg-red-600 text-white px-2 py-1 rounded">Decline</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Ratings({ rateeId, raterId, onRated }) {
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const submit = async () => {
    await api.createRating({ rater_id: raterId, ratee_id: rateeId, item_id: 'na', stars, comment })
    setComment('')
    onRated && onRated()
  }
  return (
    <div className="bg-white p-4 rounded-xl shadow border">
      <h3 className="font-semibold mb-3 flex items-center gap-2"><Star className="w-4 h-4"/> Leave a rating</h3>
      <div className="flex items-center gap-2 mb-2">
        <select value={stars} onChange={e=>setStars(Number(e.target.value))} className="border rounded px-2 py-1">
          {[1,2,3,4,5].map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-yellow-600">{'★'.repeat(stars)}{'☆'.repeat(5-stars)}</span>
      </div>
      <textarea value={comment} onChange={e=>setComment(e.target.value)} className="w-full border rounded px-3 py-2" rows={2} placeholder="Say something nice (or helpful)"/>
      <div className="mt-2 text-right">
        <button onClick={submit} className="bg-blue-600 text-white px-3 py-1 rounded">Submit</button>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ q: '', campus: '', category: '' })
  const [offerOpen, setOfferOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const search = async () => {
    const data = await api.searchItems({ ...filters, q: filters.q || undefined, campus: filters.campus || undefined, category: filters.category || undefined })
    setItems(data)
  }
  useEffect(()=>{ search() }, [])

  const onOffer = (item) => { setSelectedItem(item); setOfferOpen(true) }
  const submitOffer = async ({ price, message }) => {
    await api.createOffer({ item_id: selectedItem._id, buyer_id: user.user_id, offered_price: price, message })
    setOfferOpen(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
        <AuthSection onAuthed={setUser} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Header user={user} onLogout={()=>setUser(null)} />

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow border">
              <div className="grid md:grid-cols-4 gap-3">
                <div className="md:col-span-2 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400"/>
                  <input value={filters.q} onChange={e=>setFilters({...filters, q: e.target.value})} placeholder="Search items (books, instruments, etc.)" className="w-full border rounded px-3 py-2"/>
                </div>
                <select value={filters.category} onChange={e=>setFilters({...filters, category: e.target.value})} className="border rounded px-3 py-2">
                  <option value="">All Categories</option>
                  <option value="books">Books</option>
                  <option value="medical-instruments">Medical Instruments</option>
                  <option value="electronics">Electronics</option>
                  <option value="hostel">Hostel/Personal</option>
                  <option value="other">Other</option>
                </select>
                <input value={filters.campus} onChange={e=>setFilters({...filters, campus: e.target.value})} placeholder="Campus" className="border rounded px-3 py-2"/>
                <div className="md:col-span-4 text-right">
                  <button onClick={search} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {items.map(item => (
                <ItemCard key={item._id} item={item} onOffer={onOffer}/>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-500">No items found. Try adjusting filters.</p>}
            </div>
          </div>
          <div className="space-y-4">
            <CreateItem user={user} onCreated={search} />
            <OffersPanel user={user} />
            <Ratings rateeId={user.user_id} raterId={user.user_id} />
          </div>
        </div>
      </div>

      <OfferModal open={offerOpen} onClose={()=>setOfferOpen(false)} item={selectedItem} user={user} onSubmit={submitOffer} />
    </div>
  )
}

export default App
