/**
 * Database Seed Script
 * Generates 100 realistic e-commerce customer support tickets
 * with conversation histories, internal notes, and varied statuses.
 *
 * Usage: npm run seed
 */

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Ticket from '../models/Ticket.js';
import Message from '../models/Message.js';

// ─── Seed Data Pools ────────────────────────────────────────────

const customerNames = [
  'Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'James Wilson', 'Priya Patel',
  'David Kim', 'Jessica Thompson', 'Robert Garcia', 'Amanda Lee', 'Christopher Brown',
  'Sophia Martinez', 'Daniel Anderson', 'Olivia Taylor', 'Matthew Thomas', 'Isabella White',
  'Andrew Jackson', 'Emma Davis', 'Ryan Miller', 'Ava Moore', 'Brandon Harris',
  'Mia Clark', 'Tyler Lewis', 'Charlotte Walker', 'Nathan Hall', 'Grace Allen',
  'Kevin Young', 'Lily King', 'Justin Wright', 'Chloe Scott', 'Eric Green',
  'Hannah Baker', 'Steven Adams', 'Zoe Nelson', 'Patrick Hill', 'Natalie Carter',
  'George Mitchell', 'Samantha Perez', 'Brian Roberts', 'Victoria Turner', 'Jason Phillips',
];

const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];

const ticketTemplates = [
  // Billing issues (20)
  {
    title: 'Charged twice for same order',
    category: 'billing',
    tags: ['duplicate-charge', 'payment'],
    messages: [
      { s: 'customer', c: 'Hi, I just noticed I was charged twice for order #ORD-2847. The total was $89.99 but my credit card shows two charges. Can you please look into this?' },
      { s: 'agent', c: 'I\'m sorry about that! Let me pull up your account and investigate the duplicate charge right away.' },
      { s: 'agent', c: 'I can confirm there was a duplicate charge on your account. I\'ve initiated a refund for the extra $89.99. It should appear in 3-5 business days.' },
      { s: 'customer', c: 'Thank you so much! I\'ll keep an eye out for the refund.' },
    ],
  },
  {
    title: 'Refund not received after 2 weeks',
    category: 'billing',
    tags: ['refund', 'delayed'],
    messages: [
      { s: 'customer', c: 'I returned my order two weeks ago and still haven\'t received my refund. The tracking shows it was delivered to your warehouse on the 15th. Order #ORD-3921.' },
      { s: 'agent', c: 'I understand your frustration. Let me check the status of your return and refund.' },
      { s: 'agent', c: 'I can see the return was received but the refund wasn\'t processed due to a system error. I\'ve escalated this to our finance team and expedited your refund of $156.50.' },
      { s: 'customer', c: 'This is really frustrating. Two weeks is way too long. When will I actually get my money back?' },
      { s: 'agent', c: 'I completely understand. The expedited refund should hit your account within 24-48 hours. I\'ve also added a $15 store credit to your account for the inconvenience.' },
    ],
  },
  {
    title: 'Promo code not applying at checkout',
    category: 'billing',
    tags: ['promo-code', 'discount'],
    messages: [
      { s: 'customer', c: 'I\'m trying to use the promo code SUMMER25 but it keeps saying invalid. I got this code from your email newsletter.' },
      { s: 'agent', c: 'Let me check on that promo code for you. Could you tell me what items are in your cart?' },
      { s: 'customer', c: 'I have the wireless headphones and a phone case. Total is about $120.' },
      { s: 'agent', c: 'I found the issue — the SUMMER25 code excludes electronics accessories. However, I can apply a manual 15% discount to your order. Would you like me to do that?' },
    ],
  },
  {
    title: 'Unexpected shipping charge on free shipping order',
    category: 'billing',
    tags: ['shipping-charge', 'free-shipping'],
    messages: [
      { s: 'customer', c: 'My order was supposed to have free shipping since it was over $50 but I was charged $12.99 for shipping. Can you fix this?' },
      { s: 'agent', c: 'I apologize for the billing error. Let me review your order details.' },
    ],
  },
  {
    title: 'Gift card balance showing $0',
    category: 'billing',
    tags: ['gift-card', 'balance'],
    messages: [
      { s: 'customer', c: 'I received a $50 gift card for my birthday but when I try to check the balance online it shows $0. The card number is GC-8847291. It was purchased just last week.' },
      { s: 'agent', c: 'Let me look into your gift card right away. Can you also send me a photo of the gift card so I can verify the details?' },
      { s: 'customer', c: 'Sure, I just emailed the photo to your support address.' },
      { s: 'agent', c: 'Thank you. I found the issue — the card wasn\'t activated at the point of sale. I\'ve manually activated it and your $50 balance is now available.' },
    ],
  },
  {
    title: 'Subscription being charged after cancellation',
    category: 'billing',
    tags: ['subscription', 'cancellation', 'recurring-charge'],
    messages: [
      { s: 'customer', c: 'I cancelled my premium subscription last month but I was just charged $14.99 again. I have the cancellation confirmation email. This is unacceptable!' },
      { s: 'agent', c: 'I sincerely apologize for this error. Let me review your subscription history immediately.' },
      { s: 'customer', c: 'I want a full refund and I want to make sure this doesn\'t happen again next month.' },
      { s: 'agent', c: 'I\'ve confirmed your cancellation and processed the refund of $14.99. I\'ve also put a block on any future charges. You\'ll receive a confirmation email shortly.' },
    ],
  },
  {
    title: 'Invoice discrepancy on business account',
    category: 'billing',
    tags: ['invoice', 'business-account'],
    messages: [
      { s: 'customer', c: 'The invoice for our company order doesn\'t match the quoted price. We were quoted $2,450 but the invoice shows $2,890. Reference: QUO-2024-0892.' },
      { s: 'agent', c: 'I\'ll look into the quote and invoice discrepancy right away. This should not have happened.' },
    ],
  },
  {
    title: 'Currency conversion fee on international order',
    category: 'billing',
    tags: ['international', 'currency', 'fees'],
    messages: [
      { s: 'customer', c: 'I placed an order from Canada and was surprised by a 5% currency conversion fee that wasn\'t mentioned during checkout. This adds $23 to my order.' },
    ],
  },
  {
    title: 'Payment declined but order went through',
    category: 'billing',
    tags: ['payment', 'order-status'],
    messages: [
      { s: 'customer', c: 'I got a payment declined notification but also received an order confirmation. My bank shows the charge went through. What\'s happening with my order? #ORD-5521' },
      { s: 'agent', c: 'That sounds confusing! Let me check both your payment status and order status to clear this up.' },
      { s: 'agent', c: 'Your payment actually went through successfully. The declined notification was sent in error due to a brief processing delay. Your order is confirmed and being prepared for shipping.' },
      { s: 'customer', c: 'Okay, that\'s a relief. But you should fix that — it really freaked me out.' },
    ],
  },
  {
    title: 'Want to change payment method on existing order',
    category: 'billing',
    tags: ['payment-method', 'order-change'],
    messages: [
      { s: 'customer', c: 'I accidentally used my old credit card for order #ORD-6632. Can I switch the payment to my new Visa ending in 4421?' },
      { s: 'agent', c: 'I\'d be happy to help! Since the order hasn\'t been processed yet, I can update the payment method. Let me do that for you now.' },
    ],
  },
  // Technical issues (20)
  {
    title: 'App crashes when opening product page',
    category: 'technical',
    tags: ['app-crash', 'mobile', 'bug'],
    messages: [
      { s: 'customer', c: 'Your mobile app keeps crashing every time I try to open any product page. I\'m on iPhone 15 with iOS 18. I\'ve tried reinstalling but same issue.' },
      { s: 'agent', c: 'I\'m sorry for the trouble. Can you tell me which version of our app you\'re running? You can find this in Settings > About.' },
      { s: 'customer', c: 'Version 4.2.1. It was working fine until your last update.' },
      { s: 'agent', c: 'Thank you. We\'re aware of a bug in 4.2.1 affecting iOS 18 devices. Our engineering team has a fix ready — version 4.2.2 should be available in the App Store within 24 hours. In the meantime, you can use our mobile website as a workaround.' },
    ],
  },
  {
    title: 'Cannot reset password - reset email not arriving',
    category: 'technical',
    tags: ['password', 'email', 'login'],
    messages: [
      { s: 'customer', c: 'I\'ve been trying to reset my password for the past hour. I click "Forgot Password" and enter my email but never receive the reset link. I\'ve checked spam folder too.' },
      { s: 'agent', c: 'Let me check if the emails are being sent to your address. What email did you use to register?' },
      { s: 'customer', c: 'It\'s mike.chen@gmail.com' },
      { s: 'agent', c: 'I can see the reset emails are being sent but they\'re bouncing. It appears there may be a typo in your registered email — we have it as mike.chen@gmal.com. I\'ve corrected it and sent a new reset link.' },
      { s: 'customer', c: 'Oh wow, that\'s been wrong this whole time? Thanks for catching that. Got the email now!' },
    ],
  },
  {
    title: 'Website showing 500 error on checkout',
    category: 'technical',
    tags: ['500-error', 'checkout', 'website'],
    messages: [
      { s: 'customer', c: 'Every time I try to complete checkout I get a "500 Internal Server Error" page. I\'ve tried different browsers and it\'s the same. My cart has 3 items worth about $200.' },
      { s: 'agent', c: 'I\'m so sorry about this! This is a known issue we\'re working on. Can I help you place the order manually?' },
      { s: 'customer', c: 'Yes please! I need these items by Friday.' },
    ],
  },
  {
    title: 'Search function not returning relevant results',
    category: 'technical',
    tags: ['search', 'functionality'],
    messages: [
      { s: 'customer', c: 'When I search for "wireless mouse" I get results for mouse pads and keyboards but not actual wireless mice. Your search seems broken.' },
      { s: 'agent', c: 'Thank you for reporting this. I\'ll pass this along to our product team. In the meantime, try searching with quotes: "wireless mouse" — that should help filter results better.' },
    ],
  },
  {
    title: 'Two-factor authentication code not working',
    category: 'technical',
    tags: ['2fa', 'authentication', 'login'],
    messages: [
      { s: 'customer', c: 'My 2FA codes from Google Authenticator stopped working after I got a new phone. I can\'t log into my account now and I have an order I need to track.' },
      { s: 'agent', c: 'I understand the urgency. For security, I\'ll need to verify your identity before we can reset 2FA. Can you provide your order number and the last 4 digits of the card on file?' },
      { s: 'customer', c: 'Order #ORD-7721, card ending in 8834.' },
      { s: 'agent', c: 'Verified! I\'ve disabled 2FA on your account. You can log in now and set up a new 2FA device from your security settings. Your order is currently in transit.' },
    ],
  },
  {
    title: 'Images not loading on product listings',
    category: 'technical',
    tags: ['images', 'broken', 'website'],
    messages: [
      { s: 'customer', c: 'None of the product images are loading on your website. I just see broken image icons everywhere. Makes it impossible to shop. Using Chrome on Windows.' },
    ],
  },
  {
    title: 'Order tracking page shows wrong information',
    category: 'technical',
    tags: ['tracking', 'bug', 'order'],
    messages: [
      { s: 'customer', c: 'My order tracking page shows my package was delivered yesterday, but I never received anything. The address shown on tracking is completely wrong — it\'s not even my city!' },
      { s: 'agent', c: 'That\'s very concerning. Let me investigate this immediately. Can you confirm your order number and shipping address?' },
      { s: 'customer', c: 'Order #ORD-4412. My address is 456 Oak Street, Portland, OR 97201. The tracking shows it was delivered to some address in Chicago!' },
      { s: 'agent', c: 'I see the issue — there was a shipping label error. I\'ve contacted the courier and opened a lost package claim. We\'re also shipping a replacement to your correct address with expedited delivery at no extra cost.' },
      { s: 'customer', c: 'Thank you for taking this seriously. When should I expect the replacement?' },
    ],
  },
  {
    title: 'Wishlist items disappearing after logout',
    category: 'technical',
    tags: ['wishlist', 'bug', 'session'],
    messages: [
      { s: 'customer', c: 'I added about 15 items to my wishlist last night. When I logged in today, they\'re all gone. This has happened before too. Is my wishlist not being saved?' },
      { s: 'agent', c: 'I\'m sorry about that! This might be related to our recent database migration. Let me check your account history.' },
    ],
  },
  {
    title: 'Mobile app notifications not working',
    category: 'technical',
    tags: ['notifications', 'mobile', 'push'],
    messages: [
      { s: 'customer', c: 'I\'m not receiving any push notifications from your app even though they\'re enabled in both the app settings and my phone settings. Android 14, Samsung Galaxy S24.' },
    ],
  },
  {
    title: 'Cart quantity changes on its own',
    category: 'technical',
    tags: ['cart', 'bug', 'quantity'],
    messages: [
      { s: 'customer', c: 'I keep setting the quantity to 2 for an item in my cart, but when I go to checkout it changes back to 1. Very annoying — I\'ve tried multiple times.' },
      { s: 'agent', c: 'That does sound frustrating. Are you by any chance using a browser extension like an ad blocker that might be interfering with the page?' },
      { s: 'customer', c: 'I do have uBlock Origin. Could that be causing it?' },
      { s: 'agent', c: 'Yes, in some cases ad blockers can interfere with our cart functionality. Try adding our site to your allowlist and the issue should resolve. We\'re also working on a fix to prevent this conflict.' },
    ],
  },
  // Shipping issues (20)
  {
    title: 'Package shows delivered but not received',
    category: 'shipping',
    tags: ['missing-package', 'delivery'],
    messages: [
      { s: 'customer', c: 'The tracking says my package was delivered at 2pm today but it\'s not at my door, in the mailbox, or with any neighbors. Order #ORD-8834.' },
      { s: 'agent', c: 'I\'m sorry to hear that. Sometimes packages are marked as delivered slightly before the actual drop-off. Can we wait 24 hours? If it still hasn\'t arrived, I\'ll immediately file a claim and send a replacement.' },
      { s: 'customer', c: 'Fine, I\'ll wait. But this is the second time this has happened with your deliveries.' },
    ],
  },
  {
    title: 'Order stuck in "processing" for 5 days',
    category: 'shipping',
    tags: ['processing', 'delayed', 'order-status'],
    messages: [
      { s: 'customer', c: 'I placed order #ORD-9102 five days ago and it still says "Processing." Every other time I\'ve ordered, it ships within 1-2 days. What\'s going on?' },
      { s: 'agent', c: 'I apologize for the delay. Let me check what\'s causing the holdup on your order.' },
      { s: 'agent', c: 'I found the issue — one item in your order (the ceramic planter) is temporarily out of stock at our fulfillment center. Would you like us to ship the rest of your order now and send the planter separately when it\'s back in stock, or would you prefer to wait?' },
      { s: 'customer', c: 'Just ship what you have now. I need the other items. Cancel the planter and refund me for it.' },
    ],
  },
  {
    title: 'Wrong item delivered',
    category: 'shipping',
    tags: ['wrong-item', 'fulfillment-error'],
    messages: [
      { s: 'customer', c: 'I ordered a blue XL hoodie but received a red medium t-shirt. This is nothing close to what I ordered. Order #ORD-1156.' },
      { s: 'agent', c: 'I\'m so sorry about this mix-up! That\'s completely our error. I\'m going to ship the correct blue XL hoodie to you today with express shipping at no charge. You don\'t need to return the t-shirt.' },
      { s: 'customer', c: 'Okay thank you. I needed the hoodie for a trip this weekend.' },
      { s: 'agent', c: 'I understand the urgency. With express shipping, you should receive it by Thursday. I\'ve also added a 20% discount code to your account for the inconvenience: SORRY20.' },
    ],
  },
  {
    title: 'Need to change shipping address before delivery',
    category: 'shipping',
    tags: ['address-change', 'pre-delivery'],
    messages: [
      { s: 'customer', c: 'I just realized I shipped to my old address! Can you change the delivery address for order #ORD-2290? I moved last month.' },
      { s: 'agent', c: 'Let me check if the package has shipped yet. What\'s the new address?' },
      { s: 'customer', c: '789 Maple Drive, Apt 4B, Austin, TX 78701' },
    ],
  },
  {
    title: 'Package damaged during shipping',
    category: 'shipping',
    tags: ['damaged', 'packaging'],
    messages: [
      { s: 'customer', c: 'My order arrived but the box was completely crushed and the items inside are damaged. The glass vase is shattered and the picture frame is bent. I paid $85 for these.' },
      { s: 'agent', c: 'I\'m so sorry about the damage! That\'s unacceptable. Could you send photos of the damaged items and packaging? I\'ll process a full replacement immediately.' },
      { s: 'customer', c: 'I\'ve attached 3 photos showing the damage. This was supposed to be a gift.' },
      { s: 'agent', c: 'Thank you for the photos. I can see the damage clearly. I\'ve ordered replacements with extra protective packaging, and they\'ll ship today with express delivery. We\'re also refunding the full order amount as an apology. Please recycle or dispose of the damaged items.' },
      { s: 'customer', c: 'Wow, refund AND replacements? That\'s very generous. Thank you!' },
    ],
  },
  {
    title: 'International shipping taking over 3 weeks',
    category: 'shipping',
    tags: ['international', 'slow-shipping', 'customs'],
    messages: [
      { s: 'customer', c: 'I ordered from Australia 3 weeks ago and the tracking hasn\'t updated in 10 days. It just says "In Transit." Is my package lost?' },
      { s: 'agent', c: 'International shipments can sometimes be delayed at customs. Let me check the detailed tracking for your package.' },
      { s: 'agent', c: 'Your package appears to be held at customs in Melbourne. This sometimes happens with new shipments to a country. It should clear within 3-5 business days. I\'ll set up automatic tracking notifications so you\'re updated as soon as there\'s movement.' },
    ],
  },
  {
    title: 'Request for expedited shipping upgrade',
    category: 'shipping',
    tags: ['upgrade', 'expedited'],
    messages: [
      { s: 'customer', c: 'I placed order #ORD-3380 with standard shipping but now I need it sooner for a birthday party this Saturday. Can I upgrade to express shipping?' },
      { s: 'agent', c: 'Let me check if your order has been picked up by the carrier yet. If not, we should be able to upgrade it.' },
    ],
  },
  {
    title: 'Partial order received - items missing',
    category: 'shipping',
    tags: ['missing-items', 'partial-order'],
    messages: [
      { s: 'customer', c: 'I ordered 4 items but only received 2 in the package. The packing slip shows all 4 but the yoga mat and resistance bands are missing from the box.' },
      { s: 'agent', c: 'I\'m sorry about the incomplete order. Let me check if the missing items were shipped separately.' },
      { s: 'agent', c: 'It looks like the yoga mat and resistance bands are being shipped from a different warehouse. You should receive a separate package with tracking #TRK-889244 within 2-3 days.' },
      { s: 'customer', c: 'Okay, would have been nice to know that upfront. Thanks for checking.' },
    ],
  },
  {
    title: 'Package returned to sender without reason',
    category: 'shipping',
    tags: ['returned', 'delivery-failure'],
    messages: [
      { s: 'customer', c: 'My package was apparently returned to your warehouse without even attempting delivery. I was home all day! No missed delivery notice either. Order #ORD-6678.' },
      { s: 'agent', c: 'That\'s very strange. Let me contact the carrier to understand why this happened and arrange re-delivery immediately.' },
    ],
  },
  {
    title: 'Requesting delivery to a PO Box',
    category: 'shipping',
    tags: ['po-box', 'delivery-restriction'],
    messages: [
      { s: 'customer', c: 'Can you ship to a PO Box? I live in a rural area and that\'s my only option for receiving mail.' },
      { s: 'agent', c: 'We can ship to PO Boxes via USPS for orders under 20 lbs. However, items shipped via FedEx or UPS cannot be delivered to PO Boxes. What items are you looking to order?' },
    ],
  },
  // Account issues (15)
  {
    title: 'Account locked after multiple login attempts',
    category: 'account',
    tags: ['locked', 'login', 'security'],
    messages: [
      { s: 'customer', c: 'I forgot my password and tried a few times. Now my account is locked and says to contact support. My email is emily.r@yahoo.com.' },
      { s: 'agent', c: 'I can help unlock your account. For security, can you verify the phone number associated with your account?' },
      { s: 'customer', c: 'It should be 555-0147.' },
      { s: 'agent', c: 'Verified! I\'ve unlocked your account and sent a password reset link to your email. The lockout will be cleared immediately.' },
    ],
  },
  {
    title: 'Need to update email address on account',
    category: 'account',
    tags: ['email-change', 'profile'],
    messages: [
      { s: 'customer', c: 'I need to change my email address from my old work email to my personal email. The current email on file is j.wilson@oldcompany.com and I want to change it to james.wilson@gmail.com.' },
      { s: 'agent', c: 'I can help with that. For security, I\'ll need to verify your identity first. Can you confirm your shipping address and the last order you placed?' },
      { s: 'customer', c: 'Sure. Shipping address is 123 Main St, Seattle, WA 98101. Last order was a standing desk last month.' },
      { s: 'agent', c: 'Verified! I\'ve updated your email to james.wilson@gmail.com. You\'ll receive a confirmation at both email addresses.' },
    ],
  },
  {
    title: 'Delete my account and all data',
    category: 'account',
    tags: ['deletion', 'privacy', 'gdpr'],
    messages: [
      { s: 'customer', c: 'I want to delete my account and all associated data per my rights under GDPR. My account email is sophia.m@protonmail.com.' },
      { s: 'agent', c: 'I understand your request. We take data privacy seriously. I\'ll initiate the account deletion process. Please note this is irreversible and all order history, saved addresses, and preferences will be permanently deleted within 30 days.' },
      { s: 'customer', c: 'That\'s fine. Please proceed with the deletion.' },
    ],
  },
  {
    title: 'Loyalty points not credited from recent purchase',
    category: 'account',
    tags: ['loyalty', 'points', 'rewards'],
    messages: [
      { s: 'customer', c: 'I made a purchase of $250 last week but my loyalty points weren\'t credited. I should have received 500 points. Order #ORD-4488.' },
      { s: 'agent', c: 'Let me check your rewards account. Points usually take 48 hours to appear after delivery confirmation.' },
      { s: 'agent', c: 'I see the issue — your order was placed as a guest checkout, which doesn\'t earn points. I\'ve manually credited 500 points to your account. In the future, make sure you\'re logged in when placing orders!' },
      { s: 'customer', c: 'Oh I didn\'t realize that. Thank you for adding the points manually!' },
    ],
  },
  {
    title: 'Unauthorized purchase on my account',
    category: 'account',
    tags: ['fraud', 'unauthorized', 'security'],
    messages: [
      { s: 'customer', c: 'There\'s an order on my account that I didn\'t place! Order #ORD-7710 for $342.00. Someone might have hacked my account. I need this canceled and investigated immediately!' },
      { s: 'agent', c: 'I\'m taking this very seriously. I\'ve immediately put a hold on order #ORD-7710 to prevent it from shipping. Let me secure your account right away.' },
      { s: 'agent', c: 'I\'ve done the following: 1) Cancelled the unauthorized order, 2) Forced a password reset on your account, 3) Revoked all active sessions, 4) Flagged the payment for refund investigation. You\'ll receive a new temporary password via email.' },
      { s: 'customer', c: 'Thank you for acting quickly. Should I also contact my bank?' },
      { s: 'agent', c: 'Yes, I\'d recommend contacting your bank to report the unauthorized charge and possibly request a new card. I\'ve also enabled enhanced security alerts on your account.' },
    ],
  },
  {
    title: 'Merge two duplicate accounts',
    category: 'account',
    tags: ['duplicate', 'merge'],
    messages: [
      { s: 'customer', c: 'I have two accounts — one with my Gmail and one with my old Hotmail. Can you merge them? I want to keep the Gmail one but transfer my order history from the other.' },
    ],
  },
  {
    title: 'Cannot update shipping address in profile',
    category: 'account',
    tags: ['address', 'profile', 'bug'],
    messages: [
      { s: 'customer', c: 'The "Save" button does nothing when I try to update my shipping address in my profile settings. I\'m using Firefox on Mac.' },
      { s: 'agent', c: 'This sounds like a browser compatibility issue. Can you try using Chrome or Safari? In the meantime, I can update your address manually if you provide the new one.' },
    ],
  },
  {
    title: 'Account shows different order history than expected',
    category: 'account',
    tags: ['order-history', 'missing-orders'],
    messages: [
      { s: 'customer', c: 'I can only see orders from this year in my account. I\'ve been a customer since 2022 and need to find an order from November 2023 for a warranty claim.' },
      { s: 'agent', c: 'Order history defaults to showing the current year. You can use the date filter to select 2023. However, I can also pull up the order directly. Do you remember any details about it?' },
      { s: 'customer', c: 'It was a blender, around $80. Purchased in late November.' },
      { s: 'agent', c: 'Found it! Order #ORD-1893, purchased November 22, 2023 — NutriBullet Pro Blender for $79.99. Would you like me to send the receipt and warranty information to your email?' },
    ],
  },
  {
    title: 'Need to add a secondary email to account',
    category: 'account',
    tags: ['email', 'profile', 'settings'],
    messages: [
      { s: 'customer', c: 'Is it possible to add a backup email to my account? I want order notifications to also go to my spouse.' },
    ],
  },
  {
    title: 'Account tier not upgrading despite qualifying purchases',
    category: 'account',
    tags: ['tier', 'rewards', 'upgrade'],
    messages: [
      { s: 'customer', c: 'I\'ve spent over $1000 this year which should qualify me for Gold tier status, but my account still shows Silver. When does the upgrade happen?' },
      { s: 'agent', c: 'Great question! Tier upgrades are processed on the 1st of each month. Based on your spending, you\'ll be upgraded to Gold on the 1st. In the meantime, I can manually upgrade you right now if you\'d like.' },
      { s: 'customer', c: 'Yes please! I want to take advantage of the free shipping benefit for Gold members.' },
      { s: 'agent', c: 'Done! Your account is now Gold tier. You\'ll enjoy free standard shipping on all orders, early access to sales, and 2x points on all purchases. Welcome to Gold!' },
    ],
  },
  // General / Product issues (25)
  {
    title: 'Product quality doesn\'t match description',
    category: 'general',
    tags: ['quality', 'product', 'complaint'],
    messages: [
      { s: 'customer', c: 'The "premium leather wallet" I bought is clearly not real leather. It\'s peeling after just 2 weeks of use and smells like plastic. I paid $65 for this. Very disappointed.' },
      { s: 'agent', c: 'I\'m really sorry to hear about your experience. That\'s not the quality we aim for. I\'d like to offer you a full refund and a replacement from our verified leather collection.' },
      { s: 'customer', c: 'I want a refund, not a replacement. I don\'t trust the product descriptions anymore.' },
      { s: 'agent', c: 'I completely understand. I\'ve processed a full refund of $65. You don\'t need to return the wallet. I\'ve also reported this product listing for review by our quality team.' },
    ],
  },
  {
    title: 'Size guide inaccurate for clothing line',
    category: 'general',
    tags: ['sizing', 'clothing', 'returns'],
    messages: [
      { s: 'customer', c: 'I ordered a Medium based on your size chart (chest 38-40") but the shirt fits like a Small. I measured the shirt and the chest is only 36". Your size guide is wrong.' },
      { s: 'agent', c: 'Thank you for the detailed feedback! That\'s valuable information. I\'ve flagged this with our merchandising team. Can I send you a Large at no charge to try?' },
      { s: 'customer', c: 'Yes, and I\'d like a return label for the Medium please.' },
    ],
  },
  {
    title: 'Looking for a product recommendation',
    category: 'general',
    tags: ['recommendation', 'inquiry'],
    messages: [
      { s: 'customer', c: 'I\'m looking for a good pair of noise-canceling headphones for working from home. Budget is around $150. What do you recommend?' },
      { s: 'agent', c: 'Great choice for WFH! At that price point, I\'d recommend the SoundPro NC200 ($139) or the AudioTech QuietMax ($149). Both have excellent noise cancellation, 30+ hour battery, and comfortable for all-day wear. The QuietMax has slightly better bass if you also use them for music.' },
      { s: 'customer', c: 'The AudioTech QuietMax sounds perfect. Does it come in any other colors besides black?' },
      { s: 'agent', c: 'Yes! It comes in Navy Blue and Sage Green in addition to Black. Would you like me to help you place an order?' },
    ],
  },
  {
    title: 'Requesting bulk order discount',
    category: 'general',
    tags: ['bulk', 'discount', 'business'],
    messages: [
      { s: 'customer', c: 'Our company wants to order 50 units of the ErgoDesk Pro standing desk for our new office. Do you offer volume discounts for orders this size?' },
      { s: 'agent', c: 'Absolutely! For orders of 25+ units, we offer tiered discounts. For 50 units, you\'d qualify for 18% off the retail price. I\'ll connect you with our B2B sales team who can prepare a formal quote.' },
    ],
  },
  {
    title: 'Product arrived but manual/instructions missing',
    category: 'general',
    tags: ['instructions', 'assembly', 'missing'],
    messages: [
      { s: 'customer', c: 'I received my bookshelf but there are no assembly instructions in the box. There are about 40 pieces and I have no idea how to put it together.' },
      { s: 'agent', c: 'I\'m sorry about the missing instructions! I\'ll email you a PDF of the assembly guide right away. We also have a video tutorial on our YouTube channel for this model — I\'ll send you the link too.' },
      { s: 'customer', c: 'The video would be really helpful actually. Please send both!' },
    ],
  },
  {
    title: 'Item out of stock - when will it be available?',
    category: 'general',
    tags: ['out-of-stock', 'availability', 'waitlist'],
    messages: [
      { s: 'customer', c: 'The Ceramic Plant Pot Set in Terracotta has been out of stock for weeks now. Do you know when it will be restocked? It\'s the perfect gift for my mom.' },
      { s: 'agent', c: 'That\'s one of our most popular items! Our next shipment is expected to arrive around the 20th. Would you like me to add you to our notification list so you get an alert as soon as it\'s back?' },
      { s: 'customer', c: 'Yes please! My mom\'s birthday is on the 25th so that would be cutting it close.' },
    ],
  },
  {
    title: 'Return policy question for electronics',
    category: 'general',
    tags: ['returns', 'policy', 'electronics'],
    messages: [
      { s: 'customer', c: 'What\'s your return policy for electronics? I bought a tablet a week ago and I\'m not sure I want to keep it.' },
      { s: 'agent', c: 'Electronics have a 30-day return window from the date of delivery. The item must be in its original condition with all accessories and packaging. We\'ll provide a prepaid return label. Once we receive and inspect the item, the refund is processed within 3-5 business days.' },
    ],
  },
  {
    title: 'Product warranty claim - screen flickering',
    category: 'technical',
    tags: ['warranty', 'defect', 'monitor'],
    messages: [
      { s: 'customer', c: 'My 27" monitor from your store has started flickering randomly after 3 months. It has a 1-year warranty. How do I file a claim? Order #ORD-3310.' },
      { s: 'agent', c: 'I\'m sorry about the monitor issue. Since it\'s within warranty, we\'ll take care of this. Let me start the warranty claim process for you.' },
      { s: 'agent', c: 'I\'ve opened warranty claim #WC-2024-0441. You have two options: 1) Ship it back for repair (free shipping, 1-2 week turnaround), or 2) We send a replacement first, you ship back the defective one after receiving it (we\'ll hold a temporary charge until the return is received).' },
      { s: 'customer', c: 'Option 2 please — I need a monitor for work.' },
    ],
  },
  {
    title: 'Compliment - excellent service from agent David',
    category: 'general',
    tags: ['feedback', 'positive', 'compliment'],
    messages: [
      { s: 'customer', c: 'I just want to say that David from your support team was absolutely amazing. He went above and beyond to help me with a complicated return. Give that man a raise! 😄' },
      { s: 'agent', c: 'Thank you so much for the kind words! I\'ll make sure David\'s manager hears about this. Positive feedback like yours really makes a difference. We\'re glad we could help!' },
    ],
  },
  {
    title: 'How to use store credit',
    category: 'general',
    tags: ['store-credit', 'how-to'],
    messages: [
      { s: 'customer', c: 'I received a $30 store credit from a previous return but I can\'t figure out how to apply it at checkout. Where is the option?' },
      { s: 'agent', c: 'Store credits are automatically applied at checkout if you\'re logged into your account. You should see a "Store Credit" line item in the order summary showing the $30 deduction. If it\'s not appearing, try clearing your cache or using an incognito window. Let me know if you still have trouble!' },
    ],
  },
  {
    title: 'Bulk return request - wrong sizes on 5 items',
    category: 'shipping',
    tags: ['bulk-return', 'sizing', 'clothing'],
    messages: [
      { s: 'customer', c: 'I ordered 5 dresses in size 8 but they all fit more like a size 6. I need to return all of them and exchange for size 10. Can you handle this as one return?' },
      { s: 'agent', c: 'Of course! I\'ll process all 5 items as a single return. I\'ll generate one return label and also place a new order for all 5 dresses in size 10 with free expedited shipping. Would you like me to proceed?' },
      { s: 'customer', c: 'Yes please. And can you double-check that size 10 actually measures as a true 10? I don\'t want to go through this again.' },
      { s: 'agent', c: 'I\'ve checked with our sizing team and confirmed that size 10 in this brand measures 37" bust, 29" waist, 39.5" hips. I\'ll also include a measuring tape in your new shipment at no charge.' },
    ],
  },
  {
    title: 'Accessibility features request for website',
    category: 'technical',
    tags: ['accessibility', 'feature-request', 'a11y'],
    messages: [
      { s: 'customer', c: 'I\'m visually impaired and use a screen reader. Your website is very difficult to navigate — many buttons don\'t have labels and the checkout flow is especially problematic. Please consider improving accessibility.' },
      { s: 'agent', c: 'Thank you so much for this feedback — it\'s incredibly important to us. I\'m forwarding your report directly to our engineering and design teams. We\'re actively working on WCAG 2.1 compliance and your specific feedback about button labels and checkout will be prioritized.' },
      { s: 'customer', c: 'I appreciate that. I really want to shop with you but it\'s nearly impossible right now.' },
    ],
  },
  {
    title: 'Environmental impact of packaging',
    category: 'general',
    tags: ['sustainability', 'packaging', 'feedback'],
    messages: [
      { s: 'customer', c: 'I love your products but the amount of packaging waste is concerning. A small phone case came in a huge box with tons of plastic bubble wrap. Are there any plans to use more sustainable packaging?' },
      { s: 'agent', c: 'Great feedback! We actually launched our "Green Ship" initiative last month. We\'re transitioning to right-sized boxes, recycled paper fill, and compostable mailers. Your next order should arrive with noticeably less packaging waste.' },
    ],
  },
  {
    title: 'Price match request against competitor',
    category: 'billing',
    tags: ['price-match', 'competitor'],
    messages: [
      { s: 'customer', c: 'I found the exact same blender on CompetitorStore for $20 less. Do you price match? I\'d rather buy from you since I have loyalty points.' },
      { s: 'agent', c: 'Yes, we do price match! Can you send me a link to the competitor listing so I can verify?' },
      { s: 'customer', c: 'Here it is: www.competitorstore.com/blender-pro-x. Shows $59.99 vs your $79.99.' },
      { s: 'agent', c: 'Verified! I\'ve applied a price adjustment. Your cart now shows $59.99 for the Blender Pro X. Plus you\'ll still earn your loyalty points. Anything else I can help with?' },
    ],
  },
  {
    title: 'Product recall inquiry - baby products',
    category: 'general',
    tags: ['recall', 'safety', 'urgent'],
    messages: [
      { s: 'customer', c: 'I saw a news article about a recall on the BabySafe crib mattress. I bought one from your store 3 months ago. Is this recall affecting your products? Order #ORD-6629.' },
      { s: 'agent', c: 'Thank you for bringing this to our attention. Let me check your specific product lot number against the recall list immediately.' },
      { s: 'agent', c: 'I\'ve checked and unfortunately your mattress (Lot #BS-2024-A) IS part of the recall due to a potential firmness issue. Please stop using it immediately. We\'ll send a pre-paid shipping label and a full refund, plus we\'ll express ship you a replacement from the updated, safe lot at no charge.' },
      { s: 'customer', c: 'This is scary! Thank you for checking so quickly. Please send the replacement ASAP.' },
      { s: 'agent', c: 'Absolutely. The replacement will ship today with next-day delivery. Your baby\'s safety is our top priority. You\'ll receive tracking information within the hour.' },
    ],
  },
  {
    title: 'Corporate gifting options inquiry',
    category: 'general',
    tags: ['corporate', 'gifting', 'inquiry'],
    messages: [
      { s: 'customer', c: 'We\'re looking for corporate holiday gifts for about 200 employees. Do you have any gifting programs, custom packaging, or branded options?' },
      { s: 'agent', c: 'We\'d love to help with your corporate gifting! We offer custom gift boxes, branded packaging with your company logo, and curated gift sets starting at $25/person. I\'ll transfer you to our Corporate Sales team who can put together a tailored proposal. Is there a budget range per gift you\'re targeting?' },
    ],
  },
  {
    title: 'Allergic reaction to skincare product',
    category: 'general',
    tags: ['health', 'allergy', 'product-safety', 'urgent'],
    messages: [
      { s: 'customer', c: 'I had an allergic reaction to the "Natural Glow" face cream I bought from you. My face is red and swollen. The ingredients list on the website didn\'t mention "fragrance" but the actual product contains it!' },
      { s: 'agent', c: 'I\'m very sorry to hear about your reaction! Please seek medical attention if symptoms persist or worsen. I\'m immediately flagging this with our product safety team.' },
      { s: 'agent', c: 'I\'ve checked and you\'re right — the online listing was missing "fragrance" from the ingredients. This is a serious labeling error and has been escalated to our product quality team. I\'ve processed a full refund and also want to cover any medical expenses if you need treatment. Please keep receipts of any medical visits.' },
      { s: 'customer', c: 'I\'m going to my dermatologist tomorrow. I\'ll send the receipt. This could have been dangerous for someone with severe allergies.' },
    ],
  },
  {
    title: 'Order placed by mistake - need immediate cancellation',
    category: 'general',
    tags: ['cancellation', 'urgent', 'mistake'],
    messages: [
      { s: 'customer', c: 'I accidentally placed order #ORD-8899 just now. My toddler was playing with my phone. Can you cancel it before it ships??' },
      { s: 'agent', c: 'Don\'t worry! I\'ve cancelled order #ORD-8899 immediately. It hadn\'t entered processing yet. The refund of $134.50 will be back on your card within 24 hours. No harm done! 😊' },
      { s: 'customer', c: 'Thank you for being so fast! Time to put a screen lock on my phone 😅' },
    ],
  },
  {
    title: 'Requesting product review after purchase',
    category: 'general',
    tags: ['review', 'feedback', 'request'],
    messages: [
      { s: 'customer', c: 'I bought the ErgoMax chair 2 months ago and love it. Where can I leave a review? I can\'t find the option on the product page.' },
      { s: 'agent', c: 'I\'m glad you love the chair! You should have received a review request email 14 days after delivery. I can also send you a direct review link right now. Thank you for taking the time to share your experience — it helps other customers!' },
    ],
  },
  {
    title: 'Complaint about customer service wait times',
    category: 'general',
    tags: ['complaint', 'wait-time', 'service'],
    messages: [
      { s: 'customer', c: 'I\'ve been waiting in your phone queue for 45 minutes before giving up and trying chat. Your wait times are ridiculous. I have a simple question about my order.' },
      { s: 'agent', c: 'I sincerely apologize for the wait. We\'re currently experiencing higher than normal call volumes. I\'m here now and happy to help right away. What\'s your question?' },
      { s: 'customer', c: 'I just need to know when order #ORD-5544 will arrive. That\'s it.' },
      { s: 'agent', c: 'Order #ORD-5544 is currently out for delivery and should arrive today by 6 PM. I\'m sorry again for the wait — we\'re hiring additional support staff to reduce these times.' },
    ],
  },
  {
    title: 'Wrong color shown on website vs actual product',
    category: 'general',
    tags: ['color', 'misleading', 'product-listing'],
    messages: [
      { s: 'customer', c: 'The desk lamp I ordered was shown as "warm white" on the website but it\'s actually a harsh cool white in person. The photos are misleading.' },
      { s: 'agent', c: 'I appreciate you letting us know about the color discrepancy. Product photography can sometimes differ from the actual product. I can offer you a free return and exchange for our "Sunset Glow" model which is a true warm white, or a full refund.' },
    ],
  },
  {
    title: 'Subscription box customization request',
    category: 'general',
    tags: ['subscription', 'customization'],
    messages: [
      { s: 'customer', c: 'Is there any way to customize my monthly snack box subscription? I\'m allergic to tree nuts and the last box had 3 items with almonds.' },
      { s: 'agent', c: 'Absolutely! We should have had your allergy information on file. I\'ve updated your profile with a tree nut allergy flag. All future boxes will be curated to exclude any items containing tree nuts. I\'m also sending a replacement box for this month with nut-free alternatives.' },
      { s: 'customer', c: 'Thank you! I really appreciate the replacement box too.' },
    ],
  },
  {
    title: 'Tax-exempt purchase for non-profit organization',
    category: 'billing',
    tags: ['tax-exempt', 'non-profit', 'documentation'],
    messages: [
      { s: 'customer', c: 'I\'m purchasing supplies for our non-profit organization. We have a tax-exempt certificate. How do I apply it to our order?' },
      { s: 'agent', c: 'You can upload your tax-exempt certificate through your account settings under "Tax Information." Once verified (usually within 1 business day), all future orders will be tax-exempt automatically. Would you like me to walk you through the upload process?' },
    ],
  },
  {
    title: 'Gift wrapping and personalized message request',
    category: 'general',
    tags: ['gift-wrapping', 'personalization'],
    messages: [
      { s: 'customer', c: 'I want to order a birthday gift for my friend. Do you offer gift wrapping? And can I include a personalized card with a message?' },
      { s: 'agent', c: 'Yes to both! During checkout, you\'ll see a "Gift Options" section where you can add premium gift wrapping ($4.99) and include a personalized message of up to 150 characters that we\'ll print on a card. We also offer a "Gift Receipt" option that hides the price.' },
      { s: 'customer', c: 'Perfect! Can the gift wrap be in blue? It\'s his favorite color.' },
      { s: 'agent', c: 'We have blue, gold, red, and green wrapping options. You can select your preferred color in the Gift Options section.' },
    ],
  },
  {
    title: 'Product comparison help needed',
    category: 'general',
    tags: ['comparison', 'inquiry', 'help'],
    messages: [
      { s: 'customer', c: 'I\'m torn between the FitTrack Pro and FitTrack Ultra fitness watches. What\'s the main difference? Is the Ultra worth the extra $80?' },
      { s: 'agent', c: 'Great question! Here\'s the key comparison:\n\n**FitTrack Pro ($149):** GPS, heart rate, 5-day battery, water-resistant to 50m\n\n**FitTrack Ultra ($229):** All Pro features PLUS: blood oxygen monitoring, ECG, 10-day battery, AMOLED display, always-on screen, water-resistant to 100m\n\nIf you\'re a serious fitness enthusiast or swimmer, the Ultra is worth it. For casual daily use, the Pro is excellent value.' },
      { s: 'customer', c: 'I\'m a casual gym-goer so the Pro sounds perfect. Thanks for the honest recommendation!' },
    ],
  },
  {
    title: 'Installation service request for large appliance',
    category: 'general',
    tags: ['installation', 'appliance', 'service'],
    messages: [
      { s: 'customer', c: 'I\'m buying the 65" Smart TV and want to know if you offer wall mounting installation service.' },
      { s: 'agent', c: 'Yes! We offer professional installation services through our partner network. For a 65" TV, wall mounting is $149 which includes the mount hardware, cable management, and a 90-day service guarantee. I can add this to your order.' },
    ],
  },
  {
    title: 'Feedback on new website redesign',
    category: 'technical',
    tags: ['feedback', 'website', 'ux'],
    messages: [
      { s: 'customer', c: 'I noticed you redesigned the website. Honestly, the new checkout is much worse. It used to be 2 steps, now it\'s 4 pages. Also, the font is so small I can barely read the product descriptions.' },
      { s: 'agent', c: 'Thank you for the honest feedback. We\'ve been hearing similar concerns about the checkout flow and we\'re already working on streamlining it back down. Regarding font size, you can use Ctrl+Plus (or Cmd+Plus on Mac) to increase it, but I\'ll also pass along the feedback about default font sizing to our design team.' },
      { s: 'customer', c: 'Hope you fix the checkout soon. I almost abandoned my cart because of it.' },
    ],
  },
];

const statuses = ['open', 'in-progress', 'resolved', 'closed'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const sentiments = ['positive', 'neutral', 'negative', null];
const agents = ['Agent Sarah', 'Agent Mike', 'Agent Priya', 'Agent David', 'Agent Emma', null];

const internalNoteTemplates = [
  'Customer has been a member since 2022. Previous good experience.',
  'Checking with warehouse team on inventory status.',
  'Escalated to senior agent for review.',
  'Waiting for customer to provide additional details.',
  'Follow up required within 24 hours.',
  'Similar issue reported by 3 other customers this week.',
  'Refund approved by manager — processing.',
  'Customer contacted us twice about this issue.',
  'Carrier confirmed delivery attempt — leaving door tag.',
  'Product team notified about potential defect.',
  'Legal team reviewing GDPR compliance requirements.',
  'Customer eligible for loyalty tier upgrade.',
];

// ─── Utility Functions ──────────────────────────────────────────

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(name) {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  return `${cleanName}@${randomFrom(domains)}`;
}

function randomDate(daysBack = 30) {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

// ─── Seed Function ──────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting database seed...');
  console.log('━'.repeat(50));

  try {
    await connectDB();

    // Clear existing data
    const deletedTickets = await Ticket.deleteMany({});
    const deletedMessages = await Message.deleteMany({});
    console.log(`🗑️  Cleared ${deletedTickets.deletedCount} tickets and ${deletedMessages.deletedCount} messages`);

    const createdTickets = [];
    const allMessages = [];

    // Generate 100 tickets
    for (let i = 0; i < 100; i++) {
      const template = ticketTemplates[i % ticketTemplates.length];
      const customerName = randomFrom(customerNames);
      const ticketDate = randomDate(60);

      // Make titles unique for duplicate templates
      const titleSuffix = i >= ticketTemplates.length ? ` (#${i + 1})` : '';

      const status = randomFrom(statuses);
      const priority = randomFrom(priorities);
      const sentiment = randomFrom(sentiments);
      const isEscalated = priority === 'urgent' && sentiment === 'negative' && Math.random() > 0.5;

      const ticketData = {
        title: template.title + titleSuffix,
        customer: {
          name: customerName,
          email: generateEmail(customerName),
        },
        status,
        priority,
        category: template.category,
        tags: template.tags,
        sentiment,
        assignedAgent: randomFrom(agents),
        escalated: isEscalated,
        escalationReason: isEscalated ? 'High priority ticket with negative customer sentiment' : null,
        summary: status === 'resolved' || status === 'closed'
          ? `Customer reported ${template.title.toLowerCase()}. Issue was investigated and ${status === 'resolved' ? 'resolved' : 'closed'} by support agent.`
          : null,
        aiConfidence: Math.random() > 0.5 ? parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)) : null,
        internalNotes: Math.random() > 0.4
          ? Array.from({ length: randomBetween(1, 3) }, () => ({
              content: randomFrom(internalNoteTemplates),
              createdBy: 'agent',
              createdAt: new Date(ticketDate.getTime() + randomBetween(1, 48) * 60 * 60 * 1000),
            }))
          : [],
        activityLog: [
          {
            action: 'ticket_created',
            details: `Ticket created with priority: ${priority}`,
            performedBy: 'system',
            createdAt: ticketDate,
          },
        ],
        createdAt: ticketDate,
        updatedAt: new Date(ticketDate.getTime() + randomBetween(0, 72) * 60 * 60 * 1000),
      };

      // Add status-change activity for non-open tickets
      if (status !== 'open') {
        ticketData.activityLog.push({
          action: 'status_changed',
          details: `Status changed from "open" to "${status}"`,
          performedBy: 'agent',
          createdAt: new Date(ticketDate.getTime() + randomBetween(1, 24) * 60 * 60 * 1000),
        });
      }

      const ticket = await Ticket.create(ticketData);
      createdTickets.push(ticket);

      // Create messages for this ticket
      const templateMessages = template.messages;
      for (let j = 0; j < templateMessages.length; j++) {
        const msg = templateMessages[j];
        const messageDate = new Date(
          ticketDate.getTime() + (j + 1) * randomBetween(5, 120) * 60 * 1000
        );

        const message = await Message.create({
          ticketId: ticket._id,
          senderType: msg.s,
          content: msg.c,
          createdAt: messageDate,
          updatedAt: messageDate,
        });
        allMessages.push(message);
      }

      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`📝 Created ${i + 1}/100 tickets...`);
      }
    }

    console.log('━'.repeat(50));
    console.log(`✅ Seed complete!`);
    console.log(`   📋 Tickets created: ${createdTickets.length}`);
    console.log(`   💬 Messages created: ${allMessages.length}`);
    console.log('');

    // Print summary stats
    const statusBreakdown = {};
    createdTickets.forEach((t) => {
      statusBreakdown[t.status] = (statusBreakdown[t.status] || 0) + 1;
    });
    console.log('   Status breakdown:');
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      console.log(`     - ${status}: ${count}`);
    });

    const categoryBreakdown = {};
    createdTickets.forEach((t) => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + 1;
    });
    console.log('   Category breakdown:');
    Object.entries(categoryBreakdown).forEach(([cat, count]) => {
      console.log(`     - ${cat}: ${count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
