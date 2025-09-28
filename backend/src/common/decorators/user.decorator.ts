import { createParamDecorator, ExecutionContext } from "@nestjs/common";

// Takes the user from the request
// Taken from NestJS documentation (https://docs.nestjs.com/custom-decorators)

export const GetUser = createParamDecorator(
	(data: string, ctx: ExecutionContext) => {
		const request: Express.Request = ctx.switchToHttp().getRequest();
		return request.user;
	},
);
