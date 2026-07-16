"use client";

import { useState } from "react";


export default function AppointmentBookingPage() {

  const [selectedSlot, setSelectedSlot] = useState("");

  const slots = [
    "15:00 - 15:45",
    "15:45 - 16:30",
    "16:30 - 17:15",
    "17:15 - 18:00",
  ];


  return (

    <main
      className="
      min-h-screen
      bg-[#080808]
      text-[#F5F5F5]
      flex
      justify-center
      px-4
      py-8
      "
    >

      <div
        className="
        w-full
        max-w-xl
        bg-[#171717]
        border
        border-[#BFA15F]/30
        rounded-2xl
        p-6
        sm:p-8
        shadow-lg
        "
      >


        <h1
          className="
          text-3xl
          sm:text-4xl
          font-bold
          text-center
          text-[#BFA15F]
          "
        >
          Schedule Your Visit
        </h1>


        <p
          className="
          text-center
          text-[#A7A7A7]
          mt-3
          "
        >
          Please enter your information
        </p>



        <div
          className="
          mt-8
          space-y-5
          "
        >


          <div>

            <label className="text-[#D6C08A]">
              First Name
            </label>

            <input
              className="
              mt-2
              w-full
              bg-black
              border
              border-[#BFA15F]/30
              rounded-xl
              p-4
              outline-none
              "
              placeholder="First Name"
            />

          </div>




          <div>

            <label className="text-[#D6C08A]">
              Last Name
            </label>

            <input
              className="
              mt-2
              w-full
              bg-black
              border
              border-[#BFA15F]/30
              rounded-xl
              p-4
              outline-none
              "
              placeholder="Last Name"
            />

          </div>




          <div>

            <label className="text-[#D6C08A]">
              Date of Birth
            </label>

            <input
              type="date"
              className="
              mt-2
              w-full
              bg-black
              border
              border-[#BFA15F]/30
              rounded-xl
              p-4
              outline-none
              text-white
              "
            />

          </div>





          <div>

            <label className="text-[#D6C08A]">
              Phone Number
            </label>


            <div
              className="
              mt-2
              flex
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
                p-4
                outline-none
                "
                placeholder="70 123 456"
              />

            </div>


          </div>






          <div>

            <label className="text-[#D6C08A]">
              Payment Type (Optional)
            </label>


            <select
              className="
              mt-2
              w-full
              bg-black
              border
              border-[#BFA15F]/30
              rounded-xl
              p-4
              "
            >

              <option>
                Select option
              </option>

              <option>
                Insurance
              </option>

              <option>
                Cash
              </option>

              <option>
                Other
              </option>


            </select>

          </div>






          <div>

            <label className="text-[#D6C08A]">
              Insurance Provider (Optional)
            </label>


            <input
              className="
              mt-2
              w-full
              bg-black
              border
              border-[#BFA15F]/30
              rounded-xl
              p-4
              outline-none
              "
              placeholder="Insurance company"
            />


          </div>



        </div>





        <div className="mt-10">


          <h2
            className="
            text-xl
            text-[#D6C08A]
            mb-4
            "
          >
            Choose Appointment Time
          </h2>



          <div
            className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
            "
          >

            {slots.map((slot)=>(

              <button

                key={slot}

                onClick={()=>setSelectedSlot(slot)}

                className={`
                p-4
                rounded-xl
                border
                transition

                ${
                  selectedSlot === slot
                  ?
                  "bg-[#BFA15F] text-black border-[#BFA15F]"
                  :
                  "bg-black border-[#BFA15F]/30"
                }

                `}
              >

                {slot}

              </button>

            ))}


          </div>


        </div>






        <button

          className="
          mt-10
          w-full
          bg-[#BFA15F]
          text-black
          py-4
          rounded-xl
          font-bold
          text-lg
          hover:bg-[#D6C08A]
          transition
          "

        >

          Confirm Booking

        </button>




      </div>


    </main>

  );
}