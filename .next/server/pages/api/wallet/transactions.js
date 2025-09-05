"use strict";(()=>{var e={};e.id=315,e.ids=[315],e.modules={8770:e=>{e.exports=require("@nhost/nhost-js")},8432:e=>{e.exports=require("bcryptjs")},3227:e=>{e.exports=require("next-auth")},2113:e=>{e.exports=require("next-auth/next")},7449:e=>{e.exports=require("next-auth/providers/credentials")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},5831:(e,t,s)=>{s.r(t),s.d(t,{config:()=>p,default:()=>d,routeModule:()=>h});var r={};s.r(r),s.d(r,{default:()=>c});var a=s(1802),n=s(7153),o=s(6249),i=s(2113),u=s(3857),l=s(5900);async function c(e,t){if("GET"!==e.method)return t.status(405).json({message:"Method not allowed"});try{let s=await (0,i.getServerSession)(e,t,u.authOptions);if(!s?.user?.email)return t.status(401).json({message:"Unauthorized"});console.log("\uD83D\uDCB3 Fetching wallet transactions for:",s.user.email);let r=new l.Client({host:"sbpnfqrsnvtyvkgldcco.db.eu-central-1.nhost.run",port:parseInt("5432"),database:"sbpnfqrsnvtyvkgldcco",user:"postgres",password:"Provenvalueenterprise@123!",ssl:{rejectUnauthorized:!1}});await r.connect();let a=`
      SELECT id FROM users WHERE email = $1
    `,n=await r.query(a,[s.user.email]);if(0===n.rows.length)return await r.end(),t.status(404).json({message:"User not found"});let o=n.rows[0].id,c=Math.min(parseInt(e.query.limit)||50,100),d=`
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
    `,p=await r.query(d,[o,c]);await r.end(),console.log(`💳 Found ${p.rows.length} transactions for ${s.user.email}`),t.status(200).json({success:!0,transactions:p.rows,count:p.rows.length})}catch(e){console.error("❌ Error fetching wallet transactions:",e),t.status(500).json({success:!1,message:"Failed to fetch transactions"})}}let d=(0,o.l)(r,"default"),p=(0,o.l)(r,"config"),h=new a.PagesAPIRouteModule({definition:{kind:n.x.PAGES_API,page:"/api/wallet/transactions",pathname:"/api/wallet/transactions",bundlePath:"",filename:""},userland:r})}};var t=require("../../../webpack-api-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[8495],()=>s(5831));module.exports=r})();