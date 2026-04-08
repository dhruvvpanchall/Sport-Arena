import { useState, useMemo } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const start = `${String(i).padStart(2, '0')}:00`
  const end = `${String((i + 1) % 24).padStart(2, '0')}:00`
  const label =
    i === 0
      ? '12:00 AM – 1:00 AM'
      : i < 12
      ? `${i}:00 AM – ${i + 1 === 12 ? '12' : i + 1}:00 ${i + 1 >= 12 ? 'PM' : 'AM'}`
      : i === 12
      ? '12:00 PM – 1:00 PM'
      : `${i - 12}:00 PM – ${(i - 12 + 1) === 12 ? '12' : i - 12 + 1}:00 ${i + 1 >= 24 ? 'AM' : 'PM'}`
  return { id: i, start, end, label }
})

function getNext7Days() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

function toDateStr(d) {
  return d.toISOString().split('T')[0]
}

export default function BookVenue() {
  const location = useLocation()
  const navigate = useNavigate()
  const venue = location.state?.venue

  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()))
  const [selectedSlots, setSelectedSlots] = useState([])
  const [customDate, setCustomDate] = useState('')

  const days = useMemo(() => getNext7Days(), [])
  const todayStr = toDateStr(new Date())

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🏟️</p>
          <p className="text-gray-600 font-semibold mb-2">No venue selected</p>
          <Link to="/dashboard" className="text-green-600 font-semibold hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const toggleSlot = (slotId) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId) ? prev.filter((s) => s !== slotId) : [...prev, slotId]
    )
  }

  const handleDateChange = (dateStr) => {
    setSelectedDate(dateStr)
    setSelectedSlots([])
    setCustomDate('')
  }

  const handleCustomDate = (e) => {
    const val = e.target.value
    if (val < todayStr) return
    setCustomDate(val)
    setSelectedDate(val)
    setSelectedSlots([])
  }

  const priceNum = parseInt(venue.price.replace(/[^\d]/g, '')) || 0
  const totalPrice = priceNum * selectedSlots.length

  const handleProceed = () => {
    if (selectedSlots.length === 0) return
    navigate('/payment', {
      state: {
        venue,
        date: selectedDate,
        slots: selectedSlots.sort((a, b) => a - b).map((id) => timeSlots[id]),
        totalPrice,
        pricePerSlot: priceNum,
      },
    })
  }

  // Check if selected date is today — disable past hours
  const isToday = selectedDate === todayStr
  const currentHour = new Date().getHours()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-3 no-underline">
              <span className="text-2xl">🏟️</span>
              <span className="text-xl font-extrabold text-green-800 tracking-tight">Sport Arena</span>
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-green-600 hover:text-green-800 no-underline flex items-center gap-1.5"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Venue Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-72 h-48 sm:h-auto overflow-hidden shrink-0">
              <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-5 sm:p-6 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{venue.name}</h1>
                  <p className="text-sm text-gray-400 mb-3">{venue.type}</p>
                </div>
                <span className="flex items-center gap-1 text-sm text-yellow-500 font-semibold shrink-0">
                  ⭐ {venue.rating}
                </span>
              </div>
              <p className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>📍</span> {venue.location}
              </p>
              <p className="flex items-center gap-2 text-sm text-green-700 font-bold">
                <span>💰</span> {venue.price}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {venue.amenities.map((a) => (
                  <span
                    key={a}
                    className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Select Date */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            📅 Step 1: Select Date
          </h2>
          <p className="text-sm text-gray-400 mb-5">Choose a date for your booking (today onwards)</p>

          {/* Quick date chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {days.map((d) => {
              const ds = toDateStr(d)
              const isSelected = selectedDate === ds && !customDate
              return (
                <button
                  key={ds}
                  onClick={() => handleDateChange(ds)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-green-600 text-white border-green-600 shadow-md'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300'
                  }`}
                >
                  <span className="block text-xs opacity-70">
                    {ds === todayStr ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </span>
                  {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </button>
              )
            })}
          </div>

          {/* Or pick custom date */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Or pick another date:</span>
            <input
              type="date"
              min={todayStr}
              value={customDate}
              onChange={handleCustomDate}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
          </div>
        </div>

        {/* Step 2: Select Time Slots */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              🕐 Step 2: Select Time Slots
            </h2>
            {selectedSlots.length > 0 && (
              <span className="text-sm font-semibold text-green-600">
                {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-5">
            Select one or more 1-hour slots for{' '}
            <span className="font-semibold text-gray-600">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {timeSlots.map((slot) => {
              const isPast = isToday && slot.id < currentHour
              const isSelected = selectedSlots.includes(slot.id)
              return (
                <button
                  key={slot.id}
                  disabled={isPast}
                  onClick={() => !isPast && toggleSlot(slot.id)}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border text-center ${
                    isPast
                      ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                      : isSelected
                      ? 'bg-green-600 text-white border-green-600 shadow-md scale-[1.02]'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  {slot.label}
                </button>
              )
            })}
          </div>

          {selectedSlots.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-2">Selected slots:</p>
              <div className="flex flex-wrap gap-2">
                {selectedSlots
                  .sort((a, b) => a - b)
                  .map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                    >
                      {timeSlots[id].label}
                      <button
                        onClick={() => toggleSlot(id)}
                        className="text-green-400 hover:text-red-500 cursor-pointer bg-transparent border-none text-sm ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Summary Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sticky bottom-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-400">Date</span>
                <p className="font-bold text-gray-900">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Slots</span>
                <p className="font-bold text-gray-900">{selectedSlots.length} hr{selectedSlots.length !== 1 ? 's' : ''}</p>
              </div>
              <div>
                <span className="text-gray-400">Total</span>
                <p className="font-bold text-green-700 text-lg">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <button
              onClick={handleProceed}
              disabled={selectedSlots.length === 0}
              className={`px-8 py-3.5 rounded-xl text-sm font-bold transition-all border-none ${
                selectedSlots.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white cursor-pointer hover:bg-green-700 hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              Proceed to Payment →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
