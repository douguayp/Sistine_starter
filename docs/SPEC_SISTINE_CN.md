# SPEC v1.1 — Sistine 兼容版
# Can I Eat This? China
## 中文菜单饮食风险助手

## 0. 版本说明

这是给 Codex 生成开发计划与后续编程使用的最新版 Sistine 兼容 SPEC。

v1.1 的主要更新：

- 一次 scan 最多支持 **3 张图片**。
- 图片可以是纸质菜单照片、菜单簿照片、餐厅墙上菜单照片、微信/支付宝扫码点单截图、H5 点单截图、长截图、单个菜品页截图。
- 系统必须先根据用户 Food Profile 做初筛，再把菜品分为 Better / Ask / Avoid / Unknown。
- 系统不能默认完整翻译整张菜单。
- 系统不能默认深度分析所有菜。
- 只有用户点击某道菜时，才生成深度分析。
- 只有用户点击 Ask Staff 时，才生成中文确认卡。

保存路径建议：

```text
docs/SPEC_SISTINE_CN.md
```

---

## 1. 产品概述

**产品名称：** Can I Eat This? China  
**产品形态：** 基于 Sistine Starter 的移动端优先网页应用  
**目标用户：** 来中国旅行的外国游客，尤其是有食物过敏、清真/no pork、素食/纯素、gluten-free/celiac、不吃辣、不吃冷菜、不吃内脏、不吃生食等饮食限制的人群。

**核心定位：**

> 用户拍摄中文菜单，或上传扫码点单页面截图后，系统帮助识别菜品、筛选饮食风险、判断隐藏原料，并生成中文确认卡给服务员看。

本产品不是普通菜单翻译器，而是：

> **中文菜单饮食风险助手 + 服务员中文确认卡工具。**

---

## 2. Sistine 架构决策

本项目使用 **Sistine Starter** 作为基础设施底座。

Sistine 提供：

```text
Next.js App Router
React
TypeScript
Tailwind CSS
PostgreSQL
Drizzle ORM
Better Auth
Creem 支付集成
Credits 积分系统
管理后台
国际化
SEO / 营销页
邮件服务
```

但本项目不能完全套用 Sistine 默认 SaaS 逻辑。

本项目核心业务逻辑必须保持：

```text
Guest first
不强制登录
Food Profile first
菜单先初筛
一次 scan 最多 3 张图片
支持纸质菜单照片和扫码点单截图
Qwen-VL Flash 识别中文菜单
pass-based scan credits
Guest + Recovery Code
一次性 Pass
不做订阅
不自动续费
不默认完整翻译菜单
不做绝对食品安全承诺
```

---

## 3. 重要架构原则

Sistine 是基础设施底座，不是产品逻辑本身。

如果 Sistine 默认逻辑与本 SPEC 冲突，以本 SPEC 为准。

尤其要避免被 Sistine 默认 SaaS 模式带偏：

```text
不能强制用户登录后才能使用
不能强制用户登录后才能购买
不能把 Google 登录作为唯一入口
不能默认做订阅
不能默认走 user credits 作为主权限
不能默认使用 Sistine 原有 AI 模块做菜单识别
```

本项目 MVP 的主路径是：

```text
匿名用户进入
→ 设置 Food Profile
→ 上传最多 3 张菜单图片或扫码点单截图
→ 使用免费扫描
→ 购买一次性 Pass
→ 获得 Recovery Code
→ 使用 scan credits
```

---

## 4. 问题陈述

外国游客在中国餐馆点餐时，经常遇到这些困难：

1. **看不懂中文菜单**
   - 菜名不是简单直译。
   - 很多菜名有文化含义，例如鱼香肉丝、蚂蚁上树、夫妻肺片。

2. **不知道菜里真实有什么**
   - 菜名看起来安全，但可能含有隐藏原料。
   - 常见隐藏风险包括：猪肉、猪油、蚝油、花生、麸质、料酒、海鲜、肉汤、动物油、内脏、血制品、骨头、生食、冷菜等。

3. **扫码点单页面全是中文**
   - 中国很多餐厅使用微信、支付宝、H5 或第三方系统扫码点单。
   - 外国游客扫码后看到的往往是中文菜名和菜品图片。
   - 他们可能看得见图，但仍然不知道原料、调味料、过敏原、猪肉/猪油、辣度、清真/素食风险。

4. **普通翻译工具不够**
   - Google Translate / Lens 可以翻译文字。
   - 但无法可靠判断这道菜是否适合某种过敏、宗教饮食或特殊饮食限制。

5. **不会向服务员确认**
   - 用户真正需要的不只是英文解释。
   - 还需要可以直接展示给服务员看的中文确认句。

用户真正的问题不是：

> “这道菜英文叫什么？”

而是：

> “根据我的过敏、宗教饮食或饮食偏好，我到底能不能点这道菜？如果不确定，我该怎么用中文问服务员？”

---

## 5. 解决方案

构建一个移动端优先网页产品，让用户可以：

```text
1. 设置 Food Profile 饮食档案。
2. 拍摄或上传最多 3 张中文菜单相关图片。
3. 图片可以是纸质菜单、菜单簿、墙上菜单、微信/支付宝扫码点单截图、H5 点单截图、长截图或单个菜品页截图。
4. 使用 Qwen-VL Flash 从所有图片中识别可见中文菜名。
5. 对重复菜品去重。
6. 将菜品与 50 道常见中国菜知识库匹配。
7. 根据用户 Food Profile 判断饮食风险。
8. 将菜品分组：
   - Better：相对可考虑
   - Ask：需要询问
   - Avoid：建议避免
   - Unknown：无法判断
9. 默认展示简短分组结果。
10. 用户点击某道菜后，再展示详细解释。
11. 用户点击 Ask Staff 后，生成中文确认卡。
12. 服务员通过中文按钮回答。
13. 系统将服务员回答转换为英文建议。
```

产品优先解决：

```text
我能点什么？
我应该避开什么？
哪些菜需要问服务员？
我要怎么用中文问？
```

而不是：

```text
完整翻译整张菜单
```

---

## 6. 产品形态

MVP 阶段：

```text
移动端优先网页应用
基于 Sistine Starter 开发
不做原生 iOS App
不做原生 Android App
不上架 App Store / Google Play
```

后续可扩展：

```text
PWA
添加到手机桌面
邮箱备份
用户账户同步
后台菜品知识库管理
```

---

## 7. 技术栈

由于使用 Sistine，本项目技术栈为：

```text
Next.js App Router
React
TypeScript
Tailwind CSS
PostgreSQL
Drizzle ORM
Better Auth，保留但 MVP 不强制使用
Qwen-VL Flash
Creem
Vercel
```

原先 SPEC 中的 Supabase 假设需要移除。

所有数据库表结构应写入 Sistine 的 Drizzle schema / migration 中，而不是 Supabase SQL。

---

## 8. 登录策略

Sistine 自带 Better Auth、邮箱登录、Google OAuth、邮箱验证、密码重置等能力。

这些能力可以保留，但 MVP 主流程不能依赖登录。

### 8.1 MVP 规则

```text
不强制登录
Guest 是默认路径
```

用户必须能在不登录的情况下：

```text
设置 Food Profile
使用 5 次免费 Preview Scan
购买 Pass
获得 Recovery Code
使用 Recovery Code 恢复 Pass
使用付费 scan credits
```

### 8.2 MVP 禁止

```text
禁止扫描前强制登录
禁止购买前强制登录
禁止强制 Google 登录
禁止餐馆现场使用时要求邮箱验证
禁止因为没有账号而无法使用已购买 Pass
```

### 8.3 后续可选增强

```text
邮箱备份
Google 登录
Apple 登录
用户中心
扫描历史同步
将 Guest Pass 绑定到登录用户
```

---

## 9. Guest + Recovery Code

MVP 使用：

```text
Guest + Recovery Code
```

用户付款后：

```text
当前浏览器获得 device-specific pass_token
用户获得 Recovery Code
```

同一台设备、同一个浏览器下，用户下次打开网站不需要再次输入 Recovery Code。

Recovery Code 仅用于：

```text
换设备
换浏览器
清除浏览器数据
本地 pass_token 丢失
```

### 9.1 支付成功页文案

```text
Your China Food Pass is active on this device.

You do not need to enter this code again on this phone.

Recovery Code:
CHINA-FOOD-8K29-MP6Q

Save a screenshot of this code.
Use it only if you change device, change browser, or clear browser data.
```

中文理解：

```text
你的 China Food Pass 已经在当前设备激活。

在这台手机上，你不需要再次输入这个恢复码。

Recovery Code:
CHINA-FOOD-8K29-MP6Q

请截图保存。
只有在换设备、换浏览器或清除浏览器数据时才需要使用。
```

### 9.2 安全规则

数据库中不能保存明文 Recovery Code。

只能保存：

```text
recovery_code_hash
```

日常访问使用：

```text
device-specific pass_token
```

而不是 Recovery Code。

---

## 10. Recovery Code 防滥用规则

### 10.1 设备数量限制

```text
7-Day Pass：最多 2 台设备
30-Day Pass：最多 2 台设备
Annual Pass：最多 3 台设备
```

### 10.2 恢复次数限制

```text
7-Day Pass：最多 3 次成功恢复
30-Day Pass：最多 5 次成功恢复
Annual Pass：最多 8 次成功恢复
```

恢复次数指：

> 用户用 Recovery Code 在新设备、新浏览器，或本地数据丢失后重新激活 Pass 的次数。

恢复次数不是每日使用次数。  
恢复次数不是扫描次数。

### 10.3 超限提示

```text
This pass has reached the device or restore limit.
Please use the original device or contact support.
```

中文理解：

```text
这个 Pass 已经达到设备或恢复次数限制。
请使用原设备，或联系客服。
```

---

## 11. Food Profile 饮食档案

用户扫描菜单前，必须先设置 Food Profile。

Food Profile 用于后续筛选菜单和生成个性化风险提示。

### 11.1 快速设置

第一屏展示核心选项：

```text
Food allergy 食物过敏
No pork 不吃猪肉
No alcohol 不吃酒精/料酒
Vegetarian 素食
Vegan 纯素
Halal preference 清真偏好
Gluten-free / celiac 无麸质 / 乳糜泻
Not spicy 不吃辣
```

如果用户选择 Food allergy，则展开：

```text
Peanut 花生
Tree nuts 坚果
Shellfish 甲壳类海鲜
Fish 鱼
Sesame 芝麻
Egg 鸡蛋
Dairy 奶制品
Soy 大豆
Wheat / gluten 小麦 / 麸质
```

### 11.2 更多偏好

隐藏在：

```text
More preferences
```

中。

选项包括：

```text
Mild spicy only 只能微辣
No numbing spice 不要花椒麻味
No cold dishes 不吃冷菜
No raw food 不吃生食
No organ meats 不吃内脏
No blood products 不吃血制品
No bones 不要带骨头
No very oily food 不要太油
No strong smell 不要味道太重
For children 给孩子吃
For elderly person 给老人吃
Severe allergy user 严重过敏用户
```

### 11.3 严格限制 vs 偏好

系统必须区分：

```text
Must avoid 必须避免
Prefer to avoid 尽量避免
```

示例：

```text
花生过敏 = Must avoid
不吃猪肉 = Must avoid
gluten-free / celiac = Must avoid
清真偏好 = Must avoid / ask carefully
不吃辣 = Prefer to avoid
不吃冷菜 = Prefer to avoid
不要带骨头 = Prefer to avoid
```

---

## 12. 多图片菜单输入

MVP 一次 scan 最多支持 **3 张图片**。

### 12.1 支持的图片类型

```text
纸质菜单照片
菜单簿照片
餐厅墙上菜单照片
微信扫码点单截图
支付宝扫码点单截图
H5 点单页面截图
长截图
单个菜品页截图
```

### 12.2 用户引导

上传页需要清楚说明：

```text
Upload up to 3 menu photos or QR ordering screenshots.
```

中文理解：

```text
最多上传 3 张菜单照片或扫码点单截图。
```

建议加入 QR 菜单引导文案：

```text
Using a QR menu?

1. Scan the restaurant QR code with WeChat, Alipay, or the restaurant’s ordering system.
2. Open the Chinese ordering page.
3. Take screenshots of the dishes you are considering.
4. Return here and upload up to 3 screenshots.
5. We’ll help you check hidden ingredients and dietary risks.
```

中文理解：

```text
如果你正在使用扫码点单：

1. 先用微信、支付宝或餐厅点单系统扫描二维码。
2. 打开中文点单页面。
3. 截图你正在考虑点的菜。
4. 回到本网站，最多上传 3 张截图。
5. 我们会帮你检查隐藏原料和饮食风险。
```

重要提示：

```text
For large QR menus, screenshot only the dishes you are considering.
Do not try to upload the entire restaurant menu.
```

中文理解：

```text
如果扫码菜单很大，只截图你正在考虑点的菜。
不要试图上传整家餐厅的全部菜单。
```

### 12.3 前端上传规则

P0 可先支持单图。  
P1 必须支持最多 3 张图。

目标上传行为：

```text
用户可以选择 1–3 张图片
如果超过 3 张，提示用户删除多余图片
```

建议 input：

```tsx
<input
  type="file"
  accept="image/*"
  capture="environment"
  multiple
/>
```

前端必须限制：

```text
一次 scan 最多 3 张图
每张图最多 8MB
只允许图片类型
```

---

## 13. 菜单结果设计

产品默认不展示完整菜单翻译。

扫描后展示决策摘要：

```text
We found 42 dishes.

Based on your food profile:
✅ 6 better options
⚠️ 24 ask before ordering
❌ 10 avoid
❓ 2 unknown
```

### 13.1 分组

```text
Better
Ask
Avoid
Unknown
All
```

### 13.2 Better

表示相对可考虑，但不能承诺绝对安全。

可用文案：

```text
Likely better option.
Still confirm with staff if you have a severe allergy.
```

禁止使用：

```text
Safe
Guaranteed safe
Allergy-free
```

### 13.3 Ask

表示需要询问服务员。

示例：

```text
清炒时蔬
Stir-fried vegetables

⚠️ Ask — may use oyster sauce, lard, or chicken powder.
```

### 13.4 Avoid

表示建议避免。

示例：

```text
宫保鸡丁
Kung Pao Chicken

❌ Avoid — usually contains peanuts.
```

### 13.5 Unknown

表示无法判断。

示例：

```text
本店特色小炒
House special stir-fry

❓ Unknown — ingredients are unclear. Ask staff before ordering.
```

---

## 14. 渐进展开

每道菜分三层展示。

### 第一层：简短卡片

默认展示：

```text
宫保鸡丁
Kung Pao Chicken
❌ Avoid
🥜 Peanut · 🌾 Gluten risk
```

### 第二层：菜品详情

点击菜品后展示：

```text
What it is
Common ingredients
Common seasonings
Taste
Spice level
Risks for your profile
```

### 第三层：Ask Staff

用户点击：

```text
Ask Staff
```

后展示中文确认卡。

---

## 15. Ask Staff 中文确认卡

系统根据菜品和用户 Food Profile 生成中文确认卡。

示例：

```text
您好，我想确认这道菜：【宫保鸡丁】

我对花生严重过敏。
请问这道菜是否含有花生、花生油、花生酱？
是否和含花生的食物共用锅具？

如果有，或者不确定，请告诉我。谢谢。
```

### 15.1 服务员结构化回答

MVP 不做实时语音翻译。

使用中文按钮：

```text
不含，可以吃
含有，不能吃
不确定
可以去掉
不能保证不交叉接触
```

服务员点击后，用户看到英文解释：

```text
Staff answer:
The staff is not sure.

Recommendation:
Avoid this dish if your allergy is serious.
```

---

## 16. MVP 50 道菜知识库

MVP 使用产品方提供的 50 道常见中国菜。

### 16.1 P0 数据形式

P0 阶段可使用静态 JSON 文件：

```text
data/dishes-50.json
```

后续 P1/P2 再迁移到数据库。

### 16.2 字段

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

### 16.3 匹配规则

如果扫描出的菜品命中本地知识库，优先使用本地数据。

例如：

```text
宫保鸡丁
宫爆鸡丁
招牌宫保鸡丁
```

都应尽量匹配到：

```text
宫保鸡丁
```

---

## 17. Qwen-VL Flash AI 策略

Sistine 默认 AI 模块可能使用其他 AI 服务，但本项目菜单扫描必须使用：

```text
Qwen-VL Flash
```

不应强行把菜单扫描流程塞入 Sistine 默认 AI 聊天/图片/视频模块。

建议新增独立模块：

```text
lib/ai/qwen.ts
lib/menu/triage.ts
lib/menu/dish-analysis.ts
app/api/menu-triage/route.ts
app/api/dish-analysis/route.ts
app/api/ask-staff/route.ts
```

---

## 18. 两阶段 AI 流程

### 18.1 Stage 1：Menu Triage 菜单初筛

目标：

```text
从最多 3 张图片中识别中文菜名
对重复菜品去重
返回简短结构化 JSON
按 Better / Ask / Avoid / Unknown 分组
给一句话理由
给 1–3 个风险标签
```

Stage 1 不生成：

```text
长篇菜品解释
完整原料列表
长篇口味描述
Ask Staff 中文卡
长篇过敏风险分析
完整菜单翻译
所有菜的深度分析
```

输出结构：

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

### 18.2 Stage 2：Dish Deep Analysis 单菜深度分析

只有当用户点击某道菜时触发。

生成：

```text
菜品解释
常见原料
常见调味料
隐藏原料风险
口味
辣度
个性化饮食风险说明
Ask Staff 中文确认卡
```

### 18.3 本地知识库优先

如果菜品在 50 道菜知识库中：

```text
优先使用本地结构化数据
不要让 AI 重复生成已知菜品说明
```

如果是未知菜品：

```text
可以使用 AI 推断，但必须标记低置信度
```

提示：

```text
This dish is not in our verified dish list. The result is AI-inferred. Please confirm with staff.
```

---

## 19. Scan Credit 定义

前台卖的是 Pass。  
后台用 scan credits 控制成本。

### 19.1 什么算一次扫描？

只有成功返回结构化菜单分析结果时，才扣一次 scan credit。

以下情况不扣：

```text
上传失败
图片无法识别
网络失败
Qwen API 报错
请求超时
没有检测到菜单
```

### 19.2 一次 scan 包含

```text
最多 3 张菜单相关图片
菜单初筛
重复菜品去重
最多 30 道菜的简短分组结果
最多 5 道菜深度分析
最多 5 张 Ask Staff 卡
```

### 19.3 免费 Preview Scan

每次免费扫描包括：

```text
最多 3 张图片
菜单初筛
最多 5 道菜完整分析
1 张 Ask Staff 卡
```

### 19.4 付费 Full Scan

每次付费扫描包括：

```text
最多 3 张图片
菜单初筛
最多 30 道菜简短分组
最多 5 道菜深度分析
最多 5 张 Ask Staff 卡
```

如果超过 30 道菜：

```text
先展示简短摘要
优先展示最相关结果
用户选择更多菜品后再深度分析
每额外深度分析 10 道菜，消耗 1 个 scan credit
```

菜品很多时的展示优先级：

```text
1. 与用户限制明显冲突的 Avoid 高风险菜
2. 看起来风险较低的 Better 菜
3. 需要问服务员的 Ask 菜
4. Unknown 菜
```

---

## 20. 价格与权限

### 20.1 免费

```text
5 次免费 Preview Scan
不按天重置
无需登录
```

### 20.2 付费套餐

支付服务商：

```text
Creem
```

套餐：

```text
7-Day China Food Pass — $9.90 — 100 scan credits
30-Day China Food Pass — $29.90 — 300 scan credits
Annual China Food Pass — $69.90 — 1000 scan credits
```

不做：

```text
订阅
自动续费
终身套餐
```

### 20.3 付费页文案

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

## 21. Sistine 内的 Creem 集成

Sistine 已有 Creem 支付和 webhook 基础能力，应尽量复用。

但业务逻辑要改为本项目的一次性 Pass。

### 21.1 Checkout metadata

创建 checkout 时必须传：

```text
guest_id
plan
client_reference_id
kind = one_time_pass
```

### 21.2 支付成功后必须做

```text
验证 webhook 签名
保证幂等性
创建 pass
设置 plan
设置 starts_at
设置 expires_at
设置 total_scan_credits
生成 recovery_code
保存 recovery_code_hash
生成 pass_token
保存 pass_token_hash 到 pass_devices
返回支付成功页
```

### 21.3 支付成功后禁止做

```text
不得创建 subscription
不得强制 user_id
不得要求登录
不得自动续费
不得把 Sistine 默认 user credits 作为主权限系统
```

### 21.4 退款

退款后：

```text
设置 pass.status = refunded
禁用访问权限
```

---

## 22. Fair Use 与成本控制

产品不能宣传真正 unlimited scans。

### 22.1 限制

```text
7-Day Pass：100 总次数，30/day 硬限制
30-Day Pass：300 总次数，30/day 硬限制
Annual Pass：1000/year，50/day 硬限制，200/month 软限制
```

### 22.2 限流维度

```text
guest_id
pass_id
device_id
IP address
user agent
```

### 22.3 图片控制

发送给 Qwen 前必须：

```text
压缩图片
缩放图片
限制文件大小
拒绝超大图片
```

限制：

```text
一次 scan 最多 3 张图
每张图最多 8MB
```

### 22.4 成本总开关

支持环境变量或后台配置：

```text
AI_DAILY_BUDGET_LIMIT
AI_MONTHLY_BUDGET_LIMIT
```

超过预算时：

```text
优先暂停免费扫描
优先保障付费用户
展示友好提示
```

---

## 23. AI 使用日志

每次 Qwen 调用都必须记录。

字段：

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

后台后续应能查看：

```text
平均成本
P50 成本
P90 成本
P95 成本
最高成本
每日成本
每月成本
```

这套日志应独立于 Sistine 默认 AI 功能日志。

---

## 24. 数据保存

### 24.1 菜单图片

不长期保存菜单图片。

流程：

```text
用户上传最多 3 张图片
→ 服务端发送给 Qwen-VL Flash
→ Qwen 返回结构化结果
→ 原始图片丢弃
```

### 24.2 结构化结果

只保存结构化分析结果。

```text
匿名免费用户：
只保存在浏览器本地

7-Day / 30-Day 付费用户：
后台保存最近 20 条或 30 天

Annual 用户：
后台保存最近 50 条或 90 天
```

谁先达到限制，就先清理旧记录。

---

## 25. 数据库表

所有表都应写入 Sistine 的 Drizzle schema。

### 25.1 passes

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

### 25.2 pass_devices

```text
id
pass_id
device_id_hash
pass_token_hash
created_at
last_seen_at
revoked_at nullable
```

### 25.3 scan_results

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

### 25.4 ai_usage_logs

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

### 25.5 guest_usage

```text
id
guest_id
device_id_hash
ip_hash
free_scans_used
created_at
updated_at
```

### 25.6 可选：scan_credit_ledger

后续可加，用于审计 scan credits 变化。

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

## 26. 建议路由

具体以 Sistine 当前项目结构为准，但目标路由为：

```text
/                         首页
/profile                  Food Profile
/scan                     菜单扫描流程
/result/[scanId]           扫描结果
/ask-staff/[dishId]        Ask Staff 卡
/pricing                  定价页，优先改造 Sistine 已有 pricing
/payment/success           支付成功页
/restore                  Recovery Code 恢复页
```

如果 Sistine 已有 `/pricing`，优先改造，不要重复新建定价页。

---

## 27. 建议 API 路由

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

如果 Sistine 已有 Creem webhook route，应优先扩展现有 route，并通过：

```text
metadata.kind = one_time_pass
```

区分本项目的一次性 Pass 支付事件。

---

## 28. 错误处理

必须支持以下提示：

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

## 29. 安全与责任边界

禁止说：

```text
Safe to eat
Allergy-free
Guaranteed gluten-free
This dish is halal
This dish is vegan
This dish is safe for celiac users
```

应该使用：

```text
Likely lower risk
May contain
Likely contains
Ask staff before ordering
Avoid if your allergy is severe
Halal status cannot be guaranteed without restaurant certification
Cross-contamination may still be possible
```

结果页必须展示免责声明：

```text
This tool helps you understand possible ingredients and dietary risks, but it cannot guarantee allergen safety, halal status, kosher status, vegan status, or cross-contamination control. Always confirm with restaurant staff before ordering.
```

严重过敏提示：

```text
If you have a severe or life-threatening allergy, avoid dishes unless restaurant staff can clearly confirm ingredients and preparation methods.
```

---

## 30. Non-goals

MVP 不做：

```text
原生 iOS App
原生 Android App
直接解析餐厅二维码
自动爬取餐厅点单系统
实时语音翻译
餐厅地图
餐厅评价
附近清真 / 素食餐厅搜索
预约服务
默认完整菜单翻译
自动续费
订阅
终身套餐
支付宝
微信支付
强制邮箱登录
强制 Google 登录
长期保存菜单图片
食品安全认证
halal / kosher / vegan / gluten-free 认证
```

重要说明：

```text
本产品支持上传扫码点单页面截图。
本产品不直接扫描餐厅二维码，也不爬取点单系统。
```

---

## 31. MVP 阶段拆分

### P0：Sistine 基础适配

```text
跑通 Sistine 原项目
创建 docs/SPEC_SISTINE_CN.md
创建或更新 AGENTS.md
检查现有 auth / payment / credits / db 结构
新增 Drizzle 表：
  passes
  pass_devices
  guest_usage
  scan_results
  ai_usage_logs

实现 guest_id
实现本地 Food Profile
实现 5 次免费扫描 quota 基础逻辑
实现静态 Pricing 页面
实现 Restore Pass 静态页面
实现后续可支持最多 3 张图的上传 UI
不接 Qwen
不接 Creem
不做真实菜单扫描
```

### P1：菜单扫描核心

```text
新增 Qwen-VL Flash 模块
新增 /api/menu-triage
一次 scan 支持最多 3 张上传图片
新增 data/dishes-50.json
实现菜单照片 / 扫码点单截图上传
实现菜名识别、去重和初筛
实现 Better / Ask / Avoid / Unknown 展示
实现 AI 使用日志
不长期保存原始图片
```

### P2：菜品详情与 Ask Staff

```text
实现菜品详情
实现 Ask Staff 中文确认卡
实现服务员中文按钮
实现英文结果解释
加入安全免责声明
```

### P3：Creem 商业闭环

```text
新增 /api/checkout/pass
改造 Sistine 现有 Creem webhook
支付成功创建 pass
生成 Recovery Code
生成 pass_token
当前浏览器激活 Pass
扣减 scan credits
处理退款后禁用 Pass
```

### P4：后台与成本监控

```text
AI 成本后台
Pass 管理
扫描结果查看
Guest 使用记录
菜品知识库管理
```

---

## 32. 手动操作说明

### 32.1 保存本文档

创建：

```text
docs/SPEC_SISTINE_CN.md
```

把本文档完整粘贴进去。

### 32.2 更新 AGENTS.md

如果 Sistine 项目里已经有 AGENTS.md，不要覆盖它。

在现有 AGENTS.md 最后追加一节：

```md
## Project Override: Can I Eat This? China
```

### 32.3 第一次给 Codex 的提示词

不要一开始就让 Codex 写代码。

使用：

```text
请先阅读 docs/SPEC_SISTINE_CN.md、AGENTS.md 和当前 Sistine 项目结构。

不要写代码。
不要修改文件。

请先输出一份 Sistine 适配开发计划，包含：

1. 当前项目中认证、支付、积分、数据库、AI 模块分别位于哪些文件或目录。
2. 哪些 Sistine 默认功能可以复用。
3. 哪些默认逻辑必须绕开或禁用。
4. 如何实现 Guest first。
5. 如何实现 Guest + Recovery Code。
6. 如何实现 pass-based scan credits。
7. 如何支持一次 scan 最多 3 张菜单图片。
8. 如何支持扫码点单页面截图，但不直接解析餐厅二维码。
9. 如何接入 Qwen-VL Flash。
10. 如何复用或改造 Creem webhook。
11. 需要新增哪些 Drizzle 表。
12. P0 / P1 / P2 / P3 实现顺序。
13. 每一阶段预计会修改哪些文件路径。
14. 当前还有哪些问题需要我确认。

要求：
- 只输出开发计划。
- 不要写代码。
- 不要修改文件。
- 标出风险点。
- 标出不确定点。
```

---

## 33. 最终原则

本项目可以复用 Sistine 的底座，但不能被 Sistine 默认 SaaS 逻辑带偏。

必须始终保持：

```text
Guest first
不强制登录
一次性 Pass
Recovery Code
Scan credits
一次 scan 最多 3 张图
支持扫码点单截图
Qwen-VL Flash
Food Profile first
菜单先初筛
渐进展开
Ask Staff 中文卡
不默认完整翻译菜单
不做绝对食品安全承诺
```
