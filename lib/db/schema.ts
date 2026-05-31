import { pgTable, text, timestamp, boolean, integer, varchar, index, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  // total available credits for the user
  credits: integer("credits").default(0).notNull(),
  // user role: 'admin' | 'user'
  role: text("role").default("user").notNull(),
  // current subscription plan
  planKey: text("plan_key").default("free"),
  // ban status
  banned: boolean("banned").default(false).notNull(),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Payment records (one-time purchases and subscription renewals)
export const payment = pgTable("payment", {
  id: text("id").primaryKey(),
  provider: varchar("provider", { length: 32 }).default("creem").notNull(),
  providerPaymentId: text("provider_payment_id").notNull().unique(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 8 }).default("usd").notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  type: varchar("type", { length: 32 }).notNull(), // 'one_time' | 'subscription'
  planKey: varchar("plan_key", { length: 64 }),
  creditsGranted: integer("credits_granted").default(0).notNull(),
  raw: text("raw"), // store provider payload as JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Active subscriptions
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  provider: varchar("provider", { length: 32 }).default("creem").notNull(),
  providerSubId: text("provider_sub_id").notNull().unique(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  planKey: varchar("plan_key", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  raw: text("raw"), // store provider payload as JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Credit ledger for auditability
export const creditLedger = pgTable("credit_ledger", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: varchar("reason", { length: 64 }).notNull(), // 'subscription_cycle' | 'one_time_pack' | 'adjustment' | 'chat_usage' | ...
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionCreditSchedule = pgTable(
  "subscription_credit_schedule",
  {
    id: text("id").primaryKey(),
    subscriptionId: text("subscription_id")
      .notNull()
      .references(() => subscription.id, { onDelete: "cascade" })
      .unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planKey: varchar("plan_key", { length: 64 }).notNull(),
    creditsPerGrant: integer("credits_per_grant").notNull(),
    intervalMonths: integer("interval_months").notNull(),
    grantsRemaining: integer("grants_remaining").notNull(),
    totalCreditsRemaining: integer("total_credits_remaining").notNull(),
    nextGrantAt: timestamp("next_grant_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => ({
    nextGrantIdx: index("subscription_credit_schedule_next_grant_idx").on(table.nextGrantAt),
  }),
);

// Chat sessions
export const chatSession = pgTable("chat_session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title"),
  model: varchar("model", { length: 48 }).default("doubao-1-5-thinking-pro-250415").notNull(),
  totalMessages: integer("total_messages").default(0).notNull(),
  totalCreditsUsed: integer("total_credits_used").default(0).notNull(),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Chat messages
export const chatMessage = pgTable("chat_message", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => chatSession.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 16 }).notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Generation history for images and videos
export const generationHistory = pgTable("generation_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 16 }).notNull(), // 'image' | 'video'
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url"), // For image-to-video generation
  resultUrl: text("result_url"), // Final result URL
  taskId: text("task_id"), // For async video generation tracking
  status: varchar("status", { length: 16 }).notNull().default("pending"), // pending, processing, completed, failed
  creditsUsed: integer("credits_used").default(0).notNull(),
  metadata: text("metadata"), // JSON string for additional data
  error: text("error"), // Error message if failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Password reset tokens
export const passwordResetToken = pgTable("password_reset_token", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Newsletter subscriptions
export const newsletterSubscription = pgTable("newsletter_subscription", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  status: varchar("status", { length: 16 }).notNull().default("active"), // active, unsubscribed
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const pass = pgTable(
  "passes",
  {
    id: text("id").primaryKey(),
    guestId: text("guest_id").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    plan: varchar("plan", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).default("active").notNull(),
    startsAt: timestamp("starts_at").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    totalScanCredits: integer("total_scan_credits").notNull(),
    usedScanCredits: integer("used_scan_credits").default(0).notNull(),
    recoveryCodeHash: text("recovery_code_hash").notNull(),
    provider: varchar("provider", { length: 32 }).default("creem").notNull(),
    providerCheckoutId: text("provider_checkout_id"),
    providerPaymentId: text("provider_payment_id"),
    restoredCount: integer("restored_count").default(0).notNull(),
    lastRestoredAt: timestamp("last_restored_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  table => ({
    guestIdx: index("passes_guest_id_idx").on(table.guestId),
    providerPaymentIdx: index("passes_provider_payment_id_idx").on(table.providerPaymentId),
  }),
);

export const passDevice = pgTable(
  "pass_devices",
  {
    id: text("id").primaryKey(),
    passId: text("pass_id").notNull().references(() => pass.id, { onDelete: "cascade" }),
    deviceIdHash: text("device_id_hash").notNull(),
    passTokenHash: text("pass_token_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),
  },
  table => ({
    passIdx: index("pass_devices_pass_id_idx").on(table.passId),
    deviceIdx: index("pass_devices_device_id_hash_idx").on(table.deviceIdHash),
  }),
);

export const guestUsage = pgTable(
  "guest_usage",
  {
    id: text("id").primaryKey(),
    guestId: text("guest_id").notNull(),
    deviceIdHash: text("device_id_hash").notNull(),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    freeScansUsed: integer("free_scans_used").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  table => ({
    guestIdx: index("guest_usage_guest_id_idx").on(table.guestId),
    deviceIdx: index("guest_usage_device_id_hash_idx").on(table.deviceIdHash),
  }),
);

export const scanResult = pgTable(
  "scan_results",
  {
    id: text("id").primaryKey(),
    guestId: text("guest_id").notNull(),
    passId: text("pass_id").references(() => pass.id, { onDelete: "set null" }),
    dietaryProfile: jsonb("dietary_profile").notNull(),
    structuredResult: jsonb("structured_result").notNull(),
    imageCount: integer("image_count").notNull(),
    detectedDishCount: integer("detected_dish_count").default(0).notNull(),
    analyzedDishCount: integer("analyzed_dish_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
  },
  table => ({
    guestIdx: index("scan_results_guest_id_idx").on(table.guestId),
    passIdx: index("scan_results_pass_id_idx").on(table.passId),
  }),
);

export const aiUsageLog = pgTable(
  "ai_usage_logs",
  {
    id: text("id").primaryKey(),
    scanId: text("scan_id").references(() => scanResult.id, { onDelete: "set null" }),
    guestId: text("guest_id"),
    passId: text("pass_id").references(() => pass.id, { onDelete: "set null" }),
    model: varchar("model", { length: 96 }).notNull(),
    imageCount: integer("image_count").default(0).notNull(),
    imageWidths: jsonb("image_widths"),
    imageHeights: jsonb("image_heights"),
    imageSizeKbTotal: integer("image_size_kb_total").default(0).notNull(),
    detectedDishCount: integer("detected_dish_count").default(0).notNull(),
    analyzedDishCount: integer("analyzed_dish_count").default(0).notNull(),
    inputTokens: integer("input_tokens").default(0).notNull(),
    outputTokens: integer("output_tokens").default(0).notNull(),
    totalTokens: integer("total_tokens").default(0).notNull(),
    estimatedCostUsd: varchar("estimated_cost_usd", { length: 32 }),
    success: boolean("success").default(false).notNull(),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    scanIdx: index("ai_usage_logs_scan_id_idx").on(table.scanId),
    guestIdx: index("ai_usage_logs_guest_id_idx").on(table.guestId),
    passIdx: index("ai_usage_logs_pass_id_idx").on(table.passId),
  }),
);
