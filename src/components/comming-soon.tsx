"use client";
import Image from "next/image";

export default function CommingSoon() {
  return (
    <div className="relative w-fit flex flex-col items-center justify-center">
      <Image
        src="/images/coming.svg"
        alt="Comming Soon"
        width={100}
        height={100}
        className="max-w-[565px] w-full"
      />
      <Image
        src="/images/soon.svg"
        alt="Comming Soon"
        width={100}
        height={100}
        className="max-w-[387px] w-full absolute top-[100px]"
      />
      <p className="text-lg">We are working on something great. Stay tuned!</p>
    </div>
  );
}
