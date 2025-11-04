import { pgTable, uuid, varchar, timestamp, text, pgEnum, boolean, integer, json, decimal } from 'drizzle-orm/pg-core'

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
export const applicationStatusEnum = pgEnum('application_status', ['draft', 'submitted', 'under_review', 'interview_scheduled', 'meet_greet_scheduled', 'home_visit_scheduled', 'pending_approval', 'approved', 'rejected', 'withdrawn'])
export const shelterApplicationStatusEnum = pgEnum('shelter_application_status', ['pending', 'approved', 'rejected'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  city: varchar('city', { length: 100 }),
  bio: text('bio'),
  avatar: text('avatar'),
  role: userRoleEnum('role').notNull().default('adopter'),
  isActive: varchar('is_active', { length: 10 }).notNull().default('true'),
  emailVerified: boolean('email_verified').notNull().default(false),
  verificationToken: varchar('verification_token', { length: 255 }),
  verificationTokenExpiry: timestamp('verification_token_expiry'),
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

export const shelterApplications = pgTable('shelter_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  city: varchar('city', { length: 100 }),
  shelterName: varchar('shelter_name', { length: 255 }).notNull(),
  shelterDescription: text('shelter_description'),
  registrationNumber: varchar('registration_number', { length: 100 }),
  address: text('address'),
  website: varchar('website', { length: 255 }),
  status: shelterApplicationStatusEnum('status').notNull().default('pending'),
  rejectionReason: text('rejection_reason'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
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

// Applications
export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  petId: uuid('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  adopterId: uuid('adopter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Personal Information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  dateOfBirth: varchar('date_of_birth', { length: 10 }).notNull(), // YYYY-MM-DD format
  occupation: varchar('occupation', { length: 255 }).notNull(),
  
  // Living Situation
  housingType: varchar('housing_type', { length: 50 }).notNull(),
  ownRent: varchar('own_rent', { length: 10 }).notNull(),
  address: text('address').notNull(),
  landlordPermission: varchar('landlord_permission', { length: 50 }),
  yardType: varchar('yard_type', { length: 50 }).notNull(),
  householdSize: integer('household_size').notNull(),
  
  // Pet Experience
  previousPets: varchar('previous_pets', { length: 10 }).notNull(),
  currentPets: varchar('current_pets', { length: 10 }).notNull(),
  petExperience: text('pet_experience'),
  veterinarian: text('veterinarian'),
  
  // Lifestyle
  workSchedule: text('work_schedule').notNull(),
  exerciseCommitment: varchar('exercise_commitment', { length: 50 }).notNull(),
  travelFrequency: varchar('travel_frequency', { length: 50 }).notNull(),
  petPreferences: text('pet_preferences').notNull(),
  
  // Household
  householdMembers: text('household_members').notNull(),
  allergies: varchar('allergies', { length: 50 }).notNull(),
  childrenAges: varchar('children_ages', { length: 255 }),
  
  // Agreement
  references: text('references').notNull(),
  emergencyContact: text('emergency_contact').notNull(),
  agreements: json('agreements').$type<number[]>().notNull().default([]),
  
  // Application metadata
  status: applicationStatusEnum('status').notNull().default('draft'),
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  reviewerNotes: text('reviewer_notes'),
  
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

export const communityEvents = pgTable('community_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  organizerId: uuid('organizer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  eventDate: timestamp('event_date').notNull(),
  eventTime: varchar('event_time', { length: 10 }), // e.g., "14:30"
  location: text('location').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  fee: varchar('fee', { length: 100 }).default('Free'),
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0),
  images: json('images').$type<string[]>().default([]),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const communityEventParticipants = pgTable('community_event_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => communityEvents.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
})

export const favorites = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  petId: uuid('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const aiChatConversations = pgTable('ai_chat_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull().default('New Chat'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const aiChatMessages = pgTable('ai_chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => aiChatConversations.id, { onDelete: 'cascade' }),
  sender: varchar('sender', { length: 10 }).notNull(), // 'user' or 'ai'
  content: text('content').notNull(),
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
export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert

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
export type CommunityEvent = typeof communityEvents.$inferSelect
export type NewCommunityEvent = typeof communityEvents.$inferInsert
export type CommunityEventParticipant = typeof communityEventParticipants.$inferSelect
export type NewCommunityEventParticipant = typeof communityEventParticipants.$inferInsert
export type Favorite = typeof favorites.$inferSelect
export type NewFavorite = typeof favorites.$inferInsert
export type AiChatConversation = typeof aiChatConversations.$inferSelect
export type NewAiChatConversation = typeof aiChatConversations.$inferInsert
export type AiChatMessage = typeof aiChatMessages.$inferSelect
export type NewAiChatMessage = typeof aiChatMessages.$inferInsert
export type ShelterApplication = typeof shelterApplications.$inferSelect
export type NewShelterApplication = typeof shelterApplications.$inferInsert