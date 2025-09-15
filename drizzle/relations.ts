import { relations } from "drizzle-orm/relations";
import { users, shelters, communityEvents, communityEventParticipants, communities } from "./schema";

export const sheltersRelations = relations(shelters, ({one}) => ({
	user: one(users, {
		fields: [shelters.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	shelters: many(shelters),
	communityEventParticipants: many(communityEventParticipants),
	communityEvents: many(communityEvents),
}));

export const communityEventParticipantsRelations = relations(communityEventParticipants, ({one}) => ({
	communityEvent: one(communityEvents, {
		fields: [communityEventParticipants.eventId],
		references: [communityEvents.id]
	}),
	user: one(users, {
		fields: [communityEventParticipants.userId],
		references: [users.id]
	}),
}));

export const communityEventsRelations = relations(communityEvents, ({one, many}) => ({
	communityEventParticipants: many(communityEventParticipants),
	community: one(communities, {
		fields: [communityEvents.communityId],
		references: [communities.id]
	}),
	user: one(users, {
		fields: [communityEvents.organizerId],
		references: [users.id]
	}),
}));

export const communitiesRelations = relations(communities, ({many}) => ({
	communityEvents: many(communityEvents),
}));