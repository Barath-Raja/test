
import Header from './Header'
import Footer from './Footer'

const Schedule = () => {
  return (
  <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center py-20">
          <h2 className="text-4xl font-bold text-blue-500 mb-4">Coming Soon</h2>
          <p className="text-xl text-gray-600">We're working on something amazing!</p>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default Schedule