import React, { useState, useEffect } from "react";
import {
	Calendar,
	Clock,
	CreditCard as Edit,
	Trash2,
	Plus,
	User,
} from "lucide-react";
import { type SafeAppointment } from "../types/safeAppointment";
import { BookingModal } from "./BookingModal";
import { useAuth } from "../hooks/useAuth";
import { deleteAppointment, getAppointments } from "../api/userAPI";
import { showError } from "../lib/showError";
import { useNavigate, type NavigateFunction } from "react-router-dom";

export const ProfilePage: React.FC = () => {
	const { user, userLoaded } = useAuth();
	const [appointments, setAppointments] = useState<SafeAppointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [showBookingModal, setShowBookingModal] = useState(false);
	const [editingAppointment, setEditingAppointment] =
		useState<SafeAppointment | null>(null);

	const navigate: NavigateFunction = useNavigate();

	useEffect(() => {
		if (user) loadAppointments();
		else {
			navigate("/login");
		}
	}, [user]);

	const loadAppointments = async () => {
		if (!user) return;

		setLoading(true);

		try {
			const { data, error } = await getAppointments();

			if (error) showError(error);
			else setAppointments(data || []);
		} catch (error) {
			showError(error);
		}

		setLoading(false);
	};

	const handleDeleteAppointment = async (appointmentId: string) => {
		if (!confirm("Are you sure you want to cancel this appointment?")) return;

		try {
			const { data: _, error } = await deleteAppointment(appointmentId);

			if (error) showError(error);
			else loadAppointments();
		} catch (error) {
			showError(error);
		}
	};

	const handleEditAppointment = (appointment: SafeAppointment) => {
		setEditingAppointment(appointment);
		setShowBookingModal(true);
	};

	const handleBookingComplete = () => {
		setShowBookingModal(false);
		setEditingAppointment(null);
		loadAppointments();
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Profile Header */}
				<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<div className="bg-gradient-to-r from-rose-600 to-purple-600 rounded-full p-3 mr-4">
								<User className="h-8 w-8 text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									Welcome back, {user?.name || user?.email}!
								</h1>
								<p className="text-gray-600">Manage your appointments and bookings</p>
							</div>
						</div>
						<button
							onClick={() => setShowBookingModal(true)}
							className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-md font-medium hover:from-rose-700 hover:to-purple-700 flex items-center transition-all duration-200 shadow-lg"
						>
							<Plus className="h-5 w-5 mr-2" />
							Book New Appointment
						</button>
					</div>
				</div>

				{/* Appointments Section */}
				<div className="bg-white rounded-xl shadow-lg p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-6">Your Appointments</h2>

					{loading && userLoaded ? (
						<div className="flex justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
						</div>
					) : appointments.length === 0 ? (
						<div className="text-center py-12">
							<Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
							<p className="text-gray-500 text-lg mb-4">No appointments scheduled</p>
							<button
								onClick={() => setShowBookingModal(true)}
								className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-md font-medium hover:from-rose-700 hover:to-purple-700 transition-all duration-200"
							>
								Book Your First Appointment
							</button>
						</div>
					) : (
						<div className="grid gap-6">
							{appointments.map((appointment) => (
								<div
									key={appointment.id}
									className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center mb-2">
												<h3 className="text-lg font-semibold text-gray-900 mr-4">
													{appointment.serviceName}
												</h3>
												<span
													className={`px-3 py-1 rounded-full text-xs font-medium ${
														appointment.status === "scheduled"
															? "bg-green-100 text-green-800"
															: appointment.status === "completed"
															? "bg-blue-100 text-blue-800"
															: "bg-red-100 text-red-800"
													}`}
												>
													{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
												</span>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
												<div className="flex items-center">
													<Calendar className="h-4 w-4 mr-2" />
													{appointment.dateString}
												</div>
												<div className="flex items-center">
													<Clock className="h-4 w-4 mr-2" />
													{appointment.timeString}
												</div>
											</div>

											<p className="text-gray-600 mt-2">
												<strong>Stylist:</strong> {appointment.staffName}
											</p>
										</div>

										<div className="flex space-x-2 ml-4">
											<button
												onClick={() => handleEditAppointment(appointment)}
												className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
												title="Edit appointment"
											>
												<Edit className="h-4 w-4" />
											</button>
											<button
												onClick={() => handleDeleteAppointment(appointment.id)}
												className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
												title="Cancel appointment"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Booking Modal */}
			{showBookingModal && (
				<BookingModal
					appointment={editingAppointment}
					onClose={() => {
						setShowBookingModal(false);
						setEditingAppointment(null);
					}}
					onSuccess={handleBookingComplete}
				/>
			)}
		</div>
	);
};
