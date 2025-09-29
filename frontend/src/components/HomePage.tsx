import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { GetServiceDTO } from "../dtos/service";
import { getHomeServices } from "../api/homeAPI";
import { durationToMinutes } from "../lib/date-to-minutes";
import { showError } from "../lib/showError";

interface HomePageProps {
	onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
	const [services, setServices] = useState<GetServiceDTO[]>([]);

	useEffect(() => {
		loadServices();
	});

	const loadServices = async () => {
		const { data, error } = await getHomeServices();

		if (error) showError(error);
		else setServices(data || []);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
			{/* Hero Section */}
			<section className="py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto text-center">
					<h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
						Transform Your Look At
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-purple-600 block">
							Salon Elite
						</span>
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
						Experience luxury hair care with our expert stylists and premium services. Book
						your appointment today and discover your perfect style.
					</p>
					<button
						onClick={() => onNavigate("register")}
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
										src={service.serviceImage}
										alt={service.serviceName}
										className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>

								<div className="p-6">
									<div className="flex justify-between items-center">
										<h3 className="text-xl font-semibold text-gray-900 mb-2">
											{service.serviceName}
										</h3>
										<div className="flex items-center text-sm text-gray-500">
											<Clock className="h-4 w-4 mr-1" />
											{durationToMinutes(service.serviceDuration)} min
										</div>
									</div>

									<p className="text-gray-600 mt-2 mb-1">{service.serviceDescription}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
};
