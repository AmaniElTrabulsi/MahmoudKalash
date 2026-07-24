"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";


export default function DashboardPage(){


  const router = useRouter();


  const [patients,setPatients] = useState(0);

  const [todayAppointments,setTodayAppointments] = useState<any[]>([]);

  const [pending,setPending] = useState(0);

  const [loading,setLoading] = useState(true);







  useEffect(()=>{

    loadDashboard();

  },[]);








  async function loadDashboard(){


    setLoading(true);



    // Patients count

    const {count:patientCount}=await supabase

    .from("patients")

    .select("*",{count:"exact",head:true});



    setPatients(patientCount || 0);








    // Today date

    const today =

    new Date()

    .toISOString()

    .split("T")[0];








    // Today's appointments

    const {data:appointments}=await supabase

    .from("appointments")

    .select(`

      id,

      appointment_date,

      start_time,

      end_time,

      status,

      patients(

        first_name,

        last_name,

        phone

      )

    `)

    .eq(

      "appointment_date",

      today

    )

    .order(

      "start_time"

    );



    setTodayAppointments(

      appointments || []

    );









    // Pending appointments count

    const {count:pendingCount}=await supabase

    .from("appointments")

    .select("*",{count:"exact",head:true})

    .eq(

      "status",

      "Pending"

    );



    setPending(

      pendingCount || 0

    );



    setLoading(false);


  }













  if(loading){

    return(

      <main

      className="
      min-h-screen
      bg-[#080808]
      text-white
      flex
      items-center
      justify-center
      "

      >

      <DashboardMenu />

      Loading...

      </main>

    );

  }












return (

<main

className="
min-h-screen
bg-[#080808]
text-white
p-6
pt-24
"

>


<DashboardMenu />







<h1

className="
text-3xl
font-bold
text-[#BFA15F]
"

>

Dr. Mahmoud Kalash Dashboard

</h1>





<p className="text-gray-400 mt-2">

Welcome back

</p>









<div

className="
grid
grid-cols-1
md:grid-cols-3
gap-5
mt-8
"

>






{/* Patients */}

<div

onClick={()=>router.push("/dashboard/patients")}

className="
bg-[#171717]
border
border-[#BFA15F]/30
rounded-xl
p-6
cursor-pointer
hover:border-[#BFA15F]
transition
"

>

<p className="text-gray-400">

Patients

</p>


<p className="text-4xl font-bold text-[#BFA15F]">

{patients}

</p>


<p className="text-sm text-gray-500 mt-2">

Click to view

</p>


</div>









{/* Pending Appointments */}

<div

onClick={()=>router.push("/dashboard/appointments")}

className="
bg-[#171717]
border
border-[#BFA15F]/30
rounded-xl
p-6
cursor-pointer
hover:border-[#BFA15F]
transition
"

>

<p className="text-gray-400">

Pending Appointments

</p>


<p className="text-4xl font-bold text-[#BFA15F]">

{pending}

</p>


<p className="text-sm text-gray-500 mt-2">

Click to view

</p>


</div>









{/* Today's Visits */}

<div
  onClick={() => router.push("/dashboard/appointments")}
className="
bg-[#171717]
border
border-[#BFA15F]/30
rounded-xl
p-6
"

>

<p className="text-gray-400">

Today's Visits

</p>


<p className="text-4xl font-bold text-[#BFA15F]">

{todayAppointments.length}

</p>


</div>





</div>









<section className="mt-10">



<h2

className="
text-2xl
font-bold
text-[#D6C08A]
mb-5
"

>

Today's Appointments

</h2>








{
todayAppointments.length===0

?

<p className="text-gray-400">

No appointments today

</p>


:


<div className="space-y-4">



{
todayAppointments.map((item:any)=>(



<div

key={item.id}

className="
bg-[#171717]
border
border-[#BFA15F]/20
rounded-xl
p-5
"

>





<p className="text-xl font-bold">

{item.patients?.first_name}

{" "}

{item.patients?.last_name}

</p>







<p className="text-gray-400 mt-2">

{item.start_time.substring(0,5)}

-

{item.end_time.substring(0,5)}

</p>







<p className="text-[#BFA15F] mt-2">

{item.status}

</p>






</div>



))

}



</div>



}





</section>







</main>


);


}