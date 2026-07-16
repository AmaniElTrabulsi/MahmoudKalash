import { supabase } from "@/lib/supabase";
import Link from "next/link";


export default async function BookPage() {


  const { data: doctor, error } = await supabase
    .from("doctor_profile")
    .select("*")
    .single();



  if (error || !doctor) {

    return (

      <main className="
      min-h-screen
      bg-[#080808]
      text-white
      flex
      items-center
      justify-center
      ">

        <h1 className="text-[#BFA15F] text-2xl">
          Clinic information is not available
        </h1>

      </main>

    );

  }



  return (

    <main
      className="
      min-h-screen
      bg-[#080808]
      text-[#F5F5F5]
      flex
      items-center
      justify-center
      p-6
      "
    >


      <div
        className="
        max-w-xl
        text-center
        bg-[#171717]
        rounded-2xl
        border
        border-[#BFA15F]/30
        p-10
        shadow-lg
        "
      >


        <h1
          className="
          text-4xl
          font-bold
          text-[#BFA15F]
          "
        >
          {doctor.welcome_title}
        </h1>



        <h2
          className="
          mt-4
          text-2xl
          text-[#D6C08A]
          "
        >
          {doctor.specialization}
        </h2>



        <p
          className="
          mt-6
          text-[#A7A7A7]
          leading-relaxed
          "
        >
          {doctor.welcome_message}
        </p>




        <Link href="/book/appointment">

          <button
            className="
            mt-8
            bg-[#BFA15F]
            text-black
            px-8
            py-3
            rounded-lg
            font-bold
            hover:bg-[#D6C08A]
            transition
            "
          >
            Book an Appointment
          </button>

        </Link>



      </div>


    </main>

  );

}