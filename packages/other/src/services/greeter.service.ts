import { Service, ServiceBroker, Context } from "moleculer";

export default class GreeterService extends Service {
	// @ts-ignore
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: "greeter",
			hooks: {},
			actions: {
				welcome: {
					rest: "GET /welcome",
					async handler(ctx: Context<any, { user: { userId: string } }>): Promise<any> {
						let user: any = await ctx.call("user.findById", { id: ctx.meta.user.userId });
						return { "message": this.actionWelcome(user.username), greeterID: this.broker.nodeID };
					},
				},
			},
			methods: {
				actionWelcome(username: string) {
					return `Welcome@${username}`;
				}
			}
		});
	}
}
