import React, { useState, useEffect } from "react";
import {
	CalendarOutlined,
	PlusOutlined,
	UserOutlined,
	DeleteOutlined,
	ClockCircleOutlined,
	CreditCardOutlined,
} from "@ant-design/icons";
import { Button, Card, Spin, Badge, App } from "antd";
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

	const { message } = App.useApp();
	const navigate: NavigateFunction = useNavigate();

	useEffect(() => {
		if (user) loadAppointments();
		else navigate("/login");
	}, [user]);

	const loadAppointments = async () => {
		if (!user) return;

		setLoading(true);

		try {
			const { data, error } = await getAppointments();
			if (error) showError(error, message);
			else setAppointments(data || []);
		} catch (error) {
			showError(error, message);
		}

		setLoading(false);
	};

	const handleDeleteAppointment = async (appointmentId: string) => {
		if (!confirm("Are you sure you want to cancel this appointment?")) return;

		try {
			const { data: _, error } = await deleteAppointment(appointmentId);
			if (error) showError(error, message);
			else loadAppointments();
		} catch (error) {
			showError(error, message);
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

	const getStatusStyle = (status: string) => {
		switch (status) {
			case "scheduled":
				return { backgroundColor: "#d1fae5", color: "#065f46" };
			case "completed":
				return { backgroundColor: "#dbeafe", color: "#1e3a8a" };
			case "canceled":
				return { backgroundColor: "#fee2e2", color: "#b91c1c" };
			default:
				return {};
		}
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				padding: "32px 0",
				background: "linear-gradient(to bottom right, #fff1f2, #f3e8ff)",
			}}
		>
			<div style={{ maxWidth: "1024px", margin: "0 auto", padding: "0 16px" }}>
				{/* Profile Header */}
				<Card
					style={{ marginBottom: "32px", borderRadius: "12px", padding: "24px" }}
					bodyStyle={{ padding: 0 }}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<div style={{ display: "flex", alignItems: "center" }}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									background: "linear-gradient(to right, #be123c, #7e22ce)",
									borderRadius: "50%",
									padding: "12px",
									marginRight: "16px",
								}}
							>
								<UserOutlined style={{ fontSize: "30px", color: "white" }} />
							</div>
							<div>
								<h1 style={{ fontSize: "27px", fontWeight: 700, color: "#111827" }}>
									Welcome back, {user?.name || user?.email}!
								</h1>
								<p style={{ color: "#4b5563", fontSize: "15px" }}>
									Manage your appointments and bookings
								</p>
							</div>
						</div>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							style={{
								background: "linear-gradient(to right, #be123c, #7e22ce)",
								border: "none",
								fontWeight: 500,
								padding: "23px",
							}}
							onClick={() => setShowBookingModal(true)}
						>
							Book New Appointment
						</Button>
					</div>
				</Card>

				{/* Appointments Section */}
				<Card style={{ borderRadius: "12px", padding: "16px" }}>
					<h2
						style={{
							fontSize: "20px",
							fontWeight: 700,
							marginBottom: "24px",
							color: "#111827",
						}}
					>
						Your Appointments
					</h2>

					{loading && userLoaded ? (
						<div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
							<Spin size="large" />
						</div>
					) : appointments.length === 0 ? (
						<div style={{ textAlign: "center", padding: "48px 0" }}>
							<CalendarOutlined
								style={{ fontSize: "65px", color: "#D1D5DC", marginBottom: "16px" }}
							/>
							<p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "16px" }}>
								No Appointments Scheduled
							</p>
							<Button
								type="primary"
								style={{
									background: "linear-gradient(to right, #be123c, #7e22ce)",
									border: "none",
									fontWeight: 600,
									padding: "18px",
								}}
								onClick={() => setShowBookingModal(true)}
							>
								Book Your First Appointment
							</Button>
						</div>
					) : (
						<div style={{ display: "grid", gap: "24px" }}>
							{appointments.map((appointment) => (
								<Card
									key={appointment.id}
									hoverable
									style={{ borderRadius: "8px", borderColor: "#e5e7eb", padding: "16px" }}
									bodyStyle={{ padding: 0 }}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
										}}
									>
										<div style={{ flex: 1 }}>
											<div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
												<h3
													style={{
														fontSize: "18px",
														fontWeight: 600,
														marginRight: "12px",
														color: "#111827",
													}}
												>
													{appointment.serviceName}
												</h3>
												<Badge
													count={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
													style={{
														...getStatusStyle(appointment.status),
														fontWeight: 500,
														padding: "0 10px",
													}}
												/>
											</div>

											<div
												style={{
													color: "#4b5563",
													fontSize: "15px",
												}}
											>
												<CalendarOutlined style={{ marginRight: "8px" }} />
												{appointment.dateString}
												<ClockCircleOutlined style={{ marginRight: "8px", marginLeft: "30px" }} />
												{appointment.timeString}
											</div>

											<p style={{ marginTop: "8px", color: "#4b5563", fontSize: "15px" }}>
												<strong>Stylist:</strong> {appointment.staffName}
											</p>
										</div>

										<div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
											<Button
												type="default"
												icon={<CreditCardOutlined />}
												onClick={() => handleEditAppointment(appointment)}
											/>
											<Button
												type="default"
												danger
												icon={<DeleteOutlined />}
												onClick={() => handleDeleteAppointment(appointment.id)}
											/>
										</div>
									</div>
								</Card>
							))}
						</div>
					)}
				</Card>
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
