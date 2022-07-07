import { Context, Service, ServiceBroker, ServiceSchema } from "moleculer";
import { EMAIL_CONSTRAINT, ID_CONSTRAINT, PASSWORD_CONSTRAINT, USERNAME_CONSTRAINT, DbConnection } from "@andreadelligatti/lerna-moleculer-common";

export default class UserService extends Service {
	private DbMixin = new DbConnection("users").start();

	// @ts-ignore
	public constructor(public broker: ServiceBroker, schema: ServiceSchema<{}> = {}) {
		super(broker);
		this.parseServiceSchema(Service.mergeSchemas({
			name: "user",
			mixins: [this.DbMixin],
			settings: {
				fields: [
					"_id",
					"username",
					"email",
					"password",
				]
			},
			actions: {
				get: false,
				list: false,
				find: false,
				count: false,
				create: false,
				insert: false,
				update: false,
				remove: false,

				findById: {
					params: {
						"id": ID_CONSTRAINT
					},
					handler: async (ctx: Context<{ id: string }>) => {
						let doc = await this.adapter.findById(ctx.params.id);
						if (doc) {
							const json = await this.transformDocuments(ctx, ctx.params, doc);
							return json;
						}
						return doc;
					}
				},

				findOne: {
					params: {
						"email": EMAIL_CONSTRAINT,
						"password": PASSWORD_CONSTRAINT
					},
					handler: async (ctx: Context<{ email: string, password: string }>) => {
						let doc = await this.adapter.findOne(ctx.params);
						if (doc) {
							const json = await this.transformDocuments(ctx, ctx.params, doc);
							return json;
						}
						return doc;
					}
				},

				insertOne: {
					params: {
						"username": USERNAME_CONSTRAINT,
						"email": EMAIL_CONSTRAINT,
						"password": PASSWORD_CONSTRAINT
					},
					handler: async (ctx: Context<{ username: string, email: string, password: string }>) => {
						let doc = await this.adapter.insert(ctx.params);
						if (doc) {
							const json = await this.transformDocuments(ctx, ctx.params, doc);
							return json;
						}
						return doc;
					}
				},
				
				userExist: {
					params: {
						"username": USERNAME_CONSTRAINT,
						"email": EMAIL_CONSTRAINT
					},
					handler: async (ctx: Context<{ username: string, email: string }>) => {
						let doc = await this.adapter.findOne({ $or: [{ username: ctx.params.username }, { email: ctx.params.email }] });
						if (doc) return true;
						return false;
					}
				}
			},
			methods: {},
		}, schema));
	}
}
