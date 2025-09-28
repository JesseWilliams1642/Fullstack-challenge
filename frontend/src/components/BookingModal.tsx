import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, User, Scissors } from "lucide-react";
import { Service, StaffMember, Appointment, TimeSlot } from "../types";
import { useAuth } from "../hooks/useAuth";

interface BookingModalProps {
	appointment?: Appointment | null;
	onClose: () => void;
	onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
	appointment,
	onClose,
	onSuccess,
}) => {
	const { user, loading } = useAuth();
	const [services, setServices] = useState<Service[]>([]);
	const [staff, setStaff] = useState<StaffMember[]>([]);
	const [selectedService, setSelectedService] = useState<string>(
		appointment?.service_id || "",
	);
	const [selectedStaff, setSelectedStaff] = useState<string>(
		appointment?.staff_id || "",
	);
	const [selectedDate, setSelectedDate] = useState<string>(
		appointment?.appointment_date || "",
	);
	const [selectedTime, setSelectedTime] = useState<string>(
		appointment?.appointment_time || "",
	);
	const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
	const [notes, setNotes] = useState<string>(appointment?.notes || "");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		loadServices();
		loadStaff();
	}, []);

	useEffect(() => {
		if (selectedDate && selectedStaff) {
			generateTimeSlots();
		}
	}, [selectedDate, selectedStaff]);

	const loadServices = async () => {
		const { data, error } = await supabase
			.from("services")
			.select("*")
			.order("name");

		if (error) {
			console.error("Error loading services:", error);
		} else {
			setServices(data || []);
		}
	};

	const loadStaff = async () => {
		const { data, error } = await supabase
			.from("staff_members")
			.select("*")
			.order("name");

		if (error) {
			console.error("Error loading staff:", error);
		} else {
			setStaff(data || []);
		}
	};

	const generateTimeSlots = async () => {
		const slots: TimeSlot[] = [];
		const startHour = 9;
		const endHour = 18;

		// Get existing appointments for this staff member on this date
		const { data: existingAppointments } = await supabase
			.from("appointments")
			.select("appointment_time")
			.eq("staff_id", selectedStaff)
			.eq("appointment_date", selectedDate)
			.neq("id", appointment?.id || ""); // Exclude current appointment if editing

		const bookedTimes =
			existingAppointments?.map((app) => app.appointment_time) || [];

		for (let hour = startHour; hour < endHour; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				const timeString = `${hour.toString().padStart(2, "0")}:${minute
					.toString()
					.padStart(2, "0")}`;
				slots.push({
					time: timeString,
					available: !bookedTimes.includes(timeString),
				});
			}
		}

		setTimeSlots(slots);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!user ||
			!selectedService ||
			!selectedStaff ||
			!selectedDate ||
			!selectedTime
		) {
			setError("Please fill in all required fields");
			return;
		}

		setLoading(true);
		setError("");

		const appointmentData = {
			user_id: user.id,
			service_id: selectedService,
			staff_id: selectedStaff,
			appointment_date: selectedDate,
			appointment_time: selectedTime,
			status: "scheduled",
			notes: notes || null,
		};

		let result;
		if (appointment) {
			result = await supabase
				.from("appointments")
				.update(appointmentData)
				.eq("id", appointment.id);
		} else {
			result = await supabase.from("appointments").insert([appointmentData]);
		}

		if (result.error) {
			setError(result.error.message);
		} else {
			onSuccess();
		}

		setLoading(false);
	};

	const getTomorrowDate = () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow.toISOString().split("T")[0];
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-2xl font-bold text-gray-900">
						{appointment ? "Edit Appointment" : "Book New Appointment"}
					</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors"
					>
						<X className="h-6 w-6 text-gray-400" />
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className="p-6 space-y-6"
				>
					{error && (
						<div className="bg-red-50 border border-red-200 rounded-md p-4">
							<p className="text-red-600 text-sm">{error}</p>
						</div>
					)}

					{/* Service Selection */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							<Scissors className="h-4 w-4 inline mr-2" />
							Service
						</label>
						<select
							value={selectedService}
							onChange={(e) => setSelectedService(e.target.value)}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
						>
							<option value="">Select a service</option>
							{services.map((service) => (
								<option
									key={service.id}
									value={service.id}
								>
									{service.name} - ${service.price} ({service.duration} min)
								</option>
							))}
						</select>
					</div>

					{/* Staff Selection */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							<User className="h-4 w-4 inline mr-2" />
							Stylist
						</label>
						<select
							value={selectedStaff}
							onChange={(e) => setSelectedStaff(e.target.value)}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
						>
							<option value="">Select a stylist</option>
							{staff.map((member) => (
								<option
									key={member.id}
									value={member.id}
								>
									{member.name}
								</option>
							))}
						</select>
					</div>

					{/* Date Selection */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							<Calendar className="h-4 w-4 inline mr-2" />
							Date
						</label>
						<input
							type="date"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
							min={getTomorrowDate()}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
						/>
					</div>

					{/* Time Selection */}
					{timeSlots.length > 0 && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								<Clock className="h-4 w-4 inline mr-2" />
								Available Times
							</label>
							<div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
								{timeSlots.map((slot) => (
									<button
										key={slot.time}
										type="button"
										disabled={!slot.available}
										onClick={() => setSelectedTime(slot.time)}
										className={`px-3 py-2 text-sm rounded-md border transition-colors ${
											selectedTime === slot.time
												? "bg-rose-600 text-white border-rose-600"
												: slot.available
												? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
												: "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
										}`}
									>
										{slot.time}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Notes */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Notes (Optional)
						</label>
						<textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
							placeholder="Any special requests or notes for your stylist..."
						/>
					</div>

					{/* Submit Button */}
					<div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 font-medium transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="px-6 py-2 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-md font-medium hover:from-rose-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading
								? "Saving..."
								: appointment
								? "Update Appointment"
								: "Book Appointment"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
