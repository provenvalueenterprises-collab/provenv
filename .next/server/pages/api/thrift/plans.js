"use strict";(()=>{var t={};t.id=6786,t.ids=[6786],t.modules={1649:t=>{t.exports=require("next-auth/react")},145:t=>{t.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(t,e)=>{Object.defineProperty(e,"l",{enumerable:!0,get:function(){return function t(e,a){return a in e?e[a]:"then"in e&&"function"==typeof e.then?e.then(e=>t(e,a)):"function"==typeof e&&"default"===a?e:void 0}}})},4652:(t,e,a)=>{a.r(e),a.d(e,{config:()=>p,default:()=>m,routeModule:()=>_});var r={};a.r(r),a.d(r,{default:()=>d});var n=a(1802),s=a(7153),o=a(6249),i=a(1649),u=a(946);async function d(t,e){let a=await (0,i.getSession)({req:t});return a?"POST"===t.method?l(t,e,a.user.id):"GET"===t.method?c(t,e,a.user.id):e.status(405).json({message:"Method not allowed"}):e.status(401).json({message:"Unauthorized"})}async function l(t,e,a){let{planType:r,dailyAmount:n,startDate:s}=t.body;if(!r||!n||!s)return e.status(400).json({message:"Missing required fields"});let o={basic:{duration:30,interestRate:.05},standard:{duration:60,interestRate:.08},premium:{duration:90,interestRate:.12}}[r];if(!o)return e.status(400).json({message:"Invalid plan type"});try{let t=new Date(s),i=new Date(t);i.setDate(i.getDate()+o.duration);let d=n*o.duration,l=d*o.interestRate,{data:c,error:m}=await u.qS.graphql.request(`
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
    `,{userId:a,planType:r,dailyAmount:parseFloat(n),startDate:s,endDate:i.toISOString().split("T")[0],totalAmount:d,expectedReturn:l,maturityAmount:d+l});if(m)return console.error("Error creating thrift plan:",m),e.status(500).json({message:"Failed to create thrift plan"});e.status(201).json({message:"Thrift plan created successfully",thriftPlan:c.insert_thrift_plans_one})}catch(t){console.error("Thrift plan creation error:",t),e.status(500).json({message:"Internal server error"})}}async function c(t,e,a){try{let{data:t,error:r}=await u.qS.graphql.request(`
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
    `,{userId:a});if(r)return console.error("Error fetching thrift plans:",r),e.status(500).json({message:"Failed to fetch thrift plans"});let n=t.thrift_plans.map(t=>{let e=t.contributions_aggregate.aggregate.count||0,a=t.contributions_aggregate.aggregate.sum?.amount||0,r=t.total_amount>0?a/t.total_amount*100:0;return{...t,contributionCount:e,totalContributed:a,progress:Math.round(100*r)/100}});e.status(200).json({thriftPlans:n})}catch(t){console.error("Error fetching thrift plans:",t),e.status(500).json({message:"Internal server error"})}}let m=(0,o.l)(r,"default"),p=(0,o.l)(r,"config"),_=new n.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/thrift/plans",pathname:"/api/thrift/plans",bundlePath:"",filename:""},userland:r})},946:(t,e,a)=>{a.d(e,{qS:()=>r});let r=new(require("@nhost/nhost-js")).NhostClient({subdomain:"sbpnfqrsnvtyvkgldcco",region:"eu-central-1"});parseInt("5432")},7153:(t,e)=>{var a;Object.defineProperty(e,"x",{enumerable:!0,get:function(){return a}}),function(t){t.PAGES="PAGES",t.PAGES_API="PAGES_API",t.APP_PAGE="APP_PAGE",t.APP_ROUTE="APP_ROUTE"}(a||(a={}))},1802:(t,e,a)=>{t.exports=a(145)}};var e=require("../../../webpack-api-runtime.js");e.C(t);var a=e(e.s=4652);module.exports=a})();