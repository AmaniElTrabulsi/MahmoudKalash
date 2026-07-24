"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


export default function AppointmentTimeSelector(
{
  selectedDay,
  selectedTime,
  setSelectedTime
}:{
  selectedDay:any;
  selectedTime:any;
  setSelectedTime:(time:any)=>void;
}

){


const [availableSlots,setAvailableSlots]=useState<any[]>([]);

const allSlots=[

{
start:"15:00:00",
end:"15:45:00",
label:"15:00 - 15:45"
},

{
start:"15:45:00",
end:"16:30:00",
label:"15:45 - 16:30"
},

{
start:"16:30:00",
end:"17:15:00",
label:"16:30 - 17:15"
},

{
start:"17:15:00",
end:"18:00:00",
label:"17:15 - 18:00"
}

];





useEffect(()=>{

if(selectedDay){

loadAvailableSlots();

}

},[selectedDay]);







async function loadAvailableSlots(){


const {data,error}=await supabase

.from("appointments")

.select("start_time")

.eq(
"appointment_date",
selectedDay.date
);





if(error){

console.log(error);

return;

}





const bookedTimes =
data?.map((item:any)=>
item.start_time
)
||
[];





const freeSlots =
allSlots.filter(
(slot)=>
!bookedTimes.includes(slot.start)
);





setAvailableSlots(freeSlots);


}









return (

<div
className="
mt-8
"
>


<h2
className="
text-lg
text-[#D6C08A]
mb-4
"
>
Choose Appointment Time
</h2>






{
availableSlots.length===0 &&

<p
className="
text-gray-400
text-sm
"
>
No available appointments for this day.
</p>

}







<div
className="
grid
grid-cols-2
gap-3
"
>


{

availableSlots.map((slot)=>(


<button

type="button"

key={slot.start}


onClick={()=>{

setSelectedTime(slot);

}}


className={`

h-16
rounded-xl
border
font-medium
text-sm
transition


${
selectedTime?.start===slot.start

?

"bg-[#BFA15F] text-black border-[#BFA15F]"

:

"bg-black border-[#BFA15F]/30 text-white"

}

`}


>

{slot.label}


</button>


))


}


</div>


</div>


);


}