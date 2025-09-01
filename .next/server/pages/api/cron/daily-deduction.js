"use strict";(()=>{var e={};e.id=288,e.ids=[288],e.modules={8770:e=>{e.exports=require("@nhost/nhost-js")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},4447:(e,t,r)=>{r.r(t),r.d(t,{config:()=>l,default:()=>d,routeModule:()=>c});var n={};r.r(n),r.d(n,{default:()=>u});var o=r(1802),a=r(7153),s=r(6249),i=r(5985);async function u(e,t){if("POST"!==e.method)return t.status(405).json({message:"Method not allowed"});if(e.headers.authorization!==`Bearer ${process.env.CRON_SECRET_TOKEN}`)return t.status(401).json({message:"Unauthorized"});try{let e=new Date().toISOString().split("T")[0];console.log(`Starting daily deduction process for ${e}`);let{data:r,error:n}=await i.qS.graphql.request(`
      query GetActiveThrifts($today: date!) {
        thrift_plans(
          where: {
            status: {_eq: "active"}
            next_contribution_date: {_lte: $today}
            end_date: {_gte: $today}
          }
        ) {
          id
          user_id
          plan_type
          daily_amount
          next_contribution_date
          user {
            email
            displayName
          }
          user_profile {
            wallet_balance
          }
        }
      }
    `,{today:e});if(n)return console.error("Error fetching active thrifts:",n),t.status(500).json({message:"Database error",error:n});let o=[],a=0,s=0;for(let t of r.thrift_plans)try{let r=t.user_profile?.wallet_balance||0;if(r<t.daily_amount){await i.qS.graphql.request(`
            mutation CreateMissedContribution(
              $thriftPlanId: uuid!
              $amount: numeric!
              $date: date!
              $reason: String!
            ) {
              insert_contributions_one(object: {
                thrift_plan_id: $thriftPlanId
                amount: $amount
                contribution_date: $date
                status: "failed"
                failure_reason: $reason
                type: "daily"
              }) {
                id
              }
            }
          `,{thriftPlanId:t.id,amount:t.daily_amount,date:e,reason:"Insufficient wallet balance"}),o.push({userId:t.user_id,email:t.user.email,status:"failed",reason:"Insufficient funds",amount:t.daily_amount,balance:r}),s++;continue}let{error:n}=await i.qS.graphql.request(`
          mutation ProcessDailyContribution(
            $userId: uuid!
            $thriftPlanId: uuid!
            $amount: numeric!
            $date: date!
          ) {
            update_user_profiles(
              where: {user_id: {_eq: $userId}}
              _dec: {wallet_balance: $amount}
            ) {
              affected_rows
            }
            
            insert_contributions_one(object: {
              thrift_plan_id: $thriftPlanId
              amount: $amount
              contribution_date: $date
              status: "completed"
              type: "daily"
            }) {
              id
            }
            
            update_thrift_plans(
              where: {id: {_eq: $thriftPlanId}}
              _set: {
                next_contribution_date: "${function(e){let t=new Date(e);return t.setDate(t.getDate()+1),t.toISOString().split("T")[0]}(e)}"
                total_contributed: {_inc: $amount}
              }
            ) {
              affected_rows
            }
          }
        `,{userId:t.user_id,thriftPlanId:t.id,amount:t.daily_amount,date:e});n?(console.error(`Error processing contribution for user ${t.user_id}:`,n),o.push({userId:t.user_id,email:t.user.email,status:"error",reason:Array.isArray(n)?n[0]?.message||"Unknown error":n?.message||"Unknown error",amount:t.daily_amount}),s++):(o.push({userId:t.user_id,email:t.user.email,status:"success",amount:t.daily_amount,newBalance:r-t.daily_amount}),a++)}catch(e){console.error(`Unexpected error processing user ${t.user_id}:`,e),o.push({userId:t.user_id,email:t.user?.email,status:"error",reason:e instanceof Error?e.message:"Unknown error",amount:t.daily_amount}),s++}await i.qS.graphql.request(`
      mutation LogDailyDeduction(
        $date: date!
        $totalProcessed: Int!
        $successCount: Int!
        $failureCount: Int!
        $totalAmount: numeric!
      ) {
        insert_daily_deduction_logs_one(object: {
          deduction_date: $date
          total_processed: $totalProcessed
          success_count: $successCount
          failure_count: $failureCount
          total_amount: $totalAmount
          details: ${JSON.stringify(o)}
        }) {
          id
        }
      }
    `,{date:e,totalProcessed:o.length,successCount:a,failureCount:s,totalAmount:o.reduce((e,t)=>e+("success"===t.status?t.amount:0),0)}),console.log(`Daily deduction completed: ${a} success, ${s} failures`),t.status(200).json({message:"Daily deduction completed",date:e,totalProcessed:o.length,successCount:a,failureCount:s,results:o})}catch(e){console.error("Daily deduction error:",e),t.status(500).json({message:"Failed to process daily deductions",error:e instanceof Error?e.message:"Unknown error"})}}let d=(0,s.l)(n,"default"),l=(0,s.l)(n,"config"),c=new o.PagesAPIRouteModule({definition:{kind:a.x.PAGES_API,page:"/api/cron/daily-deduction",pathname:"/api/cron/daily-deduction",bundlePath:"",filename:""},userland:n})},5985:(e,t,r)=>{r.d(t,{$G:()=>o,qS:()=>n});let n=new(r(8770)).NhostClient({subdomain:"sbpnfqrsnvtyvkgldcco",region:"eu-central-1"});parseInt("5432");let o=async()=>{try{console.log("\uD83D\uDD0D Testing Nhost connection..."),console.log("\uD83D\uDCCD Nhost Config:",{subdomain:"sbpnfqrsnvtyvkgldcco",region:"eu-central-1",useNhost:"true"});let e=n.auth.isAuthenticated();console.log("\uD83D\uDD10 Current auth status:",e);let t=await fetch("https://sbpnfqrsnvtyvkgldcco.nhost.run/v1/graphql",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:`
          query {
            __typename
          }
        `})});if(t.ok)return console.log("✅ Nhost GraphQL endpoint is reachable"),{success:!0,message:"Nhost connection successful"};return console.error("❌ Nhost GraphQL endpoint error:",t.status,t.statusText),{success:!1,message:`HTTP ${t.status}: ${t.statusText}`}}catch(e){return console.error("❌ Nhost connection test failed:",e),{success:!1,message:e instanceof Error?e.message:"Unknown error"}}}},7153:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},1802:(e,t,r)=>{e.exports=r(145)}};var t=require("../../../webpack-api-runtime.js");t.C(e);var r=t(t.s=4447);module.exports=r})();