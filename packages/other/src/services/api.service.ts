import { IncomingMessage, ServerResponse } from "http";
import { Service, ServiceBroker, Context } from "moleculer";
import ApiGateway from "moleculer-web";

const NO_TOKEN_VALIDATION_URLS = [
	"/auth/login",
	"/auth/register",
]

export default class ApiService extends Service {

	public constructor(broker: ServiceBroker) {
		super(broker);
		// @ts-ignore
		this.parseServiceSchema({
			name: "api",
			mixins: [ApiGateway],
			settings: {
				port: process.env.PORT || 3000,

				routes: [{
					path: "/api",
					whitelist: [
						"auth.*",
						"greeter.*"
					],
					use: [],
					mergeParams: true,
					authentication: true,
					authorization: false,
					autoAliases: true,

					aliases: {},
					callingOptions: {},

					bodyParsers: {
						json: true,
						urlencoded: {
							extended: true,
							limit: "1MB",
						},
					},

					mappingPolicy: "all",

					logging: true,

					onAfterCall(ctx: Context, route: any, req: IncomingMessage, res: ServerResponse, data: any) {
						data.apiID = this.broker.nodeID;
						return data;
					}
				}],

				log4XXResponses: false,
				logRequestParams: null,
				logResponseData: null,

				assets: {
					folder: "public",
					options: {},
				},
			},

			methods: {
				// /**
				//  * Authenticate the request. It checks the `Authorization` token value in the request header.
				//  * Check the token value & resolve the user by the token.
				//  * The resolved user will be available in `ctx.meta.user`
				//  *
				//  * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
				//  *
				//  * @param {Context} ctx
				//  * @param {any} route
				//  * @param {IncomingMessage} req
				//  * @returns {Promise}
				// */

				async authenticate(ctx: Context, route: any, req: IncomingMessage): Promise<any> {
					// Read the token from header
					if (!NO_TOKEN_VALIDATION_URLS.includes(req.url!!)) {
						const auth = req.headers.authorization;

						if (!auth || !auth.includes("Bearer ")) throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_NO_TOKEN, { error: "no token provided" });

						let payload = await ctx.call("token.validateToken", { token: auth.replace("Bearer ", "") });
						return payload;
					}
					return {};
				},

				// /**
				//  * Authorize the request. Check that the authenticated user has right to access the resource.
				//  *
				//  * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
				//  *
				//  * @param {Context} ctx
				//  * @param {Object} route
				//  * @param {IncomingMessage} req
				//  * @returns {Promise}
				// */

				// async authorize(ctx: Context<any, { user: string; }>, route: Record<string, undefined>, req: IncomingMessage): Promise<any> {
				// 	// Get the authenticated user.
				// 	const user = ctx.meta.user;

				// 	// It check the `auth` property in action schema.
				// 	// @ts-ignore
				// 	if (req.$action.auth === "required" && !user) {
				// 		throw new ApiGateway.Errors.UnAuthorizedError("NO_RIGHTS", {
				// 			error: "Unauthorized",
				// 		});
				// 	}
				// },
			},
		});
	}
}
