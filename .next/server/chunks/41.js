"use strict";exports.id=41,exports.ids=[41],exports.modules={6249:(e,r)=>{Object.defineProperty(r,"l",{enumerable:!0,get:function(){return function e(r,s){return s in r?r[s]:"then"in r&&"function"==typeof r.then?r.then(r=>e(r,s)):"function"==typeof r&&"default"===s?r:void 0}}})},5985:(e,r,s)=>{s.d(r,{q:()=>a});let a=new(s(8770)).NhostClient({subdomain:"sbpnfqrsnvtyvkgldcco",region:"eu-central-1"})},1850:(e,r,s)=>{s.a(e,async(e,a)=>{try{s.d(r,{H:()=>c});var o=s(5985),i=s(7618),l=e([i]);i=(l.then?(await l)():l)[0];class t{constructor(){this.users=new Map,this.initialized=!1,this.initializeTestUser()}async initializeTestUser(){if(!this.initialized)try{let e=await i.default.hash("test123",12),r={id:"test-user-123",name:"Test User",email:"test@example.com",phone:"1234567890",passwordHash:e,referralCode:"TEST123",emailVerified:!0,createdAt:new Date,walletBalance:100,bonusWallet:50,totalReferrals:5};this.users.set("test@example.com",r),this.initialized=!0,console.log("✅ Test user initialized in fallback store:",r.email)}catch(e){console.error("❌ Failed to initialize test user:",e)}}async createUser(e){if(console.log("\uD83D\uDD04 FallbackUserStore.createUser called for:",e.email),this.users.has(e.email))throw console.log("❌ User already exists:",e.email),Error("User already exists");console.log("\uD83D\uDD10 Hashing password...");let r=await i.default.hash(e.passwordHash,12),s={id:"user-"+Date.now()+Math.random().toString(36).substr(2,9),name:e.name,email:e.email,phone:e.phone,passwordHash:r,referralCode:e.referralCode,emailVerified:!0,createdAt:new Date,walletBalance:0,bonusWallet:0,totalReferrals:0};return this.users.set(e.email,s),console.log("✅ User created in fallback store:",s.email,"ID:",s.id),s}async findUserByEmail(e){await this.initializeTestUser();let r=this.users.get(e);return console.log(`🔍 Fallback store lookup for ${e}:`,r?"found":"not found"),r||null}async verifyUserEmail(e){let r=this.users.get(e);return!!r&&(r.emailVerified=!0,console.log("User email verified in fallback store:",e),!0)}async getAllUsers(){return Array.from(this.users.values())}}let n=new t;class u{constructor(){console.log("\uD83D\uDD27 UserStore constructor called"),console.log("\uD83D\uDD27 NEXT_PUBLIC_USE_NHOST:","false")}get useNhost(){return console.log("\uD83D\uDD27 useNhost getter called - hardcoded to false for debugging"),!1}async createUser(e){if(console.log("\uD83D\uDD27 UserStore.createUser called"),console.log("\uD83D\uDD27 useNhost:",this.useNhost),console.log("\uD83D\uDD27 NEXT_PUBLIC_USE_NHOST env:","false"),!this.useNhost)return console.log("Using fallback in-memory store (Nhost disabled)"),await n.createUser(e);try{return await this.createUserWithNhost(e)}catch(r){return console.warn("Nhost user creation failed, falling back to in-memory store:",r),await n.createUser(e)}}async createUserWithNhost(e){try{console.log("\uD83D\uDD04 Attempting to create user with Nhost:",{email:e.email,name:e.name,subdomain:"sbpnfqrsnvtyvkgldcco",region:"eu-central-1"});let r=await o.q.auth.signUp({email:e.email,password:e.passwordHash,options:{displayName:e.name}});if(console.log("\uD83D\uDCCB Nhost auth response:",{hasError:!!r.error,hasSession:!!r.session,errorMessage:r.error?.message,sessionKeys:r.session?Object.keys(r.session):null}),r.error){if("User is already signed in"===r.error.message){console.log("\uD83D\uDD04 User already signed in, attempting to clear session..."),await o.q.auth.signOut(),await new Promise(e=>setTimeout(e,1e3)),console.log("\uD83D\uDD04 Retrying user signup after clearing session...");let s=await o.q.auth.signUp({email:e.email,password:e.passwordHash,options:{displayName:e.name}});if(s.error)throw console.error("❌ Nhost auth retry error details:",s.error),Error(`Auth signup failed: ${s.error.message}`);if(!s.session?.user)throw console.error("❌ No user session created on retry. Full response:",s),Error("Auth signup failed: No user session created");console.log("✅ User created in Nhost auth on retry:",s.session.user.id),r.session=s.session}else throw console.error("❌ Nhost auth error details:",r.error),Error(`Auth signup failed: ${r.error.message}`)}if(!r.session?.user)throw console.error("❌ No user session created. Full response:",r),Error("Auth signup failed: No user session created");console.log("✅ User created in Nhost auth:",r.session.user.id);let{data:s,error:a}=await o.q.graphql.request(`
        mutation CreateUserProfile(
          $userId: uuid!
          $phone: String!
          $referralCode: String!
        ) {
          insert_user_profiles_one(object: {
            user_id: $userId
            phone: $phone
            referral_code: $referralCode
            wallet_balance: 0.00
            bonus_wallet: 0.00
            total_referrals: 0
          }) {
            id
            user_id
            phone
            referral_code
            wallet_balance
            bonus_wallet
            total_referrals
            created_at
          }
        }
      `,{userId:r.session.user.id,phone:e.phone,referralCode:e.referralCode});if(a){console.error("❌ Profile creation error:",a),console.error("❌ Full error details:",JSON.stringify(a,null,2));let s=Array.isArray(a)?a.map(e=>e.message).join(", "):a?.message||"Unknown error";(s.includes("policy")||s.includes("permission")||s.includes("RLS"))&&(console.error("\uD83D\uDEA8 RLS POLICY ERROR: The user_profiles table INSERT policy is failing!"),console.error("\uD83D\uDEA8 This usually means auth.uid() or auth.role() functions are not available in your Nhost setup"),console.error("\uD83D\uDEA8 QUICK FIX: Run quick-disable-rls.sql to temporarily disable RLS for testing"),console.error("\uD83D\uDEA8 PERMANENT FIX: Run auth-function-solutions.sql for various solutions")),console.warn("⚠️ User created in auth but profile creation failed. User can still login with basic info.");let o={id:r.session.user.id,name:e.name,email:e.email,phone:e.phone,passwordHash:e.passwordHash,referralCode:e.referralCode,emailVerified:r.session.user.emailVerified||!1,createdAt:new Date,walletBalance:0,bonusWallet:0,totalReferrals:0};return console.log("✅ User created in Nhost auth (profile creation failed):",o.email),o}console.log("✅ User and profile created in Nhost:",e.email);let i={id:r.session.user.id,name:e.name,email:e.email,phone:e.phone,passwordHash:e.passwordHash,referralCode:e.referralCode,emailVerified:r.session.user.emailVerified||!1,createdAt:new Date,walletBalance:0,bonusWallet:0,totalReferrals:0};return console.log("✅ User created in Nhost:",i.email,"Verified:",i.emailVerified),i}catch(e){throw console.error("❌ User creation error:",e),e}}async findUserByEmail(e){if(!this.useNhost)return await n.findUserByEmail(e);try{return await this.findUserByEmailWithNhost(e)}catch(r){return console.warn("Nhost user lookup failed, falling back to in-memory store:",r),await n.findUserByEmail(e)}}async findUserByEmailWithNhost(e){try{console.log("\uD83D\uDD0D Searching for user in Nhost:",e);let{data:r,error:s}=await o.q.graphql.request(`
        query FindUserByEmail($email: String!) {
          user_profiles(where: {users: {email: {_eq: $email}}}) {
            id
            user_id
            phone
            referral_code
            wallet_balance
            bonus_wallet
            total_referrals
            created_at
            users {
              id
              email
              display_name
              email_verified
              created_at
            }
          }
        }
      `,{email:e});if(!s&&r?.user_profiles&&r.user_profiles.length>0){let s=r.user_profiles[0],a=s.users;return console.log("✅ User profile found in Nhost:",e),{id:a.id,name:s.users?.display_name||a.display_name||"",email:s.users?.email||a.email,phone:s.phone,passwordHash:"",referralCode:s.referral_code,emailVerified:a.email_verified||!1,createdAt:new Date(s.created_at),walletBalance:parseFloat(s.wallet_balance||"0"),bonusWallet:parseFloat(s.bonus_wallet||"0"),totalReferrals:s.total_referrals||0}}console.log("\uD83D\uDD0D Profile not found, checking Nhost auth directly...");let{data:a,error:i}=await o.q.graphql.request(`
        query FindAuthUserByEmail($email: String!) {
          users(where: {email: {_eq: $email}}) {
            id
            email
            display_name
            email_verified
            created_at
          }
        }
      `,{email:e});if(!i&&a?.users&&a.users.length>0){let r=a.users[0];if(console.log("✅ User found in Nhost auth (no profile):",e),await this.createUserProfileIfMissing(r.id,{name:r.display_name||"",email:r.email,phone:"",referralCode:""}))return console.log("✅ Profile created for existing auth user:",e),await this.findUserByEmailWithNhost(e);return{id:r.id,name:r.display_name||"",email:r.email,phone:"",passwordHash:"",referralCode:"",emailVerified:r.email_verified||!1,createdAt:new Date(r.created_at),walletBalance:0,bonusWallet:0,totalReferrals:0}}return console.log("ℹ️ User not found in Nhost:",e),null}catch(e){return console.error("❌ Find user by email error:",e),null}}async verifyUserEmail(e){if(!this.useNhost)return await n.verifyUserEmail(e);try{return await this.verifyUserEmailWithNhost(e)}catch(r){return console.warn("Nhost email verification failed, falling back to in-memory store:",r),await n.verifyUserEmail(e)}}async verifyUserEmailWithNhost(e){try{let{data:r,error:s}=await o.q.graphql.request(`
        mutation VerifyUserEmail($email: String!) {
          update_user_profiles(
            where: {email: {_eq: $email}}
            _set: {email_verified: true}
          ) {
            affected_rows
          }
        }
      `,{email:e});if(s)return console.error("Email verification error:",s),!1;return console.log("User email verified in Nhost:",e),!0}catch(e){return console.error("Email verification error:",e),!1}}async createUserProfileIfMissing(e,r){if(!this.useNhost)return console.log("Profile creation skipped (Nhost disabled)"),!1;try{console.log("\uD83D\uDD04 Checking if profile exists for user:",e);let{data:s,error:a}=await o.q.graphql.request(`
        query CheckUserProfile($userId: uuid!) {
          user_profiles(where: {user_id: {_eq: $userId}}) {
            id
          }
        }
      `,{userId:e});if(a)return console.error("❌ Profile check error:",a),!1;if(s?.user_profiles&&s.user_profiles.length>0)return console.log("✅ Profile already exists for user:",e),!0;console.log("\uD83D\uDD04 Creating missing profile for user:",e);let{data:i,error:l}=await o.q.graphql.request(`
        mutation CreateUserProfile(
          $userId: uuid!
          $phone: String!
          $referralCode: String!
        ) {
          insert_user_profiles_one(object: {
            user_id: $userId
            phone: $phone
            referral_code: $referralCode
            wallet_balance: 0.00
            bonus_wallet: 0.00
            total_referrals: 0
          }) {
            id
          }
        }
      `,{userId:e,phone:r.phone,referralCode:r.referralCode});if(l)return console.error("❌ Profile creation error:",l),!1;return console.log("✅ Profile created successfully for user:",e),!0}catch(e){return console.error("❌ Create profile if missing error:",e),!1}}async getAllUsersWithNhost(){try{let{data:e,error:r}=await o.q.graphql.request(`
        query GetAllUsers {
          user_profiles {
            id
            user_id
            display_name
            email
            phone
            referral_code
            wallet_balance
            bonus_wallet
            total_referrals
            created_at
            users {
              id
              email
              display_name
              email_verified
              created_at
            }
          }
        }
      `);if(r)return console.error("Get all users error:",r),[];return(e?.user_profiles||[]).map(e=>({id:e.users.id,name:e.users?.display_name||e.users.display_name||"",email:e.users?.email||e.users.email,phone:e.phone,passwordHash:"",referralCode:e.referral_code,emailVerified:e.users.email_verified||!1,createdAt:new Date(e.created_at),walletBalance:parseFloat(e.wallet_balance||"0"),bonusWallet:parseFloat(e.bonus_wallet||"0"),totalReferrals:e.total_referrals||0}))}catch(e){return console.error("Get all users error:",e),[]}}}let c=new u;a()}catch(e){a(e)}})},7153:(e,r)=>{var s;Object.defineProperty(r,"x",{enumerable:!0,get:function(){return s}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(s||(s={}))},1802:(e,r,s)=>{e.exports=s(145)}};