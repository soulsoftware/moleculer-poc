import { Service, ServiceBroker, Context, Errors } from "moleculer";
import { EMAIL_CONSTRAINT, PASSWORD_CONSTRAINT, USERNAME_CONSTRAINT } from "@andreadelligatti/lerna-moleculer-common";

let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

export default class AuthService extends Service {
	// @ts-ignore
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: "auth",
			hooks: {
				before: {
					register: async (ctx: Context<{ username: string, email: string, password: string }>) => {
						if (!regexp.test(ctx.params.email)) throw new Errors.ValidationError("email format not valid");

						let exist = await this.userExist(ctx, ctx.params.email, ctx.params.username);
						if (exist) throw new Errors.ValidationError("username or email already used");
					},
				},
			},
			actions: {
				register: {
					rest: {
						method: "POST",
						path: "/register"
					},
					params: {
						"username": USERNAME_CONSTRAINT,
						"email": EMAIL_CONSTRAINT,
						"password": PASSWORD_CONSTRAINT
					},
					async handler(ctx: Context<{ username: string, email: string, password: string }>): Promise<any> {
						const doc: any = await ctx.call("user.insertOne", ctx.params);
						if (doc) return { message: "user registered with success" };
						else throw new Errors.MoleculerServerError("error during registration", 500);
					},
				},

				login: {
					rest: {
						method: "POST",
						path: "/login"
					},
					params: {
						"email": EMAIL_CONSTRAINT,
						"password": PASSWORD_CONSTRAINT
					},
					async handler(ctx: Context<{ email: string, password: string }>): Promise<{ token: string }> {
						const doc: any = await ctx.call("user.findOne", ctx.params);
						if (doc) {
							let token: string = await ctx.call("token.generateToken", { usernameId: doc._id });
							return { token };
						}
						else throw new Errors.MoleculerError("username or password wrong", 404);
					},
				},
			},
			methods: {
				// Bisogna chiamare il microservizio user per trovare l'utente
				async userExist(ctx: Context, email: string, username: string): Promise<boolean> {
					const result: boolean = await ctx.call("user.userExist", { email, username });
					return result;
				}
			}
		});
	}

	// Action
	public ActionHello(): string {
		return "Hello Moleculer";
	}

	public ActionWelcome(name: string): string {
		return `Welcome, ${name}`;
	}
}
