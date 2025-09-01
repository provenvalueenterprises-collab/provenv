"use strict";(()=>{var t={};t.id=786,t.ids=[786],t.modules={8770:t=>{t.exports=require("@nhost/nhost-js")},1649:t=>{t.exports=require("next-auth/react")},145:t=>{t.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(t,e)=>{Object.defineProperty(e,"l",{enumerable:!0,get:function(){return function t(e,r){return r in e?e[r]:"then"in e&&"function"==typeof e.then?e.then(e=>t(e,r)):"function"==typeof e&&"default"===r?e:void 0}}})},3930:(t,e,r)=>{r.r(e),r.d(e,{config:()=>m,default:()=>p,routeModule:()=>g});var n={};r.r(n),r.d(n,{default:()=>l});var a=r(1802),s=r(7153),o=r(6249),u=r(1649),i=r(5985);async function l(t,e){let r=await (0,u.getSession)({req:t});return r?"POST"===t.method?d(t,e,r.user.id):"GET"===t.method?c(t,e,r.user.id):e.status(405).json({message:"Method not allowed"}):e.status(401).json({message:"Unauthorized"})}async function d(t,e,r){let{planType:n,dailyAmount:a,startDate:s}=t.body;if(!n||!a||!s)return e.status(400).json({message:"Missing required fields"});let o={basic:{duration:30,interestRate:.05},standard:{duration:60,interestRate:.08},premium:{duration:90,interestRate:.12}}[n];if(!o)return e.status(400).json({message:"Invalid plan type"});try{let t=new Date(s),u=new Date(t);u.setDate(u.getDate()+o.duration);let l=a*o.duration,d=l*o.interestRate,{data:c,error:p}=await i.qS.graphql.request(`
      mutation CreateThriftPlan(
        $userId: uuid!
        $planType: String!
        $dailyAmount: numeric!
        $startDate: date!
        $endDate: date!
        $totalAmount: numeric!
        $expectedReturn: numeric!
        $maturityAmount: numeric!
      ) {
        insert_thrift_plans_one(object: {
          user_id: $userId
          plan_type: $planType
          daily_amount: $dailyAmount
          start_date: $startDate
          end_date: $endDate
          next_contribution_date: $startDate
          total_amount: $totalAmount
          expected_return: $expectedReturn
          maturity_amount: $maturityAmount
          total_contributed: 0
          status: "active"
          created_at: "now()"
        }) {
          id
          plan_type
          daily_amount
          start_date
          end_date
          total_amount
          expected_return
          maturity_amount
          status
        }
      }
    `,{userId:r,planType:n,dailyAmount:parseFloat(a),startDate:s,endDate:u.toISOString().split("T")[0],totalAmount:l,expectedReturn:d,maturityAmount:l+d});if(p)return console.error("Error creating thrift plan:",p),e.status(500).json({message:"Failed to create thrift plan"});e.status(201).json({message:"Thrift plan created successfully",thriftPlan:c.insert_thrift_plans_one})}catch(t){console.error("Thrift plan creation error:",t),e.status(500).json({message:"Internal server error"})}}async function c(t,e,r){try{let{data:t,error:n}=await i.qS.graphql.request(`
      query GetUserThriftPlans($userId: uuid!) {
        thrift_plans(
          where: {user_id: {_eq: $userId}}
          order_by: {created_at: desc}
        ) {
          id
          plan_type
          daily_amount
          start_date
          end_date
          next_contribution_date
          total_amount
          total_contributed
          expected_return
          maturity_amount
          status
          created_at
          contributions_aggregate {
            aggregate {
              count
              sum {
                amount
              }
            }
          }
        }
      }
    `,{userId:r});if(n)return console.error("Error fetching thrift plans:",n),e.status(500).json({message:"Failed to fetch thrift plans"});let a=t.thrift_plans.map(t=>{let e=t.contributions_aggregate.aggregate.count||0,r=t.contributions_aggregate.aggregate.sum?.amount||0,n=t.total_amount>0?r/t.total_amount*100:0;return{...t,contributionCount:e,totalContributed:r,progress:Math.round(100*n)/100}});e.status(200).json({thriftPlans:a})}catch(t){console.error("Error fetching thrift plans:",t),e.status(500).json({message:"Internal server error"})}}let p=(0,o.l)(n,"default"),m=(0,o.l)(n,"config"),g=new a.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/thrift/plans",pathname:"/api/thrift/plans",bundlePath:"",filename:""},userland:n})},5985:(t,e,r)=>{r.d(e,{$G:()=>a,qS:()=>n});let n=new(r(8770)).NhostClient({subdomain:"sbpnfqrsnvtyvkgldcco",region:"eu-central-1"});parseInt("5432");let a=async()=>{try{console.log("\uD83D\uDD0D Testing Nhost connection..."),console.log("\uD83D\uDCCD Nhost Config:",{subdomain:"sbpnfqrsnvtyvkgldcco",region:"eu-central-1",useNhost:"true"});let t=n.auth.isAuthenticated();console.log("\uD83D\uDD10 Current auth status:",t);let e=await fetch("https://sbpnfqrsnvtyvkgldcco.nhost.run/v1/graphql",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:`
          query {
            __typename
          }
        `})});if(e.ok)return console.log("✅ Nhost GraphQL endpoint is reachable"),{success:!0,message:"Nhost connection successful"};return console.error("❌ Nhost GraphQL endpoint error:",e.status,e.statusText),{success:!1,message:`HTTP ${e.status}: ${e.statusText}`}}catch(t){return console.error("❌ Nhost connection test failed:",t),{success:!1,message:t instanceof Error?t.message:"Unknown error"}}}},7153:(t,e)=>{var r;Object.defineProperty(e,"x",{enumerable:!0,get:function(){return r}}),function(t){t.PAGES="PAGES",t.PAGES_API="PAGES_API",t.APP_PAGE="APP_PAGE",t.APP_ROUTE="APP_ROUTE"}(r||(r={}))},1802:(t,e,r)=>{t.exports=r(145)}};var e=require("../../../webpack-api-runtime.js");e.C(t);var r=e(e.s=3930);module.exports=r})();