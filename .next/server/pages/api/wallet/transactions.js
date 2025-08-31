"use strict";(()=>{var e={};e.id=315,e.ids=[315],e.modules={8770:e=>{e.exports=require("@nhost/nhost-js")},1649:e=>{e.exports=require("next-auth/react")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},60:(e,t,n)=>{n.r(t),n.d(t,{config:()=>m,default:()=>f,routeModule:()=>p});var r={};n.r(r),n.d(r,{default:()=>l});var a=n(1802),s=n(7153),o=n(6249),i=n(1649),u=n(5985);async function l(e,t){let n=await (0,i.getSession)({req:e});return n?"POST"===e.method?d(e,t,n.user.id):"GET"===e.method?c(e,t,n.user.id):t.status(405).json({message:"Method not allowed"}):t.status(401).json({message:"Unauthorized"})}async function d(e,t,n){let{amount:r,paymentMethod:a,reference:s}=e.body;if(!r||r<=0)return t.status(400).json({message:"Invalid amount"});try{let{data:e,error:a}=await u.q.graphql.request(`
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
    `,{userId:n,amount:parseFloat(r),reference:s});if(a)return console.error("Error funding wallet:",a),t.status(500).json({message:"Failed to fund wallet"});t.status(200).json({message:"Wallet funded successfully",newBalance:e.update_user_profiles.returning[0].wallet_balance,transactionId:e.insert_wallet_transactions_one.id})}catch(e){console.error("Wallet funding error:",e),t.status(500).json({message:"Internal server error"})}}async function c(e,t,n){try{let{data:e,error:r}=await u.q.graphql.request(`
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
    `,{userId:n});if(r)return console.error("Error fetching transactions:",r),t.status(500).json({message:"Failed to fetch transactions"});t.status(200).json({transactions:e.wallet_transactions})}catch(e){console.error("Error fetching wallet transactions:",e),t.status(500).json({message:"Internal server error"})}}let f=(0,o.l)(r,"default"),m=(0,o.l)(r,"config"),p=new a.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/wallet/transactions",pathname:"/api/wallet/transactions",bundlePath:"",filename:""},userland:r})},5985:(e,t,n)=>{n.d(t,{q:()=>r});let r=new(n(8770)).NhostClient({subdomain:"sbpnfqrsnvtyvkgldcco",region:"eu-central-1"})},7153:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},1802:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=60);module.exports=n})();