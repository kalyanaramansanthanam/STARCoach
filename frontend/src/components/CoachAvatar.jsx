export default function CoachAvatar() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 rounded-xl">
      <div className="relative">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-12 h-12">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800" />
      </div>
      <p className="mt-4 text-lg font-semibold text-white">STAR Coach</p>
      <p className="text-sm text-gray-400 mt-1">Listening...</p>
    </div>
  )
}
