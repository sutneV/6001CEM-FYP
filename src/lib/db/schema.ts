import { pgTable, uuid, varchar, timestamp, text, pgEnum, boolean, integer, json } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['adopter', 'shelter', 'admin'])
export const petTypeEnum = pgEnum('pet_type', ['dog', 'cat', 'rabbit', 'bird', 'other'])
export const petSizeEnum = pgEnum('pet_size', ['small', 'medium', 'large', 'xlarge'])
export const petAgeEnum = pgEnum('pet_age', ['baby', 'young', 'adult', 'senior'])
export const petGenderEnum = pgEnum('pet_gender', ['male', 'female', 'unknown'])
export const petStatusEnum = pgEnum('pet_status', ['available', 'pending', 'adopted'])
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read'])
export const conversationStatusEnum = pgEnum('conversation_status', ['active', 'archived', 'closed'])
export const ownerTypeEnum = pgEnum('owner_type', ['adopter', 'shelter'])
export const communityPostTypeEnum = pgEnum('post_type', ['text', 'image', 'event'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  city: varchar('city', { length: 100 }),
  role: userRoleEnum('role').notNull().default('adopter'),
  isActive: varchar('is_active', { length: 10 }).notNull().default('true'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const shelters = pgTable('shelters', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  address: text('address'),
  registrationNumber: varchar('registration_number', { length: 100 }),
  website: varchar('website', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const pets = pgTable('pets', {
  id: uuid('id').primaryKey().defaultRandom(),
  shelterId: uuid('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: petTypeEnum('type').notNull(),
  breed: varchar('breed', { length: 255 }),
  age: petAgeEnum('age').notNull(),
  gender: petGenderEnum('gender').notNull(),
  size: petSizeEnum('size'),
  weight: integer('weight'), // in kg
  color: varchar('color', { length: 255 }),
  description: text('description').notNull(),
  story: text('story'),
  images: json('images').$type<string[]>().default([]),
  // Health information
  vaccinated: boolean('vaccinated').default(false),
  neutered: boolean('neutered').default(false),
  microchipped: boolean('microchipped').default(false),
  // Behavioral information
  houseTrained: boolean('house_trained').default(false),
  goodWithKids: boolean('good_with_kids').default(false),
  goodWithDogs: boolean('good_with_dogs').default(false),
  goodWithCats: boolean('good_with_cats').default(false),
  // Special needs
  specialNeeds: boolean('special_needs').default(false),
  specialNeedsDescription: text('special_needs_description'),
  // Status
  status: petStatusEnum('status').notNull().default('available'),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  adopterId: uuid('adopter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  shelterId: uuid('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  petId: uuid('pet_id').references(() => pets.id, { onDelete: 'set null' }),
  status: conversationStatusEnum('status').notNull().default('active'),
  lastMessageAt: timestamp('last_message_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  status: messageStatusEnum('status').notNull().default('sent'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Communities
export const communities = pgTable('communities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  bannerImage: varchar('banner_image', { length: 500 }),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ownerType: ownerTypeEnum('owner_type').notNull(),
  memberCount: integer('member_count').default(1),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const communityMembers = pgTable('community_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('member'), // 'owner', 'moderator', 'member'
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
})

export const communityPosts = pgTable('community_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }),
  content: text('content').notNull(),
  type: communityPostTypeEnum('type').notNull().default('text'),
  images: json('images').$type<string[]>().default([]),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const communityPostComments = pgTable('community_post_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const communityPostLikes = pgTable('community_post_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Shelter = typeof shelters.$inferSelect
export type NewShelter = typeof shelters.$inferInsert
export type Pet = typeof pets.$inferSelect
export type NewPet = typeof pets.$inferInsert
export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

// Community types
export type Community = typeof communities.$inferSelect
export type NewCommunity = typeof communities.$inferInsert
export type CommunityMember = typeof communityMembers.$inferSelect
export type NewCommunityMember = typeof communityMembers.$inferInsert
export type CommunityPost = typeof communityPosts.$inferSelect
export type NewCommunityPost = typeof communityPosts.$inferInsert
export type CommunityPostComment = typeof communityPostComments.$inferSelect
export type NewCommunityPostComment = typeof communityPostComments.$inferInsert
export type CommunityPostLike = typeof communityPostLikes.$inferSelect
export type NewCommunityPostLike = typeof communityPostLikes.$inferInsert