"use strict";(()=>{var e={};e.id=3288,e.ids=[3288],e.modules={8770:e=>{e.exports=require("@nhost/nhost-js")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},1592:(e,t,r)=>{r.r(t),r.d(t,{config:()=>l,default:()=>d,routeModule:()=>c});var a={};r.r(a),r.d(a,{default:()=>u});var n=r(1802),o=r(7153),s=r(6249),i=r(6755);async function u(e,t){if("POST"!==e.method)return t.status(405).json({message:"Method not allowed"});if(e.headers.authorization!==`Bearer ${process.env.CRON_SECRET_TOKEN}`)return t.status(401).json({message:"Unauthorized"});try{let e=new Date().toISOString().split("T")[0];console.log(`Starting daily deduction process for ${e}`);let{data:r,error:a}=await i.qS.graphql.request(`
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
    `,{today:e});if(a)return console.error("Error fetching active thrifts:",a),t.status(500).json({message:"Database error",error:a});let n=[],o=0,s=0;for(let t of r.thrift_plans)try{let r=t.user_profile?.wallet_balance||0;if(r<t.daily_amount){await i.qS.graphql.request(`
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
          `,{thriftPlanId:t.id,amount:t.daily_amount,date:e,reason:"Insufficient wallet balance"}),n.push({userId:t.user_id,email:t.user.email,status:"failed",reason:"Insufficient funds",amount:t.daily_amount,balance:r}),s++;continue}let{error:a}=await i.qS.graphql.request(`
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
        `,{userId:t.user_id,thriftPlanId:t.id,amount:t.daily_amount,date:e});a?(console.error(`Error processing contribution for user ${t.user_id}:`,a),n.push({userId:t.user_id,email:t.user.email,status:"error",reason:Array.isArray(a)?a[0]?.message||"Unknown error":a?.message||"Unknown error",amount:t.daily_amount}),s++):(n.push({userId:t.user_id,email:t.user.email,status:"success",amount:t.daily_amount,newBalance:r-t.daily_amount}),o++)}catch(e){console.error(`Unexpected error processing user ${t.user_id}:`,e),n.push({userId:t.user_id,email:t.user?.email,status:"error",reason:e instanceof Error?e.message:"Unknown error",amount:t.daily_amount}),s++}await i.qS.graphql.request(`
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
    `,{date:e,totalProcessed:n.length,successCount:o,failureCount:s,totalAmount:n.reduce((e,t)=>e+("success"===t.status?t.amount:0),0)}),console.log(`Daily deduction completed: ${o} success, ${s} failures`),t.status(200).json({message:"Daily deduction completed",date:e,totalProcessed:n.length,successCount:o,failureCount:s,results:n})}catch(e){console.error("Daily deduction error:",e),t.status(500).json({message:"Failed to process daily deductions",error:e instanceof Error?e.message:"Unknown error"})}}let d=(0,s.l)(a,"default"),l=(0,s.l)(a,"config"),c=new n.PagesAPIRouteModule({definition:{kind:o.x.PAGES_API,page:"/api/cron/daily-deduction",pathname:"/api/cron/daily-deduction",bundlePath:"",filename:""},userland:a})},6755:(e,t,r)=>{r.d(t,{qS:()=>a});let a=new(r(8770)).NhostClient({subdomain:"sbpnfqrsnvtyvkgldcco",region:"eu-central-1"});parseInt("5432")},7153:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},1802:(e,t,r)=>{e.exports=r(145)}};var t=require("../../../webpack-api-runtime.js");t.C(e);var r=t(t.s=1592);module.exports=r})();