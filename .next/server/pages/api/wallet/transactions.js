"use strict";(()=>{var e={};e.id=315,e.ids=[315],e.modules={8770:e=>{e.exports=require("@nhost/nhost-js")},8432:e=>{e.exports=require("bcryptjs")},3227:e=>{e.exports=require("next-auth")},2113:e=>{e.exports=require("next-auth/next")},7449:e=>{e.exports=require("next-auth/providers/credentials")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},5831:(e,s,t)=>{t.r(s),t.d(s,{config:()=>p,default:()=>d,routeModule:()=>h});var r={};t.r(r),t.d(r,{default:()=>c});var a=t(1802),n=t(7153),o=t(6249),u=t(2113),i=t(3857),l=t(5900);async function c(e,s){if(console.log("\uD83D\uDD0D Wallet Transactions API called"),"GET"!==e.method)return s.status(405).json({message:"Method not allowed"});try{let t=await (0,u.getServerSession)(e,s,i.authOptions);if(console.log("\uD83D\uDD10 Session debug:",{hasSession:!!t,hasUser:!!t?.user,userEmail:t?.user?.email,sessionKeys:t?Object.keys(t):[],userKeys:t?.user?Object.keys(t.user):[]}),!t?.user?.email)return console.log("❌ Unauthorized - no session or email"),s.status(401).json({message:"Unauthorized"});console.log("\uD83D\uDCB3 Fetching wallet transactions for:",t.user.email);let r=new l.Client({host:"sbpnfqrsnvtyvkgldcco.db.eu-central-1.nhost.run",port:parseInt("5432"),database:"sbpnfqrsnvtyvkgldcco",user:"postgres",password:"Provenvalueenterprise@123!",ssl:{rejectUnauthorized:!1}});await r.connect();let a=`
      SELECT u.id FROM auth.users u WHERE u.email = $1
    `,n=await r.query(a,[t.user.email]);if(console.log("\uD83D\uDC64 User lookup result:",{email:t.user.email,found:n.rows.length>0,userId:n.rows[0]?.id}),0===n.rows.length)return await r.end(),s.status(404).json({message:"User not found"});let o=n.rows[0].id,c=Math.min(parseInt(e.query.limit)||50,100),d=`
      SELECT 
        id,
        transaction_type,
        type,
        amount,
        balance_before,
        balance_after,
        reference,
        status,
        description,
        payment_method,
        external_reference,
        created_at,
        updated_at
      FROM wallet_transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `,p=await r.query(d,[o,c]);await r.end(),console.log(`💳 Found ${p.rows.length} transactions for ${t.user.email}`),s.status(200).json({success:!0,transactions:p.rows,count:p.rows.length})}catch(e){console.error("❌ Error fetching wallet transactions:",e),s.status(500).json({success:!1,message:"Failed to fetch transactions"})}}let d=(0,o.l)(r,"default"),p=(0,o.l)(r,"config"),h=new a.PagesAPIRouteModule({definition:{kind:n.x.PAGES_API,page:"/api/wallet/transactions",pathname:"/api/wallet/transactions",bundlePath:"",filename:""},userland:r})}};var s=require("../../../webpack-api-runtime.js");s.C(e);var t=e=>s(s.s=e),r=s.X(0,[8495],()=>t(5831));module.exports=r})();