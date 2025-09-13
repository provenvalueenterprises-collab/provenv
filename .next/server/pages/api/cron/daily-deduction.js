"use strict";(()=>{var e={};e.id=3288,e.ids=[3288],e.modules={8770:e=>{e.exports=require("@nhost/nhost-js")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,a){return a in t?t[a]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,a)):"function"==typeof t&&"default"===a?t:void 0}}})},1592:(e,t,a)=>{a.r(t),a.d(t,{config:()=>l,default:()=>d,routeModule:()=>c});var r={};a.r(r),a.d(r,{default:()=>u});var n=a(1802),o=a(7153),s=a(6249),i=a(6755);async function u(e,t){if("POST"!==e.method)return t.status(405).json({message:"Method not allowed"});if("Bearer a2c21e022c0e0923654b5c9452fecb8b7243bad10004b5559c393a6be0c0c7e8"!==e.headers.authorization)return t.status(401).json({message:"Unauthorized"});try{let e=new Date().toISOString().split("T")[0];console.log(`Starting daily deduction process for ${e}`);let{data:a,error:r}=await i.qS.graphql.request(`
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
    `,{today:e});if(r)return console.error("Error fetching active thrifts:",r),t.status(500).json({message:"Database error",error:r});let n=[],o=0,s=0;for(let t of a.thrift_plans)try{let a=t.user_profile?.wallet_balance||0;if(a<t.daily_amount){await i.qS.graphql.request(`
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
          `,{thriftPlanId:t.id,amount:t.daily_amount,date:e,reason:"Insufficient wallet balance"}),n.push({userId:t.user_id,email:t.user.email,status:"failed",reason:"Insufficient funds",amount:t.daily_amount,balance:a}),s++;continue}let{error:r}=await i.qS.graphql.request(`
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
        `,{userId:t.user_id,thriftPlanId:t.id,amount:t.daily_amount,date:e});r?(console.error(`Error processing contribution for user ${t.user_id}:`,r),n.push({userId:t.user_id,email:t.user.email,status:"error",reason:Array.isArray(r)?r[0]?.message||"Unknown error":r?.message||"Unknown error",amount:t.daily_amount}),s++):(n.push({userId:t.user_id,email:t.user.email,status:"success",amount:t.daily_amount,newBalance:a-t.daily_amount}),o++)}catch(e){console.error(`Unexpected error processing user ${t.user_id}:`,e),n.push({userId:t.user_id,email:t.user?.email,status:"error",reason:e instanceof Error?e.message:"Unknown error",amount:t.daily_amount}),s++}await i.qS.graphql.request(`
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
          details: ${JSON.stringify(n)}
        }) {
          id
        }
      }
    `,{date:e,totalProcessed:n.length,successCount:o,failureCount:s,totalAmount:n.reduce((e,t)=>e+("success"===t.status?t.amount:0),0)}),console.log(`Daily deduction completed: ${o} success, ${s} failures`),t.status(200).json({message:"Daily deduction completed",date:e,totalProcessed:n.length,successCount:o,failureCount:s,results:n})}catch(e){console.error("Daily deduction error:",e),t.status(500).json({message:"Failed to process daily deductions",error:e instanceof Error?e.message:"Unknown error"})}}let d=(0,s.l)(r,"default"),l=(0,s.l)(r,"config"),c=new n.PagesAPIRouteModule({definition:{kind:o.x.PAGES_API,page:"/api/cron/daily-deduction",pathname:"/api/cron/daily-deduction",bundlePath:"",filename:""},userland:r})},6755:(e,t,a)=>{a.d(t,{qS:()=>r});let r=new(a(8770)).NhostClient({subdomain:"sbpnfqrsnvtyvkgldcco",region:"eu-central-1"});parseInt("5432")},7153:(e,t)=>{var a;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))},1802:(e,t,a)=>{e.exports=a(145)}};var t=require("../../../webpack-api-runtime.js");t.C(e);var a=t(t.s=1592);module.exports=a})();