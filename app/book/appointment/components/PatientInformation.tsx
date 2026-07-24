"use client";

import { useState } from "react";


export default function PatientInformation(
{
  onChange
}:{
  onChange:(data:any)=>void
}

){


const [firstName,setFirstName]=useState("");

const [lastName,setLastName]=useState("");

const [day,setDay]=useState("");

const [month,setMonth]=useState("");

const [year,setYear]=useState("");

const [phone,setPhone]=useState("");

const [medicalCoverage,setMedicalCoverage]=useState("");

const [otherCoverage,setOtherCoverage]=useState("");

const [insuranceProvider,setInsuranceProvider]=useState("");





function update(values:any){


const finalDay =
day && month && year
?
`${year}-${month}-${day}`
:
"";



onChange({

firstName,
lastName,

dateOfBirth:finalDay,

phone,

medicalCoverage:
values.medicalCoverage ?? medicalCoverage,

insuranceProvider,

otherCoverage

});


}








function changeFirstName(value:string){

setFirstName(value);

update({
firstName:value
});

}



function changeLastName(value:string){

setLastName(value);

update({
lastName:value
});

}







function changeCoverage(value:string){

setMedicalCoverage(value);


update({

medicalCoverage:value

});


}







return (

<div
className="
space-y-5
"
>





<div>

<label
className="
text-[#D6C08A]
text-sm
"
>
First Name
</label>


<input

className="
mt-2
w-full
h-14
bg-black
border
border-[#BFA15F]/30
rounded-xl
px-4
outline-none
"

placeholder="First Name"

value={firstName}

onChange={(e)=>
changeFirstName(e.target.value)
}

/>

</div>








<div>

<label
className="
text-[#D6C08A]
text-sm
"
>
Last Name
</label>


<input

className="
mt-2
w-full
h-14
bg-black
border
border-[#BFA15F]/30
rounded-xl
px-4
outline-none
"

placeholder="Last Name"

value={lastName}

onChange={(e)=>
changeLastName(e.target.value)
}

/>

</div>









<div>

<label
className="
text-[#D6C08A]
text-sm
"
>
Date of Birth
</label>



<div
className="
grid
grid-cols-3
gap-3
mt-2
"
>


<select

className="
h-14
bg-black
border
border-[#BFA15F]/30
rounded-xl
px-2
"

value={day}

onChange={(e)=>{

setDay(e.target.value);

update({});

}}

>

<option value="">
Day
</option>

{
Array.from(
{length:31},
(_,i)=>i+1
)
.map((d)=>(

<option
key={d}
value={String(d).padStart(2,"0")}
>
{d}
</option>

))

}


</select>






<select

className="
h-14
bg-black
border
border-[#BFA15F]/30
rounded-xl
px-2
"

value={month}

onChange={(e)=>{

setMonth(e.target.value);

update({});

}}

>

<option value="">
Month
</option>

{

Array.from(
{length:12},
(_,i)=>i+1
)

.map((m)=>(

<option
key={m}
value={String(m).padStart(2,"0")}
>

{m}

</option>

))

}


</select>







<select

className="
h-14
bg-black
border
border-[#BFA15F]/30
rounded-xl
px-2
"

value={year}

onChange={(e)=>{

setYear(e.target.value);

update({});

}}

>

<option value="">
Year
</option>


{

Array.from(
{length:100},
(_,i)=>2026-i
)

.map((y)=>(

<option
key={y}
value={y}
>

{y}

</option>

))

}


</select>


</div>


</div>









<div>

<label
className="
text-[#D6C08A]
text-sm
"
>
Phone Number
</label>



<div
className="
mt-2
flex
h-14
bg-black
border
border-[#BFA15F]/30
rounded-xl
overflow-hidden
"
>

<span
className="
flex
items-center
px-4
text-[#BFA15F]
"
>
+961
</span>


<input

className="
flex-1
bg-transparent
px-3
outline-none
"

placeholder="70 123456"

value={phone}

onChange={(e)=>{

setPhone(e.target.value);

update({
phone:e.target.value
});

}}

/>


</div>

</div>









<div>

<label
className="
text-[#D6C08A]
text-sm
"
>
Medical Coverage (Optional)
</label>


<div
className="
grid
grid-cols-2
gap-3
mt-3
"
>


{
[
"NSSF",
"Insurance",
"Self Payment",
"Other"
]
.map((item)=>(


<button

type="button"

key={item}

onClick={()=>changeCoverage(item)}

className={`
h-14
rounded-xl
border

${
medicalCoverage===item

?

"bg-[#BFA15F] text-black border-[#BFA15F]"

:

"bg-black border-[#BFA15F]/30"

}

`}

>

{item}

</button>


))

}


</div>


</div>









{
medicalCoverage==="Other" &&

<input

className="
w-full
h-14
bg-black
border
border-[#BFA15F]/30
rounded-xl
px-4
"

placeholder="Specify medical coverage"

value={otherCoverage}

onChange={(e)=>{

setOtherCoverage(e.target.value);

update({});

}}

/>

}









{
medicalCoverage==="Insurance" &&

<input

className="
w-full
h-14
bg-black
border
border-[#BFA15F]/30
rounded-xl
px-4
"

placeholder="Insurance Provider"

value={insuranceProvider}

onChange={(e)=>{

setInsuranceProvider(e.target.value);

update({});

}}

/>

}



</div>

);


}