import React from 'react';
import { Star, Clock, DollarSign } from 'lucide-react';

const services = [
  {
    id: '1',
    name: 'Classic Haircut',
    description: 'Professional cut and styling with consultation',
    duration: 45,
    price: 65,
    image_url: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '2',
    name: 'Hair Coloring',
    description: 'Full color transformation with premium products',
    duration: 120,
    price: 150,
    image_url: 'https://images.pexels.com/photos/3992876/pexels-photo-3992876.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '3',
    name: 'Hair Treatment',
    description: 'Deep conditioning and repair treatment',
    duration: 60,
    price: 80,
    image_url: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '4',
    name: 'Styling & Blowout',
    description: 'Professional styling for special occasions',
    duration: 30,
    price: 45,
    image_url: 'https://images.pexels.com/photos/3992865/pexels-photo-3992865.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '5',
    name: 'Hair Extensions',
    description: 'Premium extensions for length and volume',
    duration: 180,
    price: 300,
    image_url: 'https://images.pexels.com/photos/3992855/pexels-photo-3992855.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '6',
    name: 'Balayage',
    description: 'Natural-looking highlights with expert technique',
    duration: 150,
    price: 200,
    image_url: 'https://images.pexels.com/photos/3992871/pexels-photo-3992871.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Look at
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-purple-600 block">
              Salon Elite
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience luxury hair care with our expert stylists and premium services. 
            Book your appointment today and discover your perfect style.
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-rose-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Book Your Appointment
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Premium Services
            </h2>
            <p className="text-lg text-gray-600">
              Professional hair care services tailored to your unique style
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration} min
                    </div>
                    <div className="flex items-center text-lg font-semibold text-rose-600">
                      <DollarSign className="h-5 w-5 mr-1" />
                      {service.price}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                rating: 5,
                review: 'Amazing experience! My stylist understood exactly what I wanted and delivered beyond my expectations.'
              },
              {
                name: 'Emily Davis',
                rating: 5,
                review: 'The best salon in town! Professional service, luxurious atmosphere, and incredible results every time.'
              },
              {
                name: 'Michael Brown',
                rating: 5,
                review: 'Outstanding service and attention to detail. I always leave feeling confident and looking great!'
              }
            ].map((review, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{review.review}"</p>
                <p className="font-semibold text-gray-900">— {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};