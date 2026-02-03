-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "display_name" TEXT NOT NULL,
    "bio" TEXT,
    "phone" TEXT,
    "profile_photo_url" TEXT,
    "preferred_language" TEXT NOT NULL DEFAULT 'ko',
    "preferred_currency" TEXT NOT NULL DEFAULT 'KRW',
    "role" TEXT NOT NULL DEFAULT 'guest',
    "is_host_approved" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "identity_verified" BOOLEAN NOT NULL DEFAULT false,
    "identity_verified_at" DATETIME,
    "is_superhost" BOOLEAN NOT NULL DEFAULT false,
    "superhost_since" DATETIME,
    "login_fail_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" DATETIME,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "terms_agreed_at" DATETIME NOT NULL,
    "privacy_agreed_at" DATETIME NOT NULL,
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "suspension_reason" TEXT,
    "suspension_until" DATETIME,
    "withdrawal_requested_at" DATETIME,
    "withdrawn_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_social_accounts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_social_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "device_info" TEXT,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_verifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "document_url" TEXT,
    "verification_code" TEXT,
    "code_expires_at" DATETIME,
    "admin_id" INTEGER,
    "admin_note" TEXT,
    "verified_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_verifications_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_notification_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "host_profiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_holder" TEXT NOT NULL,
    "address" TEXT,
    "response_rate" REAL NOT NULL DEFAULT 0,
    "avg_response_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "total_reservations" INTEGER NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" REAL NOT NULL DEFAULT 0,
    "cancellation_count" INTEGER NOT NULL DEFAULT 0,
    "host_since" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "host_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accommodations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "host_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "accommodation_type" TEXT NOT NULL,
    "space_type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "address_detail" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT NOT NULL DEFAULT 'KR',
    "postal_code" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "bedrooms" INTEGER NOT NULL DEFAULT 1,
    "bathrooms" INTEGER NOT NULL DEFAULT 1,
    "bathrooms_shared" INTEGER NOT NULL DEFAULT 0,
    "max_guests" INTEGER NOT NULL,
    "base_guests" INTEGER NOT NULL,
    "area_sqm" REAL,
    "base_price" REAL NOT NULL,
    "weekend_price" REAL,
    "extra_guest_fee" REAL NOT NULL DEFAULT 0,
    "cleaning_fee" REAL NOT NULL DEFAULT 0,
    "min_nights" INTEGER NOT NULL DEFAULT 1,
    "max_nights" INTEGER NOT NULL DEFAULT 365,
    "checkin_time" TEXT NOT NULL DEFAULT '15:00',
    "checkout_time" TEXT NOT NULL DEFAULT '11:00',
    "checkin_method" TEXT,
    "checkin_guide" TEXT,
    "preparation_days" INTEGER NOT NULL DEFAULT 0,
    "cancellation_policy" TEXT NOT NULL DEFAULT 'moderate',
    "house_rules" TEXT,
    "instant_booking" BOOLEAN NOT NULL DEFAULT false,
    "pet_allowed" BOOLEAN NOT NULL DEFAULT false,
    "parking_type" TEXT NOT NULL DEFAULT 'none',
    "parking_spaces" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "admin_approved_at" DATETIME,
    "admin_id" INTEGER,
    "rejection_reason" TEXT,
    "avg_rating" REAL NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "booking_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "accommodations_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "accommodations_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accommodation_translations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accommodation_id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "house_rules" TEXT,
    "checkin_guide" TEXT,
    "is_auto_translated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "accommodation_translations_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accommodation_id" INTEGER NOT NULL,
    "room_name" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "rooms_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "beds" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "room_id" INTEGER NOT NULL,
    "bed_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "beds_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "amenity_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "display_name_ko" TEXT,
    "display_name_en" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "display_name_ko" TEXT NOT NULL,
    "display_name_en" TEXT,
    "display_name_ja" TEXT,
    "display_name_zh" TEXT,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "amenities_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "amenity_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accommodation_amenities" (
    "accommodation_id" INTEGER NOT NULL,
    "amenity_id" INTEGER NOT NULL,
    "note" TEXT,

    PRIMARY KEY ("accommodation_id", "amenity_id"),
    CONSTRAINT "accommodation_amenities_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "accommodation_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accommodation_photos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accommodation_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "accommodation_photos_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accommodation_tags" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accommodation_id" INTEGER NOT NULL,
    "tag_name" TEXT NOT NULL,
    CONSTRAINT "accommodation_tags_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "seasonal_pricing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accommodation_id" INTEGER NOT NULL,
    "season_name" TEXT,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "price" REAL NOT NULL,
    "weekend_price" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seasonal_pricing_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "custom_date_pricing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accommodation_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "price" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "custom_date_pricing_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "long_stay_discounts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accommodation_id" INTEGER NOT NULL,
    "min_nights" INTEGER NOT NULL,
    "discount_rate" REAL NOT NULL,
    CONSTRAINT "long_stay_discounts_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "availability_calendar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accommodation_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "blocked_reason" TEXT,
    "reservation_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "availability_calendar_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accommodation_edit_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accommodation_id" INTEGER NOT NULL,
    "changed_by" INTEGER NOT NULL,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "accommodation_edit_history_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "accommodation_edit_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reservation_number" TEXT NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "accommodation_id" INTEGER NOT NULL,
    "host_id" INTEGER NOT NULL,
    "checkin_date" DATETIME NOT NULL,
    "checkout_date" DATETIME NOT NULL,
    "nights" INTEGER NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "nightly_rate" REAL NOT NULL,
    "accommodation_fee" REAL NOT NULL,
    "extra_guest_fee" REAL NOT NULL DEFAULT 0,
    "cleaning_fee" REAL NOT NULL DEFAULT 0,
    "long_stay_discount" REAL NOT NULL DEFAULT 0,
    "guest_service_fee" REAL NOT NULL DEFAULT 0,
    "host_service_fee" REAL NOT NULL DEFAULT 0,
    "total_price" REAL NOT NULL,
    "host_payout" REAL NOT NULL,
    "coupon_id" INTEGER,
    "coupon_discount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "status" TEXT NOT NULL DEFAULT 'requested',
    "is_instant_booking" BOOLEAN NOT NULL DEFAULT false,
    "guest_message" TEXT,
    "cancellation_reason" TEXT,
    "cancelled_at" DATETIME,
    "cancelled_by" TEXT,
    "host_response_deadline" DATETIME,
    "host_responded_at" DATETIME,
    "checkin_info" TEXT,
    "cancellation_policy" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reservations_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reservation_status_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reservation_id" INTEGER NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "changed_by" INTEGER,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reservation_status_history_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservation_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reservation_changes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reservation_id" INTEGER NOT NULL,
    "requested_by" INTEGER NOT NULL,
    "original_checkin" DATETIME,
    "original_checkout" DATETIME,
    "original_adults" INTEGER,
    "original_children" INTEGER,
    "new_checkin" DATETIME,
    "new_checkout" DATETIME,
    "new_adults" INTEGER,
    "new_children" INTEGER,
    "price_difference" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "host_response_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reservation_changes_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservation_changes_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reservation_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL,
    "pg_provider" TEXT,
    "pg_transaction_id" TEXT,
    "pg_receipt_url" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "display_amount" REAL,
    "display_currency" TEXT,
    "exchange_rate" REAL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_at" DATETIME,
    "failed_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "payments_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payment_id" INTEGER NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "reason" TEXT,
    "refund_policy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "pg_refund_id" TEXT,
    "requested_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "refunds_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "saved_payment_methods" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "card_last_four" TEXT,
    "card_brand" TEXT,
    "pg_billing_key" TEXT,
    "nickname" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "host_id" INTEGER NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "gross_amount" REAL NOT NULL,
    "commission_rate" REAL NOT NULL,
    "commission_amount" REAL NOT NULL,
    "net_amount" REAL NOT NULL,
    "bank_name" TEXT,
    "account_number" TEXT,
    "account_holder" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduled_date" DATETIME,
    "completed_at" DATETIME,
    "admin_note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "settlements_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "settlements_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "base_currency" TEXT NOT NULL DEFAULT 'KRW',
    "target_currency" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "fetched_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "commission_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "effective_from" DATETIME NOT NULL,
    "effective_to" DATETIME,
    "created_by" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "commission_settings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reservation_id" INTEGER NOT NULL,
    "reviewer_id" INTEGER NOT NULL,
    "reviewee_id" INTEGER NOT NULL,
    "accommodation_id" INTEGER,
    "review_type" TEXT NOT NULL,
    "overall_rating" REAL NOT NULL,
    "content" TEXT NOT NULL,
    "private_feedback" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" DATETIME,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edit_deadline" DATETIME,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "hidden_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reviews_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "review_category_ratings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "review_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    CONSTRAINT "review_category_ratings_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "review_photos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "review_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "review_photos_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "review_replies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "review_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "review_replies_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "review_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "superhost_evaluations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "host_id" INTEGER NOT NULL,
    "evaluation_year" INTEGER NOT NULL,
    "evaluation_quarter" INTEGER NOT NULL,
    "avg_rating" REAL,
    "total_reservations" INTEGER,
    "cancellation_rate" REAL,
    "response_rate" REAL,
    "is_qualified" BOOLEAN NOT NULL DEFAULT false,
    "evaluated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "superhost_evaluations_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conversation_rooms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guest_id" INTEGER NOT NULL,
    "host_id" INTEGER NOT NULL,
    "accommodation_id" INTEGER,
    "reservation_id" INTEGER,
    "last_message_at" DATETIME,
    "last_message_preview" TEXT,
    "is_archived_by_guest" BOOLEAN NOT NULL DEFAULT false,
    "is_archived_by_host" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "conversation_rooms_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "conversation_rooms_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "conversation_rooms_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "conversation_rooms_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "room_id" INTEGER NOT NULL,
    "sender_id" INTEGER,
    "content" TEXT NOT NULL,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "translated_content" TEXT,
    "translated_language" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "conversation_rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "message_images" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_images_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "auto_message_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "host_id" INTEGER NOT NULL,
    "trigger_type" TEXT NOT NULL,
    "message_content" TEXT NOT NULL,
    "trigger_hours_before" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "auto_message_settings_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wishlist_folders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "share_token" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "wishlist_folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "folder_id" INTEGER NOT NULL,
    "accommodation_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wishlist_items_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "wishlist_folders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "wishlist_items_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "reference_type" TEXT,
    "reference_id" INTEGER,
    "channel" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" DATETIME,
    "sent_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reporter_id" INTEGER NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "report_actions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "report_id" INTEGER NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_actions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "report_actions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "author_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "published_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "notices_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notice_translations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "notice_id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    CONSTRAINT "notice_translations_notice_id_fkey" FOREIGN KEY ("notice_id") REFERENCES "notices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "faq_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name_ko" TEXT NOT NULL,
    "name_en" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "faqs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "faq_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "faq_translations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "faq_id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "question" TEXT,
    "answer" TEXT,
    CONSTRAINT "faq_translations_faq_id_fkey" FOREIGN KEY ("faq_id") REFERENCES "faqs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "banners" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "link_url" TEXT,
    "position" TEXT NOT NULL DEFAULT 'main_top',
    "start_date" DATETIME,
    "end_date" DATETIME,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "featured_accommodations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accommodation_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "featured_accommodations_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "featured_regions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "region_name_ko" TEXT NOT NULL,
    "region_name_en" TEXT,
    "image_url" TEXT,
    "search_keyword" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "setting_key" TEXT NOT NULL,
    "setting_value" TEXT NOT NULL,
    "description" TEXT,
    "updated_by" INTEGER,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "banned_words" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "word" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "template_key" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'ko',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "admin_activity_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "admin_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" INTEGER,
    "details" TEXT,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_activity_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "search_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "keyword" TEXT NOT NULL,
    "checkin_date" DATETIME,
    "checkout_date" DATETIME,
    "guests" INTEGER,
    "searched_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "popular_searches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "keyword" TEXT NOT NULL,
    "search_count" INTEGER NOT NULL DEFAULT 0,
    "period_start" DATETIME NOT NULL,
    "period_end" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "reservation_admin_memos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reservation_id" INTEGER NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reservation_admin_memos_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservation_admin_memos_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reservation_nightly_details" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reservation_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "base_price" REAL NOT NULL,
    "applied_price" REAL NOT NULL,
    "price_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reservation_nightly_details_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_devices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "device_token" TEXT NOT NULL,
    "device_type" TEXT NOT NULL,
    "device_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "login_type" TEXT NOT NULL,
    "social_provider" TEXT,
    "ip_address" TEXT,
    "device_info" TEXT,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discount_type" TEXT NOT NULL,
    "discount_value" REAL NOT NULL,
    "min_order_amount" REAL NOT NULL DEFAULT 0,
    "max_discount" REAL,
    "valid_from" DATETIME NOT NULL,
    "valid_to" DATETIME NOT NULL,
    "total_quantity" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "coupon_usages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "coupon_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "discount_amount" REAL NOT NULL,
    "used_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coupon_usages_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "coupon_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "coupon_usages_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "terms_versions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "effective_date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_agreements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "terms_version_id" INTEGER NOT NULL,
    "agreed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    CONSTRAINT "user_agreements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_agreements_terms_version_id_fkey" FOREIGN KEY ("terms_version_id") REFERENCES "terms_versions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accommodation_views" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accommodation_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "view_date" DATETIME NOT NULL,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "accommodation_views_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "accommodation_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accommodation_view_stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accommodation_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "unique_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "accommodation_view_stats_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "host_penalties" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "host_id" INTEGER NOT NULL,
    "reservation_id" INTEGER,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "penalty_action" TEXT NOT NULL,
    "admin_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "host_penalties_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "host_penalties_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "host_penalties_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_social_accounts_provider_provider_user_id_key" ON "user_social_accounts"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_settings_user_id_channel_key" ON "user_notification_settings"("user_id", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "host_profiles_user_id_key" ON "host_profiles"("user_id");

-- CreateIndex
CREATE INDEX "accommodations_host_id_idx" ON "accommodations"("host_id");

-- CreateIndex
CREATE INDEX "accommodations_status_idx" ON "accommodations"("status");

-- CreateIndex
CREATE INDEX "accommodations_accommodation_type_idx" ON "accommodations"("accommodation_type");

-- CreateIndex
CREATE INDEX "accommodations_city_province_idx" ON "accommodations"("city", "province");

-- CreateIndex
CREATE INDEX "accommodations_base_price_idx" ON "accommodations"("base_price");

-- CreateIndex
CREATE INDEX "accommodations_avg_rating_idx" ON "accommodations"("avg_rating");

-- CreateIndex
CREATE UNIQUE INDEX "accommodation_translations_accommodation_id_language_key" ON "accommodation_translations"("accommodation_id", "language");

-- CreateIndex
CREATE INDEX "accommodation_photos_accommodation_id_idx" ON "accommodation_photos"("accommodation_id");

-- CreateIndex
CREATE UNIQUE INDEX "custom_date_pricing_accommodation_id_date_key" ON "custom_date_pricing"("accommodation_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "long_stay_discounts_accommodation_id_min_nights_key" ON "long_stay_discounts"("accommodation_id", "min_nights");

-- CreateIndex
CREATE INDEX "availability_calendar_accommodation_id_date_idx" ON "availability_calendar"("accommodation_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "availability_calendar_accommodation_id_date_key" ON "availability_calendar"("accommodation_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_reservation_number_key" ON "reservations"("reservation_number");

-- CreateIndex
CREATE INDEX "reservations_guest_id_idx" ON "reservations"("guest_id");

-- CreateIndex
CREATE INDEX "reservations_host_id_idx" ON "reservations"("host_id");

-- CreateIndex
CREATE INDEX "reservations_accommodation_id_idx" ON "reservations"("accommodation_id");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- CreateIndex
CREATE INDEX "reservations_checkin_date_checkout_date_idx" ON "reservations"("checkin_date", "checkout_date");

-- CreateIndex
CREATE INDEX "payments_reservation_id_idx" ON "payments"("reservation_id");

-- CreateIndex
CREATE INDEX "settlements_host_id_idx" ON "settlements"("host_id");

-- CreateIndex
CREATE INDEX "settlements_status_idx" ON "settlements"("status");

-- CreateIndex
CREATE INDEX "reviews_accommodation_id_idx" ON "reviews"("accommodation_id");

-- CreateIndex
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_category_ratings_review_id_category_key" ON "review_category_ratings"("review_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "review_replies_review_id_key" ON "review_replies"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "superhost_evaluations_host_id_evaluation_year_evaluation_quarter_key" ON "superhost_evaluations"("host_id", "evaluation_year", "evaluation_quarter");

-- CreateIndex
CREATE INDEX "conversation_rooms_guest_id_idx" ON "conversation_rooms"("guest_id");

-- CreateIndex
CREATE INDEX "conversation_rooms_host_id_idx" ON "conversation_rooms"("host_id");

-- CreateIndex
CREATE INDEX "messages_room_id_created_at_idx" ON "messages"("room_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_folders_share_token_key" ON "wishlist_folders"("share_token");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_folder_id_accommodation_id_key" ON "wishlist_items"("folder_id", "accommodation_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "notice_translations_notice_id_language_key" ON "notice_translations"("notice_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "faq_translations_faq_id_language_key" ON "faq_translations"("faq_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_setting_key_key" ON "system_settings"("setting_key");

-- CreateIndex
CREATE UNIQUE INDEX "banned_words_word_key" ON "banned_words"("word");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_template_key_language_key" ON "email_templates"("template_key", "language");

-- CreateIndex
CREATE INDEX "admin_activity_logs_admin_id_idx" ON "admin_activity_logs"("admin_id");

-- CreateIndex
CREATE INDEX "admin_activity_logs_created_at_idx" ON "admin_activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "search_history_user_id_searched_at_idx" ON "search_history"("user_id", "searched_at");

-- CreateIndex
CREATE INDEX "reservation_admin_memos_reservation_id_idx" ON "reservation_admin_memos"("reservation_id");

-- CreateIndex
CREATE INDEX "reservation_nightly_details_reservation_id_idx" ON "reservation_nightly_details"("reservation_id");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_nightly_details_reservation_id_date_key" ON "reservation_nightly_details"("reservation_id", "date");

-- CreateIndex
CREATE INDEX "user_devices_user_id_idx" ON "user_devices"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_user_id_device_token_key" ON "user_devices"("user_id", "device_token");

-- CreateIndex
CREATE INDEX "login_history_user_id_created_at_idx" ON "login_history"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupon_usages_coupon_id_idx" ON "coupon_usages"("coupon_id");

-- CreateIndex
CREATE INDEX "coupon_usages_user_id_idx" ON "coupon_usages"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "terms_versions_type_version_key" ON "terms_versions"("type", "version");

-- CreateIndex
CREATE INDEX "user_agreements_user_id_idx" ON "user_agreements"("user_id");

-- CreateIndex
CREATE INDEX "accommodation_views_accommodation_id_view_date_idx" ON "accommodation_views"("accommodation_id", "view_date");

-- CreateIndex
CREATE INDEX "accommodation_view_stats_accommodation_id_date_idx" ON "accommodation_view_stats"("accommodation_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "accommodation_view_stats_accommodation_id_date_key" ON "accommodation_view_stats"("accommodation_id", "date");

-- CreateIndex
CREATE INDEX "host_penalties_host_id_idx" ON "host_penalties"("host_id");
