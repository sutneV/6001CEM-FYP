import { pgTable, uuid, varchar, timestamp, text, pgEnum, boolean, integer, json } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['adopter', 'shelter', 'admin'])
export const petTypeEnum = pgEnum('pet_type', ['dog', 'cat', 'rabbit', 'bird', 'other'])
export const petSizeEnum = pgEnum('pet_size', ['small', 'medium', 'large', 'xlarge'])
export const petAgeEnum = pgEnum('pet_age', ['baby', 'young', 'adult', 'senior'])
export const petGenderEnum = pgEnum('pet_gender', ['male', 'female', 'unknown'])
export const petStatusEnum = pgEnum('pet_status', ['available', 'pending', 'adopted'])

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

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Shelter = typeof shelters.$inferSelect
export type NewShelter = typeof shelters.$inferInsert
export type Pet = typeof pets.$inferSelect
export type NewPet = typeof pets.$inferInsert