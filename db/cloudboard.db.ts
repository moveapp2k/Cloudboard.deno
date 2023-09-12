
import { pgTable, serial, text, varchar, date, foreignKey, integer, uuid, boolean, json } from "drizzle-orm/pg-core";


/**
 * Thiss table will have trigger for population from the supabase.users table
 */
export const users_profiles = pgTable('user_profiles', {
  /**
   * Primary Key
   */
  id: serial('id').primaryKey(),
  /**
   * Supabase Auth Id
   */
  email: varchar('email'),
  username: text('username').unique(),
  bio: text('bio'),
  created_by: uuid('created_by').unique(),
});


export const mind_maps = pgTable('mind_maps', {
  id: serial('id').primaryKey(),
  title: text('title').unique(),
  content: text('content'),
  published: boolean('published').default(false),
  description:text('description'),
  created_at: date('created_at').defaultNow(),
  created_by: uuid("created_by").references(() => users_profiles.created_by, { onDelete: 'cascade', onUpdate: 'cascade' }),
  collaborators: text('collaborators').array()
});


