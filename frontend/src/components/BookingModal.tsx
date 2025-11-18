import React, { useState, useEffect } from "react";
import {
	ScissorOutlined,
	CloseOutlined,
	ClockCircleOutlined,
	UserOutlined,
	CalendarOutlined,
} from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";
import { getServices } from "../api/serviceAPI";
import type { GetStaffDTO } from "../dtos/staff";
import type { GetServiceDTO } from "../dtos/service";
import { getStaff } from "../api/staffAPI";
import { getAppointmentAvailability } from "../api/appointmentAPI";
import type { SafeAppointment } from "../types/safeAppointment";
import type { APIResponse } from "../types/apiResponse";
import { createAppointment, editAppointment } from "../api/userAPI";
import { showError } from "../lib/showError";
import { durationToMinutes } from "../lib/date-to-minutes";

interface BookingModalProps {
	appointment?: SafeAppointment | null;
	onClose: () => void;
	onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
	appointment,
	onClose,
	onSuccess,
}) => {
	const { user } = useAuth();
	const [services, setServices] = useState<GetServiceDTO[]>([]);
	const [staff, setStaff] = useState<GetStaffDTO[]>([]);
	const [selectedService, setSelectedService] = useState<string>(
		appointment?.serviceID || "",
	);
	const [selectedStaff, setSelectedStaff] = useState<string>(
		appointment?.staffID || "",
	);
	const [selectedDate, setSelectedDate] = useState<string>("");
	const [selectedTime, setSelectedTime] = useState<string>("");

	const [timeSlots, setTimeSlots] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [checkEdit, setCheckEdit] = useState(true);

	useEffect(() => {
		loadServices();
		loadStaff();
	}, []);

	useEffect(() => {
		if (selectedDate && selectedStaff && selectedService) {
			generateTimeSlots();
		}
	}, [selectedDate, selectedStaff, selectedService]);

	// For getting the correct date and time values
	useEffect(() => {
		if (appointment && checkEdit) {
			setCheckEdit(false);

			// Convert the time to ISO 8601 standard
			const separatedDate: string[] = appointment.dateString.split("/");
			if (separatedDate.length === 3) {
				const isoDate: string =
					separatedDate[2] + "-" + separatedDate[1] + "-" + separatedDate[0];
				setSelectedTime(appointment.timeString);
				setSelectedDate(isoDate);
			} else
				setError(
					"Error: Appointment date did not convert correctly. Please submit this bug to a system administrator.",
				);
		}
	});

	const loadServices = async () => {
		try {
			const { data, error: serviceError } = await getServices();

			if (serviceError) showError(serviceError);
			else setServices(data || []);
		} catch (serviceError) {
			showError(serviceError);
		}
	};

	const loadStaff = async () => {
		try {
			const { data, error: staffError } = await getStaff();

			if (staffError) showError(staffError);
			else setStaff(data || []);
		} catch (staffError) {
			showError(staffError);
		}
	};

	const generateTimeSlots = async () => {
		try {
			const { data: slots, error: timeSlotError } = await getAppointmentAvailability({
				serviceID: selectedService,
				date: selectedDate,
				staffID: selectedStaff,
				appointmentID: appointment?.id,
			});

			const processedSlots: string[] = slots ?? [];

			if (timeSlotError) showError(timeSlotError);
			else {
				setTimeSlots(processedSlots);
				if (processedSlots.length === 0)
					setError("No available appointments for these selections.");
				else setError("");
			}
		} catch (timeSlotError) {
			showError(timeSlotError);
		}
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

		try {
			const [combinedTime, suffix]: string[] = selectedTime.split(" ");
			const [hours, minutes] = combinedTime.split(":");

			const addedHours: number = suffix === "AM" ? 0 : 12;
			let totalHours: number = Number(hours) + addedHours;
			const stringHours: string =
				totalHours < 10 ? "0" + totalHours.toString() : totalHours.toString();

			const startDateString: string =
				selectedDate + "T" + stringHours + ":" + minutes + ":00Z";

			let result: APIResponse<SafeAppointment>;
			if (appointment)
				result = await editAppointment({
					appointmentID: appointment.id,
					serviceID: selectedService,
					staffID: selectedStaff,
					startDate: startDateString,
				});
			else
				result = await createAppointment({
					serviceID: selectedService,
					staffID: selectedStaff,
					startDate: startDateString,
				});

			if (result.error)
				if (typeof result.error.message === "string") setError(result.error.message);
				else showError(result.error);
			else onSuccess();
		} catch (error: any) {
			if (error?.response?.data?.error?.message?.message)
				setError(error.response.data.error.message.message);
			else if (error?.response?.data?.error?.message)
				setError(error.response.data.error.message);
			else showError(error);
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
						<CloseOutlined style={{ fontSize: "18px", color: "#99A1AF" }} />
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
							<ScissorOutlined className="inline mr-2" />
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
									{service.serviceName} - ({durationToMinutes(service.serviceDuration)} min)
								</option>
							))}
						</select>
					</div>

					{/* Staff Selection */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							<UserOutlined className="inline mr-2" />
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
							<CalendarOutlined className="inline mr-2" />
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
								<ClockCircleOutlined className="inline mr-2" />
								Available Times
							</label>
							<div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
								{timeSlots.map((slot) => (
									<button
										key={slot}
										type="button"
										disabled={false}
										onClick={() => setSelectedTime(slot)}
										className={
											selectedTime === slot
												? `px-3 py-2 text-sm rounded-md border transition-colors bg-rose-300 text-black border-rose-600`
												: `px-3 py-2 text-sm rounded-md border transition-colors bg-rose-600 text-white border-rose-600`
										}
									>
										{slot}
									</button>
								))}
							</div>
						</div>
					)}

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
