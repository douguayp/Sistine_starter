# SPEC v1.1 — Sistine Compatible
# Can I Eat This? China
## Chinese Menu Dietary Risk Assistant

## 0. Version Notes

This is the latest Sistine-compatible SPEC for Codex planning and implementation.

Major update in v1.1:

- One scan supports up to **3 images**.
- Images may be paper menu photos, menu book photos, restaurant wall menu photos, WeChat / Alipay QR ordering screenshots, H5 ordering screenshots, long screenshots, or dish-page screenshots.
- The system must triage first based on the user’s Food Profile, then group dishes into Better / Ask / Avoid / Unknown.
- The system must not fully translate or deeply analyze every dish by default.
- Deep dish analysis and Ask Staff cards are generated only when requested.

Save this file as:

```text
docs/SPEC_SISTINE.md
```

---

## 1. Product Summary

**Product name:** Can I Eat This? China  
**Product type:** Mobile-first web app built on Sistine Starter  
**Target users:** Foreign travelers in China with allergies, halal/no-pork needs, vegetarian/vegan needs, gluten-free/celiac needs, or food preferences such as not spicy, no cold dishes, no organ meats, and no raw food.

**Core positioning:**

> Scan Chinese menu photos or QR ordering screenshots, identify hidden ingredients and dietary risks, and generate Chinese staff confirmation cards before ordering.

This product is **not** a full menu translator.  
It is a **Chinese menu dietary risk assistant**.

---

## 2. Sistine Architecture Decision

This project uses **Sistine Starter** as the infrastructure base.

Sistine provides production-oriented SaaS infrastructure including:

```text
Next.js App Router
React
TypeScript
Tailwind CSS
PostgreSQL
Drizzle ORM
Better Auth
Creem payment integration
Credits system
Admin dashboard
Internationalization
SEO / marketing pages
Email service
```

The project should reuse these foundations where appropriate, but the product logic must follow this SPEC.

---

## 3. Important Architecture Rule

Sistine is the **starter foundation**, not the product logic.

The product must keep these rules:

```text
Guest first
No forced login in MVP
Food Profile first
Menu triage first
Support up to 3 images per scan
Support paper menu photos and QR ordering screenshots
Qwen-VL Flash for menu image understanding
Pass-based scan credits
Guest + Recovery Code
One-time Pass
No subscription
No auto-renewal
No full menu translation by default
No absolute food safety claims
```

If Sistine default SaaS behavior conflicts with this SPEC, this SPEC wins.

---

## 4. Problem Statement

Foreign travelers in China often struggle to order food safely because Chinese menus are difficult to understand, dish names are not literal, and dishes may contain hidden ingredients such as:

```text
pork
lard
oyster sauce
peanuts
gluten
alcohol / cooking wine
seafood
meat broth
animal fat
organ meats
blood products
bones
raw or cold ingredients
```

In China, many restaurants also use QR-code ordering systems. Users may scan a restaurant QR code with WeChat, Alipay, or another ordering system and see a fully Chinese ordering interface with dish names and images. This creates a realistic pain point:

> The user can see dish names and pictures on their phone, but they still do not know what the dishes contain or whether they fit their dietary restrictions.

Existing translation tools can translate visible text, but they do not reliably answer:

> Can I eat this based on my allergy, religion, or dietary restriction?

The pain is strongest for:

```text
Food allergy users
Gluten-free / celiac users
Muslim / halal / no-pork users
Vegetarian users
Vegan users
Families with children
Travelers who cannot eat spicy, cold, raw, oily, organ-meat, or bone-heavy dishes
```

---

## 5. Proposed Solution

Build a mobile-first web product where the user can:

```text
1. Set a Food Profile.
2. Upload or take up to 3 menu images.
3. Images may be paper menu photos, menu book photos, wall menu photos, QR ordering screenshots, long screenshots, or dish-page screenshots.
4. Use Qwen-VL Flash to extract visible Chinese dish names from all uploaded images.
5. Deduplicate repeated dishes.
6. Match dishes against a 50-dish MVP knowledge base.
7. Use the user’s Food Profile to classify dishes.
8. Group dishes into Better / Ask / Avoid / Unknown.
9. Show compact results first.
10. Let the user tap a dish for deeper analysis.
11. Generate a Chinese Ask Staff card only when requested.
12. Let restaurant staff answer via structured Chinese buttons.
13. Show the user the staff response in English.
```

The product must prioritize **decision-making**, not full translation.

---

## 6. Product Form

MVP form:

```text
Mobile-first web app
Built inside Sistine Starter
No native iOS app
No native Android app
No App Store / Google Play release
```

Later possible:

```text
PWA
Add to Home Screen
Optional login / account sync
```

---

## 7. Tech Stack

Because this project uses Sistine, the tech stack is:

```text
Next.js App Router
React
TypeScript
Tailwind CSS
PostgreSQL
Drizzle ORM
Better Auth, retained but not required for MVP core usage
Qwen-VL Flash
Creem
Vercel
```

Original Supabase assumptions must be removed.  
Database changes should be implemented through Sistine’s PostgreSQL + Drizzle structure, not Supabase SQL.

---

## 8. Authentication Strategy

Sistine includes Better Auth, email/password login, Google OAuth, email verification, and password reset. These can remain in the project, but MVP must not require login for the core flow.

### MVP rule

```text
No forced login.
Guest usage is the default path.
```

Users must be able to do the following without login:

```text
Set Food Profile
Use 5 free preview scans
Buy a Pass
Receive Recovery Code
Restore a Pass using Recovery Code
Use paid scan credits
```

### Not allowed in MVP

```text
Force login before scanning
Force login before purchase
Force Google login
Force email verification inside restaurant usage flow
Block paid usage because user has no account
```

### Optional later

```text
Email backup
Google login
Apple login
Account dashboard
Sync scan history
Bind guest pass to user account
```

---

## 9. Guest + Recovery Code

MVP uses:

```text
Guest + Recovery Code
```

After payment:

```text
Current browser receives device-specific pass_token
User receives Recovery Code
```

The user does not need to enter Recovery Code again on the same browser.

Recovery Code is only for:

```text
Changing device
Changing browser
Clearing browser data
Losing local pass_token
```

### Payment success page copy

```text
Your China Food Pass is active on this device.

You do not need to enter this code again on this phone.

Recovery Code:
CHINA-FOOD-8K29-MP6Q

Save a screenshot of this code.
Use it only if you change device, change browser, or clear browser data.
```

### Security

Do not store Recovery Code in plaintext.

Store only:

```text
recovery_code_hash
```

Daily access uses:

```text
device-specific pass_token
```

not Recovery Code.

---

## 10. Recovery Code Anti-abuse Rules

### Device limits

```text
7-Day Pass: max 2 active devices
30-Day Pass: max 2 active devices
Annual Pass: max 3 active devices
```

### Restore limits

```text
7-Day Pass: max 3 successful restores
30-Day Pass: max 5 successful restores
Annual Pass: max 8 successful restores
```

Restore count means:

> The number of times a Recovery Code is successfully used to activate a pass on a new browser/device or after local data loss.

It does not mean daily usage count.  
It does not mean scan count.

### Abuse copy

```text
This pass has reached the device or restore limit.
Please use the original device or contact support.
```

---

## 11. Food Profile

Before scanning, user sets a Food Profile.

### Quick Setup

```text
Food allergy
No pork
No alcohol
Vegetarian
Vegan
Halal preference
Gluten-free / celiac
Not spicy
```

If user selects Food allergy, show:

```text
Peanut
Tree nuts
Shellfish
Fish
Sesame
Egg
Dairy
Soy
Wheat / gluten
```

### More Preferences

Hidden under:

```text
More preferences
```

Options:

```text
Mild spicy only
No numbing spice
No cold dishes
No raw food
No organ meats
No blood products
No bones
No very oily food
No strong smell
For children
For elderly person
Severe allergy user
```

### Strict vs preference

System must distinguish:

```text
Must avoid
Prefer to avoid
```

Examples:

```text
Peanut allergy = Must avoid
No pork = Must avoid
Gluten-free / celiac = Must avoid
Halal preference = Must avoid / ask carefully
Not spicy = Prefer to avoid
No cold dishes = Prefer to avoid
No bones = Prefer to avoid
```

---

## 12. Multi-image Menu Input

MVP must support up to **3 images per scan**.

### Supported image types

```text
Physical paper menu photo
Menu book photo
Restaurant wall menu photo
WeChat QR ordering screenshot
Alipay QR ordering screenshot
H5 ordering page screenshot
Long screenshot
Dish page screenshot
```

### User guidance

The upload page should clearly explain:

```text
Upload up to 3 menu photos or QR ordering screenshots.
```

Suggested helper copy:

```text
Using a QR menu?

1. Scan the restaurant QR code with WeChat, Alipay, or the restaurant’s ordering system.
2. Open the Chinese ordering page.
3. Take screenshots of the dishes you are considering.
4. Return here and upload up to 3 screenshots.
5. We’ll help you check hidden ingredients and dietary risks.
```

Important UX note:

```text
For large QR menus, screenshot only the dishes you are considering.
Do not try to upload the entire restaurant menu.
```

### Frontend input target

P0 can support single image if needed.  
P1 must support up to 3 images.

Target upload behavior:

```text
User can select 1–3 images.
If user selects more than 3 images, show an error and ask them to remove extra images.
```

Suggested input:

```tsx
<input
  type="file"
  accept="image/*"
  capture="environment"
  multiple
/>
```

Frontend must enforce:

```text
Max 3 images per scan
Max 8MB per image
Allowed image types only
```

---

## 13. Menu Result Design

The product must not show a full translated menu by default.

After scan, show a compact decision summary:

```text
We found 42 dishes.

Based on your food profile:
✅ 6 better options
⚠️ 24 ask before ordering
❌ 10 avoid
❓ 2 unknown
```

### Groups

```text
Better
Ask
Avoid
Unknown
All
```

### Better

Use cautious wording:

```text
Likely better option.
Still confirm with staff if you have a severe allergy.
```

Never say:

```text
Safe
Guaranteed safe
Allergy-free
```

### Ask

Example:

```text
清炒时蔬
Stir-fried vegetables

⚠️ Ask — may use oyster sauce, lard, or chicken powder.
```

### Avoid

Example:

```text
宫保鸡丁
Kung Pao Chicken

❌ Avoid — usually contains peanuts.
```

### Unknown

Example:

```text
本店特色小炒
House special stir-fry

❓ Unknown — ingredients are unclear. Ask staff before ordering.
```

---

## 14. Progressive Disclosure

Each dish has three levels.

### Level 1: Compact card

```text
宫保鸡丁
Kung Pao Chicken
❌ Avoid
🥜 Peanut · 🌾 Gluten risk
```

### Level 2: Expanded detail

Shown after tapping dish:

```text
What it is
Common ingredients
Common seasonings
Taste
Spice level
Risks for your profile
```

### Level 3: Ask Staff

Shown only when user taps:

```text
Ask Staff
```

---

## 15. Ask Staff Feature

Generate a large Chinese card for staff.

Example:

```text
您好，我想确认这道菜：【宫保鸡丁】

我对花生严重过敏。
请问这道菜是否含有花生、花生油、花生酱？
是否和含花生的食物共用锅具？

如果有，或者不确定，请告诉我。谢谢。
```

### Staff structured answers

MVP uses buttons, not voice translation:

```text
不含，可以吃
含有，不能吃
不确定
可以去掉
不能保证不交叉接触
```

After staff taps, show English:

```text
Staff answer:
The staff is not sure.

Recommendation:
Avoid this dish if your allergy is serious.
```

---

## 16. MVP Dish Knowledge Base

MVP uses 50 common Chinese dishes provided by the product owner.

### Recommended data format

P0 can use:

```text
data/dishes-50.json
```

Later P1/P2 can move to database.

### Fields

```text
中文菜名
英文菜名
英文解释
常见原料
常见调味料
口味
辣度
常见过敏原
需确认项
aliases
```

### Matching

If scanned dish matches known dish, use local data first.

Example aliases:

```text
宫保鸡丁
宫爆鸡丁
招牌宫保鸡丁
```

should match:

```text
宫保鸡丁
```

---

## 17. Qwen-VL Flash AI Strategy

Sistine default AI modules may use other AI providers, but this product’s menu scanning must use Qwen-VL Flash.

Do not force the menu scanning flow into Sistine’s default AI chat/image/video modules.

Add a dedicated Qwen module.

Suggested files:

```text
lib/ai/qwen.ts
lib/menu/triage.ts
lib/menu/dish-analysis.ts
app/api/menu-triage/route.ts
app/api/dish-analysis/route.ts
app/api/ask-staff/route.ts
```

---

## 18. Two-stage AI Flow

### Stage 1: Menu Triage

Purpose:

```text
Extract visible Chinese dish names from up to 3 images
Deduplicate repeated dishes
Return compact structured JSON
Group dishes into Better / Ask / Avoid / Unknown
Give one-line reason
Give top 1–3 risk tags
```

Stage 1 must not generate:

```text
Long explanations
Full ingredient lists
Long flavor descriptions
Ask Staff cards
Long allergy explanations
Full menu translation
Deep analysis of every dish
```

### Stage 1 output shape

```ts
type MenuTriageResult = {
  detectedDishes: {
    id: string;
    chineseName: string;
    englishName?: string;
    confidence: "high" | "medium" | "low";
    source: "knowledge_base" | "ai_inferred" | "unknown";
    group: "better" | "ask" | "avoid" | "unknown";
    oneLineReason: string;
    riskTags: string[];
    sourceImageIndex?: number;
  }[];
  summary: {
    totalDishes: number;
    betterCount: number;
    askCount: number;
    avoidCount: number;
    unknownCount: number;
  };
};
```

### Stage 2: Dish Deep Analysis

Only triggered when user taps a dish.

Generate:

```text
Dish explanation
Common ingredients
Common seasonings
Hidden ingredient risks
Taste
Spice level
Personalized dietary risk notes
Ask Staff Chinese confirmation card
```

### Knowledge base priority

If dish is in 50-dish knowledge base:

```text
Use local structured data first.
Do not ask AI to regenerate known dish explanations unless necessary.
```

If unknown:

```text
Use AI inference but mark as lower confidence.
```

Warning:

```text
This dish is not in our verified dish list. The result is AI-inferred. Please confirm with staff.
```

---

## 19. Scan Credit Definition

The user-facing pricing sells Passes.  
Internally, system uses scan credits.

### What counts as one scan?

A scan credit is consumed only when the system successfully returns a structured menu analysis.

Do not consume credit for:

```text
Upload failure
Unreadable image
Network failure
Qwen API error
Timeout
No menu detected
```

### One scan includes

```text
Up to 3 uploaded menu images
Menu triage
Deduplication of repeated dishes
Compact grouping for up to 30 detected dishes
Up to 5 deep dish analyses
Up to 5 Ask Staff cards
```

### Free preview scan

Each free preview scan includes:

```text
Up to 3 images
Menu triage
Up to 5 fully analyzed dishes
1 Ask Staff card
```

### Paid full scan

Each paid scan includes:

```text
Up to 3 images
Menu triage
Compact grouping for up to 30 dishes
Up to 5 deep dish analyses
Up to 5 Ask Staff cards
```

If more than 30 dishes are detected:

```text
Show compact summary first.
Show the most relevant results first.
User selects additional dishes for deep analysis.
Deep analysis of every additional 10 dishes consumes 1 extra scan credit.
```

Result priority when many dishes are detected:

```text
1. Clear Avoid dishes that strongly conflict with the user profile
2. Better options that appear lower risk
3. Ask-before-ordering dishes
4. Unknown dishes
```

---

## 20. Pricing and Access

### Free

```text
5 free preview scans total
No daily reset
No login required
```

### Paid plans

Payment provider:

```text
Creem
```

Plans:

```text
7-Day China Food Pass — $9.90 — 100 scan credits
30-Day China Food Pass — $29.90 — 300 scan credits
Annual China Food Pass — $69.90 — 1000 scan credits
```

No subscription.  
No auto-renewal.  
No lifetime plan.

### Pricing page copy

```text
Choose your China Food Pass

Scan Chinese menu photos or QR ordering screenshots, check hidden ingredients, and show Chinese staff cards during your trip.

7-Day Pass — $9.90
100 menu scans included.
Best for short China trips.

30-Day Pass — $29.90
300 menu scans included.
Best for longer stays.

Annual Pass — $69.90
1000 menu scans included.
Best for frequent China travelers, expats, students, and repeat business travelers.

One-time payment. No subscription.
```

---

## 21. Creem Integration Inside Sistine

Sistine already includes Creem payment and webhook foundations. Reuse the existing Creem infrastructure where possible, but adapt business logic to one-time Passes.

### Checkout metadata

For this product, checkout metadata must include:

```text
guest_id
plan
client_reference_id
kind = one_time_pass
```

### Payment success must do

```text
Verify webhook signature
Ensure idempotency
Create pass
Set plan
Set starts_at
Set expires_at
Set total_scan_credits
Generate recovery_code
Store recovery_code_hash
Generate pass_token
Store pass_token_hash in pass_devices
Redirect / return to payment success page
```

### Payment success must not do

```text
Must not create subscription
Must not require user_id
Must not require login
Must not use auto-renewal
Must not use Sistine default user credits as the primary access system
```

### Refund

On refund:

```text
Set pass.status = refunded
Disable access
```

---

## 22. Fair Use and Cost Control

No unlimited scans.

### Limits

```text
7-Day Pass: 100 total, 30/day hard limit
30-Day Pass: 300 total, 30/day hard limit
Annual Pass: 1000/year, 50/day hard limit, 200/month soft limit
```

### Rate limit by

```text
guest_id
pass_id
device_id
IP address
user agent
```

### Image controls

Before sending to Qwen:

```text
Resize image
Compress image
Limit file size
Reject extremely large images
```

Limits:

```text
Max 3 images per scan
Max 8MB per image
```

### Budget kill switch

Support config:

```text
AI_DAILY_BUDGET_LIMIT
AI_MONTHLY_BUDGET_LIMIT
```

If exceeded:

```text
Pause free scans first
Prioritize paid users
Show friendly message
```

---

## 23. AI Usage Logging

Every Qwen call must be logged.

Fields:

```text
scan_id
guest_id
pass_id
model
image_count
image_widths
image_heights
image_size_kb_total
detected_dish_count
analyzed_dish_count
input_tokens
output_tokens
total_tokens
estimated_cost_usd
success
error_message
created_at
```

Admin should later be able to see:

```text
Average cost
P50 cost
P90 cost
P95 cost
Max cost
Daily cost
Monthly cost
```

This should be separate from Sistine’s default AI generation tracking if the default AI system is not designed for this menu scanning flow.

---

## 24. Data Storage

### Images

Do not store menu images long-term.

Flow:

```text
User uploads up to 3 images
→ Server sends images to Qwen-VL Flash
→ Qwen returns structured result
→ Original images are discarded
```

### Structured results

Store structured analysis result with retention limits.

```text
Anonymous free user:
Browser local storage only

7-Day / 30-Day paid user:
Backend stores latest 20 scans or 30 days

Annual user:
Backend stores latest 50 scans or 90 days
```

---

## 25. Database Tables

Implement these in Sistine’s Drizzle schema.

### passes

```text
id
guest_id
user_id nullable
plan
status
starts_at
expires_at
total_scan_credits
used_scan_credits
recovery_code_hash
provider
provider_checkout_id
provider_payment_id
restored_count
last_restored_at
created_at
updated_at
```

### pass_devices

```text
id
pass_id
device_id_hash
pass_token_hash
created_at
last_seen_at
revoked_at nullable
```

### scan_results

```text
id
guest_id
pass_id nullable
dietary_profile json
structured_result json
image_count
detected_dish_count
analyzed_dish_count
created_at
expires_at
```

### ai_usage_logs

```text
id
scan_id nullable
guest_id nullable
pass_id nullable
model
image_count
image_size_kb_total
detected_dish_count
analyzed_dish_count
input_tokens
output_tokens
total_tokens
estimated_cost_usd
success
error_message nullable
created_at
```

### guest_usage

```text
id
guest_id
device_id_hash
ip_hash
free_scans_used
created_at
updated_at
```

### Optional later: scan_credit_ledger

```text
id
pass_id
guest_id nullable
action
amount
before_balance
after_balance
reason
scan_id nullable
created_at
```

---

## 26. Suggested Routes

Adapt to actual Sistine project structure, but target routes are:

```text
/                         Landing page
/profile                  Food Profile
/scan                     Menu scan flow
/result/[scanId]           Scan result
/ask-staff/[dishId]        Ask Staff card
/pricing                  Pricing, adapt existing Sistine pricing page if present
/payment/success           Payment success
/restore                  Restore Pass
```

If Sistine already has `/pricing`, modify it rather than creating duplicate pricing routes.

---

## 27. Suggested API Routes

```text
POST /api/guest
GET  /api/me/pass
POST /api/checkout/pass
POST /api/restore-pass
POST /api/menu-triage
POST /api/dish-analysis
POST /api/ask-staff
POST /api/webhooks/creem
```

If Sistine already has a Creem webhook route, extend the existing route and branch by:

```text
metadata.kind = one_time_pass
```

Do not create duplicate webhook logic unless necessary.

---

## 28. Error Handling

Required user-facing messages:

```text
Upload failed. Please try again.
You can upload up to 3 images.
Each image must be under 8MB.
Please retake a clearer photo.
We couldn’t detect dish names. Try cropping the menu area.
We found many dishes. Showing the most relevant results first.
Analysis timed out. Please try again.
Connection failed. Please check your network.
Your free preview scans are used up. Choose a pass to continue.
Your pass has expired. Choose a new pass to continue.
This pass has reached the restore limit. Please use the original device or contact support.
```

---

## 29. Safety and Liability

Never say:

```text
Safe to eat
Allergy-free
Guaranteed gluten-free
This dish is halal
This dish is vegan
This dish is safe for celiac users
```

Use:

```text
Likely lower risk
May contain
Likely contains
Ask staff before ordering
Avoid if your allergy is severe
Halal status cannot be guaranteed without restaurant certification
Cross-contamination may still be possible
```

Required disclaimer on result pages:

```text
This tool helps you understand possible ingredients and dietary risks, but it cannot guarantee allergen safety, halal status, kosher status, vegan status, or cross-contamination control. Always confirm with restaurant staff before ordering.
```

Severe allergy warning:

```text
If you have a severe or life-threatening allergy, avoid dishes unless restaurant staff can clearly confirm ingredients and preparation methods.
```

---

## 30. Non-goals

MVP does not do:

```text
Native iOS app
Native Android app
Directly parse restaurant QR codes
Automatically crawl restaurant ordering systems
Real-time voice translation
Restaurant map
Restaurant reviews
Nearby halal / vegan restaurant search
Reservations
Full menu translation by default
Auto-renewal
Subscription
Lifetime plan
Alipay
WeChat Pay
Mandatory email login
Mandatory Google login
Long-term image storage
Food safety certification
Halal / kosher / vegan / gluten-free certification
```

Important clarification:

```text
The product supports screenshots from QR ordering pages.
The product does not directly scan restaurant QR codes or crawl the ordering system.
```

---

## 31. MVP Milestones

### P0 — Sistine base adaptation

```text
Run Sistine locally
Create docs/SPEC_SISTINE.md
Create or update AGENTS.md
Inspect existing auth/payment/credits/db structure
Add Drizzle tables:
passes
pass_devices
guest_usage
scan_results
ai_usage_logs

Implement guest_id
Implement local Food Profile
Implement 5 free preview scan quota model
Implement static Pricing page
Implement Restore Pass page skeleton
Implement upload UI that can later support up to 3 images
Do not connect Qwen yet
Do not connect Creem yet
```

### P1 — Menu scanning core

```text
Add Qwen-VL Flash module
Add /api/menu-triage
Support up to 3 uploaded images per scan
Add data/dishes-50.json
Implement menu photo / QR screenshot upload
Implement dish extraction, deduplication, and triage
Implement Better / Ask / Avoid / Unknown UI
Implement AI usage logging
Do not store original images long-term
```

### P2 — Dish detail and Ask Staff

```text
Implement dish detail
Implement Ask Staff card
Implement staff structured answer buttons
Implement English staff answer explanation
Apply safety disclaimers
```

### P3 — Creem commercial flow

```text
Add /api/checkout/pass
Adapt existing Sistine Creem webhook
Create pass after payment
Generate Recovery Code
Generate pass_token
Activate current browser
Deduct scan credits
Handle refund
```

### P4 — Admin / cost monitoring

```text
AI cost dashboard
Pass management
Scan result viewer
Guest usage viewer
Dish knowledge management
```

---

## 32. Manual Setup Instructions

### 32.1 Save this SPEC

Create:

```text
docs/SPEC_SISTINE.md
```

Paste this full document into that file.

### 32.2 Update AGENTS.md

If AGENTS.md already exists in Sistine, do not replace it. Append a project override section at the end.

Suggested section title:

```md
## Project Override: Can I Eat This? China
```

### 32.3 First Codex prompt

Do not ask Codex to code immediately.

Use:

```text
Please read docs/SPEC_SISTINE.md, AGENTS.md, and the current Sistine project structure.

Do not write code.
Do not modify files.

First output a Sistine adaptation development plan, including:

1. Where auth, payment, credits, database, and AI modules are located in the current project.
2. Which Sistine default features can be reused.
3. Which default logic must be bypassed or disabled.
4. How to implement Guest first.
5. How to implement Guest + Recovery Code.
6. How to implement pass-based scan credits.
7. How to support up to 3 menu images per scan.
8. How to support QR ordering screenshots without directly parsing QR codes.
9. How to integrate Qwen-VL Flash.
10. How to reuse or adapt the existing Creem webhook.
11. Which Drizzle tables need to be added.
12. P0 / P1 / P2 / P3 implementation order.
13. Expected file paths to modify in each phase.
14. Questions that still require product owner confirmation.

Requirements:
- Output plan only.
- Do not write code.
- Do not modify files.
- Mark risks.
- Mark uncertainties.
```

---

## 33. Final Principle

This project can reuse Sistine’s foundation, but it must not be pulled into Sistine’s default SaaS assumptions.

Always preserve:

```text
Guest first
No forced login
One-time Pass
Recovery Code
Scan credits
Up to 3 images per scan
QR ordering screenshot support
Qwen-VL Flash
Food Profile first
Menu triage first
Progressive disclosure
Ask Staff Chinese card
No full menu translation by default
No absolute food safety claims
```
