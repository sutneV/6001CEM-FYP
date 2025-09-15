import { pgTable, unique, uuid, varchar, timestamp, foreignKey, text, index, integer, json, boolean, uniqueIndex, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const applicationStatus = pgEnum("application_status", ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn', 'interview_scheduled', 'meet_greet_scheduled', 'home_visit_scheduled', 'pending_approval'])
export const conversationStatus = pgEnum("conversation_status", ['active', 'archived', 'closed'])
export const messageStatus = pgEnum("message_status", ['sent', 'delivered', 'read'])
export const ownerType = pgEnum("owner_type", ['adopter', 'shelter'])
export const petAge = pgEnum("pet_age", ['baby', 'young', 'adult', 'senior'])
export const petGender = pgEnum("pet_gender", ['male', 'female', 'unknown'])
export const petSize = pgEnum("pet_size", ['small', 'medium', 'large', 'xlarge'])
export const petStatus = pgEnum("pet_status", ['available', 'pending', 'adopted'])
export const petType = pgEnum("pet_type", ['dog', 'cat', 'rabbit', 'bird', 'other'])
export const postType = pgEnum("post_type", ['text', 'image', 'event'])
export const userRole = pgEnum("user_role", ['adopter', 'shelter', 'admin'])


export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	firstName: varchar("first_name", { length: 100 }).notNull(),
	lastName: varchar("last_name", { length: 100 }).notNull(),
	phone: varchar({ length: 20 }),
	city: varchar({ length: 100 }),
	role: userRole().default('adopter').notNull(),
	isActive: varchar("is_active", { length: 10 }).default('true').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const shelters = pgTable("shelters", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	address: text(),
	registrationNumber: varchar("registration_number", { length: 100 }),
	website: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "shelters_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const pets = pgTable("pets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	shelterId: uuid("shelter_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: petType().notNull(),
	breed: varchar({ length: 255 }),
	age: petAge().notNull(),
	gender: petGender().notNull(),
	size: petSize(),
	weight: integer(),
	color: varchar({ length: 255 }),
	description: text().notNull(),
	story: text(),
	images: json().default([]),
	vaccinated: boolean().default(false),
	neutered: boolean().default(false),
	microchipped: boolean().default(false),
	houseTrained: boolean("house_trained").default(false),
	goodWithKids: boolean("good_with_kids").default(false),
	goodWithDogs: boolean("good_with_dogs").default(false),
	goodWithCats: boolean("good_with_cats").default(false),
	specialNeeds: boolean("special_needs").default(false),
	specialNeedsDescription: text("special_needs_description"),
	status: petStatus().default('available').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_pets_age").using("btree", table.age.asc().nullsLast().op("enum_ops")),
	index("idx_pets_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_pets_shelter_id").using("btree", table.shelterId.asc().nullsLast().op("uuid_ops")),
	index("idx_pets_size").using("btree", table.size.asc().nullsLast().op("enum_ops")),
	index("idx_pets_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_pets_type").using("btree", table.type.asc().nullsLast().op("enum_ops")),
]);

export const communities = pgTable("communities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	category: varchar({ length: 50 }).notNull(),
	bannerImage: varchar("banner_image", { length: 500 }),
	ownerId: uuid("owner_id").notNull(),
	ownerType: ownerType("owner_type").notNull(),
	memberCount: integer("member_count").default(1),
	isPublic: boolean("is_public").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_communities_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_communities_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_communities_owner_id").using("btree", table.ownerId.asc().nullsLast().op("uuid_ops")),
]);

export const communityMembers = pgTable("community_members", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	communityId: uuid("community_id").notNull(),
	userId: uuid("user_id").notNull(),
	role: varchar({ length: 20 }).default('member').notNull(),
	joinedAt: timestamp("joined_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_community_members_community_id").using("btree", table.communityId.asc().nullsLast().op("uuid_ops")),
	index("idx_community_members_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
]);

export const communityPosts = pgTable("community_posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	communityId: uuid("community_id").notNull(),
	authorId: uuid("author_id").notNull(),
	title: varchar({ length: 255 }),
	content: text().notNull(),
	type: postType().default('text').notNull(),
	images: json().default([]),
	likesCount: integer("likes_count").default(0),
	commentsCount: integer("comments_count").default(0),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_community_posts_author_id").using("btree", table.authorId.asc().nullsLast().op("uuid_ops")),
	index("idx_community_posts_community_id").using("btree", table.communityId.asc().nullsLast().op("uuid_ops")),
]);

export const communityPostComments = pgTable("community_post_comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	authorId: uuid("author_id").notNull(),
	content: text().notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const communityPostLikes = pgTable("community_post_likes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const applications = pgTable("applications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	petId: uuid("pet_id").notNull(),
	adopterId: uuid("adopter_id").notNull(),
	firstName: varchar("first_name", { length: 100 }).notNull(),
	lastName: varchar("last_name", { length: 100 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 20 }).notNull(),
	dateOfBirth: varchar("date_of_birth", { length: 10 }).notNull(),
	occupation: varchar({ length: 255 }).notNull(),
	housingType: varchar("housing_type", { length: 50 }).notNull(),
	ownRent: varchar("own_rent", { length: 10 }).notNull(),
	address: text().notNull(),
	landlordPermission: varchar("landlord_permission", { length: 50 }),
	yardType: varchar("yard_type", { length: 50 }).notNull(),
	householdSize: integer("household_size").notNull(),
	previousPets: varchar("previous_pets", { length: 10 }).notNull(),
	currentPets: varchar("current_pets", { length: 10 }).notNull(),
	petExperience: text("pet_experience"),
	veterinarian: text(),
	workSchedule: text("work_schedule").notNull(),
	exerciseCommitment: varchar("exercise_commitment", { length: 50 }).notNull(),
	travelFrequency: varchar("travel_frequency", { length: 50 }).notNull(),
	petPreferences: text("pet_preferences").notNull(),
	householdMembers: text("household_members").notNull(),
	allergies: varchar({ length: 50 }).notNull(),
	childrenAges: varchar("children_ages", { length: 255 }),
	references: text().notNull(),
	emergencyContact: text("emergency_contact").notNull(),
	agreements: json().default([]).notNull(),
	status: applicationStatus().default('draft').notNull(),
	submittedAt: timestamp("submitted_at", { withTimezone: true, mode: 'string' }),
	reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: 'string' }),
	reviewerNotes: text("reviewer_notes"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_applications_adopter_id").using("btree", table.adopterId.asc().nullsLast().op("uuid_ops")),
	index("idx_applications_pet_id").using("btree", table.petId.asc().nullsLast().op("uuid_ops")),
	index("idx_applications_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_applications_submitted_at").using("btree", table.submittedAt.asc().nullsLast().op("timestamptz_ops")),
	uniqueIndex("idx_applications_unique_pet_adopter").using("btree", table.petId.asc().nullsLast().op("uuid_ops"), table.adopterId.asc().nullsLast().op("uuid_ops")).where(sql`(status <> 'withdrawn'::application_status)`),
]);

export const conversations = pgTable("conversations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	adopterId: uuid("adopter_id").notNull(),
	shelterId: uuid("shelter_id").notNull(),
	petId: uuid("pet_id"),
	status: conversationStatus().default('active').notNull(),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_conversations_adopter_id").using("btree", table.adopterId.asc().nullsLast().op("uuid_ops")),
	index("idx_conversations_last_message_at").using("btree", table.lastMessageAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_conversations_pet_id").using("btree", table.petId.asc().nullsLast().op("uuid_ops")),
	index("idx_conversations_shelter_id").using("btree", table.shelterId.asc().nullsLast().op("uuid_ops")),
]);

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	senderId: uuid("sender_id").notNull(),
	content: text().notNull(),
	status: messageStatus().default('sent').notNull(),
	readAt: timestamp("read_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_messages_conversation_id").using("btree", table.conversationId.asc().nullsLast().op("uuid_ops")),
	index("idx_messages_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_messages_sender_id").using("btree", table.senderId.asc().nullsLast().op("uuid_ops")),
	index("idx_messages_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
]);

export const communityEventParticipants = pgTable("community_event_participants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventId: uuid("event_id").notNull(),
	userId: uuid("user_id").notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [communityEvents.id],
			name: "community_event_participants_event_id_community_events_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "community_event_participants_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const communityEvents = pgTable("community_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	communityId: uuid("community_id").notNull(),
	organizerId: uuid("organizer_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	eventDate: timestamp("event_date", { mode: 'string' }).notNull(),
	eventTime: varchar("event_time", { length: 10 }),
	location: text().notNull(),
	fee: varchar({ length: 100 }).default('Free'),
	maxParticipants: integer("max_participants"),
	currentParticipants: integer("current_participants").default(0),
	images: json().default([]),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	latitude: numeric({ precision: 10, scale:  8 }),
	longitude: numeric({ precision: 11, scale:  8 }),
}, (table) => [
	foreignKey({
			columns: [table.communityId],
			foreignColumns: [communities.id],
			name: "community_events_community_id_communities_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizerId],
			foreignColumns: [users.id],
			name: "community_events_organizer_id_users_id_fk"
		}).onDelete("cascade"),
]);
