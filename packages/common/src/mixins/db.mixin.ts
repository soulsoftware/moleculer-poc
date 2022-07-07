import { Context, Service, ServiceSchema } from "moleculer";
import DbService from "moleculer-db";

export class DbConnection implements Partial<ServiceSchema>, ThisType<Service>{

	private cacheCleanEventName: string;
	private collection: string;
	private schema: Partial<ServiceSchema> & ThisType<Service>;

	public constructor(public collectionName: string) {
		this.collection = collectionName;
		this.cacheCleanEventName = `cache.clean.${this.collection}`;
		this.schema = {
			mixins: [DbService],
			events: {
				/**
				 * Subscribe to the cache clean event. If it's triggered
				 * clean the cache entries for this service.
				 *
				 */
				async [this.cacheCleanEventName]() {
					if (this.broker.cacher) {
						await this.broker.cacher.clean(`${this.fullName}.*`);
					}
				},
			},
			methods: {
				/**
				 * Send a cache clearing event when an entity changed.
				 *
				 * @param {String} type
				 * @param {any} json
				 * @param {Context} ctx
				 */
				entityChanged: async (type: string, json: any, ctx: Context) => {
					await ctx.broadcast(this.cacheCleanEventName);
				},
			},
			async started() { },
		};
	}

	public start() {
		if (process.env.MONGO_URI) {
			const MongoAdapter = require("moleculer-db-adapter-mongo");
			this.schema.adapter = new MongoAdapter(process.env.MONGO_URI, { useUnifiedTopology: true });
			this.schema.collection = this.collection;
		} else if (process.env.NODE_ENV === "test") {
			// @ts-ignore
			this.schema.adapter = new DbService.MemoryAdapter();
		}

		return this.schema;
	}

	public get _collection(): string {
		return this.collection;
	}

	public set _collection(value: string) {
		this.collection = value;
	}
}
