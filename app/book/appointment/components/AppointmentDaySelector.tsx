"use client";

import { useEffect, useState } from "react";


export default function AppointmentDaySelector({
selectedDay,
setSelectedDay
}:{
selectedDay:any;
setSelectedDay:(day:any)=>void;
}){


const [days,setDays]=useState<any[]>([]);



useEffect(()=>{

const result:any[]=[];

let current=new Date();


while(result.length < 4){

current = new Date(current);

current.setDate(
current.getDate()+1
);


const day=current.getDay();


if(day>=1 && day<=4){

result.push({

date:
current.toISOString()
.split("T")[0],


label:
current.toLocaleDateString(
"en-US",
{
weekday:"short",
month:"short",
day:"numeric"
}
)

});

}


}


setDays(result);


},[]);






return (

<div className="mt-8">


<h2
className="
text-[#D6C08A]
mb-4
"
>
Choose Day
</h2>



<div
className="
grid
grid-cols-2
gap-3
"
>


{
days.map((day)=>(


<button

type="button"

key={day.date}

onClick={()=>setSelectedDay(day)}

className={`
h-16
rounded-xl
border
text-sm
font-bold

${
selectedDay?.date===day.date

?

"bg-[#BFA15F] text-black"

:

"bg-black text-white border-[#BFA15F]/30"

}

`}

>

{day.label}

</button>


))

}


</div>


</div>


);


}