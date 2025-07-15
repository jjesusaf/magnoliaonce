"use client";
import Image from "next/image";

export default function CommingSoon() {
  return (
    <div className="relative w-fit flex flex-col items-center justify-center">
      <Image
        src="/images/comming.svg"
        alt="Comming Soon"
        width={100}
        height={100}
        className="max-w-[565px] w-full"
      />
    </div>
  );
}
