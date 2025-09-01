"use strict";(()=>{var e={};e.id=315,e.ids=[315],e.modules={8770:e=>{e.exports=require("@nhost/nhost-js")},1649:e=>{e.exports=require("next-auth/react")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},60:(e,t,n)=>{n.r(t),n.d(t,{config:()=>p,default:()=>f,routeModule:()=>h});var s={};n.r(s),n.d(s,{default:()=>l});var r=n(1802),a=n(7153),o=n(6249),u=n(1649),i=n(5985);async function l(e,t){let n=await (0,u.getSession)({req:e});return n?"POST"===e.method?c(e,t,n.user.id):"GET"===e.method?d(e,t,n.user.id):t.status(405).json({message:"Method not allowed"}):t.status(401).json({message:"Unauthorized"})}async function c(e,t,n){let{amount:s,paymentMethod:r,reference:a}=e.body;if(!s||s<=0)return t.status(400).json({message:"Invalid amount"});try{let{data:e,error:r}=await i.qS.graphql.request(`
      mutation FundWallet($userId: uuid!, $amount: numeric!, $reference: String!) {
        update_user_profiles(
          where: {user_id: {_eq: $userId}}
          _inc: {wallet_balance: $amount}
        ) {
          returning {
            wallet_balance
          }
        }
        
        insert_wallet_transactions_one(object: {
          user_id: $userId
          type: "credit"
          amount: $amount
          description: "Wallet funding"
          reference: $reference
          status: "completed"
          payment_method: $paymentMethod
          created_at: "now()"
        }) {
          id
        }
      }
    `,{userId:n,amount:parseFloat(s),reference:a});if(r)return console.error("Error funding wallet:",r),t.status(500).json({message:"Failed to fund wallet"});t.status(200).json({message:"Wallet funded successfully",newBalance:e.update_user_profiles.returning[0].wallet_balance,transactionId:e.insert_wallet_transactions_one.id})}catch(e){console.error("Wallet funding error:",e),t.status(500).json({message:"Internal server error"})}}async function d(e,t,n){try{let{data:e,error:s}=await i.qS.graphql.request(`
      query GetWalletTransactions($userId: uuid!) {
        wallet_transactions(
          where: {user_id: {_eq: $userId}}
          order_by: {created_at: desc}
          limit: 50
        ) {
          id
          type
          amount
          description
          reference
          status
          payment_method
          created_at
        }
      }
    `,{userId:n});if(s)return console.error("Error fetching transactions:",s),t.status(500).json({message:"Failed to fetch transactions"});t.status(200).json({transactions:e.wallet_transactions})}catch(e){console.error("Error fetching wallet transactions:",e),t.status(500).json({message:"Internal server error"})}}let f=(0,o.l)(s,"default"),p=(0,o.l)(s,"config"),h=new r.PagesAPIRouteModule({definition:{kind:a.x.PAGES_API,page:"/api/wallet/transactions",pathname:"/api/wallet/transactions",bundlePath:"",filename:""},userland:s})},5985:(e,t,n)=>{n.d(t,{$G:()=>r,qS:()=>s});let s=new(n(8770)).NhostClient({subdomain:"sbpnfqrsnvtyvkgldcco",region:"eu-central-1"});parseInt("5432");let r=async()=>{try{console.log("\uD83D\uDD0D Testing Nhost connection..."),console.log("\uD83D\uDCCD Nhost Config:",{subdomain:"sbpnfqrsnvtyvkgldcco",region:"eu-central-1",useNhost:"true"});let e=s.auth.isAuthenticated();console.log("\uD83D\uDD10 Current auth status:",e);let t=await fetch("https://sbpnfqrsnvtyvkgldcco.nhost.run/v1/graphql",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:`
          query {
            __typename
          }
        `})});if(t.ok)return console.log("✅ Nhost GraphQL endpoint is reachable"),{success:!0,message:"Nhost connection successful"};return console.error("❌ Nhost GraphQL endpoint error:",t.status,t.statusText),{success:!1,message:`HTTP ${t.status}: ${t.statusText}`}}catch(e){return console.error("❌ Nhost connection test failed:",e),{success:!1,message:e instanceof Error?e.message:"Unknown error"}}}},7153:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},1802:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=60);module.exports=n})();