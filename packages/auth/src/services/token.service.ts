import { Context, Service, ServiceBroker, ServiceSchema } from "moleculer";
import ApiGateway from "moleculer-web";
import jwt from "jsonwebtoken";
import { ID_CONSTRAINT } from "@andreadelligatti/lerna-moleculer-common";

export default class TokenService extends Service {
	// @ts-ignore
	public constructor(public broker: ServiceBroker, schema: ServiceSchema<{}> = {}) {
		super(broker);
		this.parseServiceSchema(Service.mergeSchemas({
			name: "token",
			mixins: [],
			settings: {},
			hooks: {
				before: {},
			},
			actions: {
				generateToken: {
					params: {
						"usernameId": ID_CONSTRAINT,
						"expiration": "string|optional"
					},
					handler(ctx: Context<{ usernameId: string, expiration?: string }>) {						
						return jwt.sign({ userId: ctx.params.usernameId }, process.env.PRIVATE_JWT_KEY!!, { expiresIn: (ctx.params.expiration) ? ctx.params.expiration : "5mins" });
					}
				},
				validateToken: {
					paramas: {
						"token": "string"
					},
					handler(ctx: Context<{ token: string }>) {
						try {
							let payload = jwt.verify(ctx.params.token, process.env.PRIVATE_JWT_KEY!!);
							return payload;
						}
						catch (e: any) {			
							throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN, {
								error: "Invalid Token",
								message: (e.message == "jwt expired") ? "Token expired" : ""
							});
						}
					}
				}
			},
			methods: {}
		}, schema));
	}
}
