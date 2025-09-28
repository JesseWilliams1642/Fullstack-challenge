import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { HttpErrorFilter } from "./common/exception-filters/global.exception-filter";
import { AllExceptionsFilter } from "./common/exception-filters/global-unexpected.exception-filter";
import cookieParser from "cookie-parser";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Removes any elements not defined in an expected request @Body type
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
		}),
	);

	// Allows us to parse cookies
	app.use(cookieParser());

	// Allows the frontend to make requests
	app.enableCors({
		origin: "http://localhost:" + process.env.VITE_FRONTEND_PORT,
		credentials: true, // Use cookies
	});

	// Global error handling
	// NOTE: Tries filters FILO
	app.useGlobalFilters(new AllExceptionsFilter(), new HttpErrorFilter());

	// Setting up and exposing port
	const port: string = process.env.BACKEND_PORT || "5554";
	await app.listen(port);
	console.log(`Backend server is running on http://localhost:${port}`);
}
void bootstrap();
