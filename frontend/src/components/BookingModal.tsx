import React, { useState, useEffect } from "react";
import {
	ScissorOutlined,
	CloseOutlined,
	ClockCircleOutlined,
	UserOutlined,
	CalendarOutlined,
} from "@ant-design/icons";
import { Button, Select, DatePicker, Modal, App } from "antd";
import dayjs from "dayjs";

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

const { Option } = Select;

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
	const { message } = App.useApp();

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

	useEffect(() => {
		if (appointment && checkEdit) {
			setCheckEdit(false);

			const split = appointment.dateString.split("/");
			if (split.length === 3) {
				const iso = `${split[2]}-${split[1]}-${split[0]}`;
				setSelectedDate(iso);
				setSelectedTime(appointment.timeString);
			} else {
				setError("Error converting appointment date.");
			}
		}
	});

	const loadServices = async () => {
		try {
			const { data, error } = await getServices();
			if (error) showError(error, message);
			else setServices(data || []);
		} catch (err) {
			showError(err, message);
		}
	};

	const loadStaff = async () => {
		try {
			const { data, error } = await getStaff();
			if (error) showError(error, message);
			else setStaff(data || []);
		} catch (err) {
			showError(err, message);
		}
	};

	const generateTimeSlots = async () => {
		try {
			const { data, error } = await getAppointmentAvailability({
				serviceID: selectedService,
				date: selectedDate,
				staffID: selectedStaff,
				appointmentID: appointment?.id ?? "",
			});

			const slots = data ?? [];
			if (error) showError(error, message);
			else {
				setTimeSlots(slots);
				setError(slots.length === 0 ? "No available appointments." : "");
			}
		} catch (err) {
			showError(err, message);
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
			setError("Please fill all required fields.");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const [combinedTime, suffix] = selectedTime.split(" ");
			const [hours, minutes] = combinedTime.split(":");
			const adjustedHours = Number(hours) + (suffix === "AM" ? 0 : 12);
			const hh = adjustedHours < 10 ? `0${adjustedHours}` : adjustedHours;

			const startDateString = `${selectedDate}T${hh}:${minutes}:00Z`;

			let result: APIResponse<SafeAppointment>;
			if (appointment) {
				result = await editAppointment({
					appointmentID: appointment.id,
					serviceID: selectedService,
					staffID: selectedStaff,
					startDate: startDateString,
				});
			} else {
				result = await createAppointment({
					serviceID: selectedService,
					staffID: selectedStaff,
					startDate: startDateString,
				});
			}

			if (result.error) {
				setError(
					typeof result.error.message === "string"
						? result.error.message
						: "Error occurred.",
				);
			} else onSuccess();
		} catch (err: any) {
			showError(err, message);
		}

		setLoading(false);
	};

	const getTomorrowDate = () => {
		const t = new Date();
		t.setDate(t.getDate() + 1);
		return t.toISOString().split("T")[0];
	};

	return (
		<Modal
			open={true}
			onCancel={onClose}
			footer={null}
			centered
			width={700}
			title={
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<span style={{ fontSize: 20, fontWeight: 700 }}>
						{appointment ? "Edit Appointment" : "Book New Appointment"}
					</span>
					<Button
						shape="circle"
						icon={<CloseOutlined style={{ color: "#808080" }} />}
						onClick={onClose}
					/>
				</div>
			}
			closeIcon={null}
		>
			<form
				onSubmit={handleSubmit}
				style={{ display: "flex", flexDirection: "column", gap: 24 }}
			>
				{error && (
					<div
						style={{
							padding: 12,
							backgroundColor: "#ffe6e6",
							border: "1px solid #ffb3b3",
							borderRadius: 6,
							color: "#cc0000",
							fontSize: 14,
							marginTop: "6px",
						}}
					>
						{error}
					</div>
				)}

				{/* Service */}
				<div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
					<label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
						<ScissorOutlined style={{ marginRight: 6 }} />
						Service
					</label>
					<Select
						value={selectedService}
						onChange={(val) => setSelectedService(val)}
						placeholder="Select a service"
						style={{ width: "100%" }}
					>
						{services.map((s) => (
							<Option
								key={s.id}
								value={s.id}
							>
								{s.serviceName} ({durationToMinutes(s.serviceDuration)} min)
							</Option>
						))}
					</Select>
				</div>

				{/* Staff */}
				<div>
					<label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
						<UserOutlined style={{ marginRight: 6 }} />
						Stylist
					</label>
					<Select
						value={selectedStaff}
						onChange={(val) => setSelectedStaff(val)}
						placeholder="Select a stylist"
						style={{ width: "100%" }}
					>
						{staff.map((m) => (
							<Option
								key={m.id}
								value={m.id}
							>
								{m.name}
							</Option>
						))}
					</Select>
				</div>

				{/* Date */}
				<div>
					<label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
						<CalendarOutlined style={{ marginRight: 6 }} />
						Date
					</label>
					<DatePicker
						style={{ width: "100%" }}
						value={selectedDate ? dayjs(selectedDate) : null}
						onChange={(d) => setSelectedDate(d?.format("YYYY-MM-DD") || "")}
						disabledDate={(current) => current && current < dayjs(getTomorrowDate())}
					/>
				</div>

				{/* Time Slots */}
				{timeSlots.length > 0 && (
					<div>
						<label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
							<ClockCircleOutlined style={{ marginRight: 6 }} />
							Available Times
						</label>

						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(4, 1fr)",
								gap: 8,
								maxHeight: 130,
								overflowY: "auto",
							}}
						>
							{timeSlots.map((slot) => (
								<Button
									key={slot}
									type={selectedTime === slot ? "primary" : "default"}
									onClick={() => setSelectedTime(slot)}
									style={{
										backgroundColor: selectedTime === slot ? "#eb9090ff" : "#be123c",
										borderColor: "#be123c",
										color: "white",
									}}
								>
									{slot}
								</Button>
							))}
						</div>
					</div>
				)}

				{/* Footer */}
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						gap: 12,
						borderTop: "1px solid #e5e7eb",
						paddingTop: 16,
					}}
				>
					<Button onClick={onClose}>Cancel</Button>

					<Button
						type="primary"
						htmlType="submit"
						loading={loading}
						style={{
							background: "linear-gradient(to right, #f43f5e, #7e22ce)",
							border: "none",
						}}
					>
						{loading
							? "Saving..."
							: appointment
							? "Update Appointment"
							: "Book Appointment"}
					</Button>
				</div>
			</form>
		</Modal>
	);
};
