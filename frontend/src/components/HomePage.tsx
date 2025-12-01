import React, { useEffect, useState } from "react";
import { Image, Card, Button } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import type { GetServiceDTO } from "../dtos/service";
import { getHomeServices } from "../api/homeAPI";
import { durationToMinutes } from "../lib/date-to-minutes";
import { showError } from "../lib/showError";
import { useNavigate, type NavigateFunction } from "react-router-dom";

export const HomePage: React.FC = () => {
	const navigate: NavigateFunction = useNavigate();
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
		<div
			style={{
				minHeight: "100vh",
				backgroundImage: "linear-gradient(to bottom right, #fff1f2, #faf5ff)",
			}}
		>
			{/* Hero Section */}
			<section style={{ padding: "20px 16px" }}>
				<div
					style={{
						maxWidth: "1120px",
						margin: "0 auto",
						textAlign: "center",
						marginTop: "70px",
					}}
				>
					<h1
						style={{
							fontSize: "3.2rem",
							fontWeight: "bold",
							color: "#111827",
							marginBottom: "24px",
						}}
					>
						Transform Your Look At
						<span
							style={{
								backgroundImage: "linear-gradient(to right, #e11d48, #9333ea)",
								WebkitBackgroundClip: "text",
								color: "transparent",
								display: "block",
							}}
						>
							Salon Elite
						</span>
					</h1>

					<p
						style={{
							fontSize: "1.1rem",
							color: "#4b5563",
							marginBottom: "32px",
							maxWidth: "600px",
							marginLeft: "auto",
							marginRight: "auto",
						}}
					>
						Experience luxury hair care with our expert stylists and premium services. Book
						your appointment today and discover your perfect style.
					</p>

					<Button
						type="primary"
						onClick={() => navigate("/register")}
						style={{
							backgroundImage: "linear-gradient(to right, #e11d48, #9333ea)",
							border: "none",
							padding: "24px 32px",
							borderRadius: "9999px",
							fontSize: "18px",
							fontWeight: 600,
							boxShadow: "0 10px 15px rgba(0,0,0,0.15)",
							transition: "all 0.2s ease",
						}}
						onMouseEnter={(e) => {
							(e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
							(e.currentTarget as HTMLButtonElement).style.backgroundImage =
								"linear-gradient(to right, #be123c, #7e22ce)";
						}}
						onMouseLeave={(e) => {
							(e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
							(e.currentTarget as HTMLButtonElement).style.backgroundImage =
								"linear-gradient(to right, #e11d48, #9333ea)";
						}}
					>
						Book Your Appointment
					</Button>
				</div>
			</section>

			{/* Services Section */}
			<section style={{ padding: "64px 16px", paddingBottom: "120px" }}>
				<div style={{ maxWidth: "1120px", margin: "0 auto" }}>
					<div style={{ textAlign: "center", marginBottom: "28px" }}>
						<h2
							style={{
								fontSize: "2rem",
								fontWeight: "bold",
								color: "#111827",
								marginBottom: "16px",
							}}
						>
							Our Premium Services
						</h2>
						<p style={{ fontSize: "1.125rem", color: "#4b5563" }}>
							Professional hair care services tailored to your unique style
						</p>
					</div>

					{/* Responsive grid (converted manually) */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
							gap: "32px",
						}}
					>
						{services.map((service) => (
							<Card
								key={service.id}
								style={{
									borderRadius: "12px",
									overflow: "hidden",
									boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
									transition: "box-shadow 0.3s",
								}}
								bodyStyle={{ padding: 0 }}
								onMouseEnter={(e) => {
									(e.currentTarget as HTMLDivElement).style.boxShadow =
										"0 12px 20px rgba(0,0,0,0.18)";
								}}
								onMouseLeave={(e) => {
									(e.currentTarget as HTMLDivElement).style.boxShadow =
										"0 10px 15px rgba(0,0,0,0.1)";
								}}
							>
								<div style={{ height: "200px", width: "100%", overflow: "hidden" }}>
									<Image
										src={service.serviceImage}
										alt={service.serviceName}
										width="100%"
										height="100%"
										style={{ objectFit: "cover" }}
									/>
								</div>

								<div style={{ padding: "24px" }}>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<h3
											style={{
												fontSize: "16px",
												fontWeight: 600,
												color: "#111827",
												marginBottom: "8px",
												flex: 1,
												marginRight: "8px",
												wordBreak: "break-word",
											}}
										>
											{service.serviceName}
										</h3>

										<div
											style={{
												display: "flex",
												alignItems: "center",
												color: "#6b7280",
												fontSize: "14px",
												whiteSpace: "nowrap",
												flexShrink: 0,
											}}
										>
											<ClockCircleOutlined style={{ marginRight: "4px" }} />
											{durationToMinutes(service.serviceDuration)} min
										</div>
									</div>

									<p
										style={{
											color: "#4b5563",
											marginTop: "8px",
										}}
									>
										{service.serviceDescription}
									</p>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>
		</div>
	);
};
